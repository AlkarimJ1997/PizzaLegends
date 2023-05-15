import { Message } from '../Message';
import { SubmissionMenu } from './SubmissionMenu';
import { ReplacementMenu } from './ReplacementMenu';
import { wait } from '../../utils/utils';

export class BattleEvent {
	event: BattleEventType;
	battle: Battle;

	constructor(event: BattleEventType, battle: Battle) {
		this.event = event;
		this.battle = battle;
	}

	message(resolve: VoidResolve) {
		const textLines =
			this.event.textLines?.map(line => {
				return {
					...line,
					string: line.string
						.replace('{CASTER}', this.event.caster?.name || '')
						.replace('{TARGET}', this.event.target?.name || '')
						.replace('{ACTION}', this.event.action?.name || ''),
				};
			}) || [];

		const message = new Message({
			textLines,
			onComplete: () => {
				resolve();
			},
		});

		message.init(this.battle.element);
	}

	async stateChange(resolve: VoidResolve) {
		let damage = this.event.damage;
		const { caster, target, recover, status } = this.event;
		const who = this.event.onCaster ? caster : target;

		if (damage) {
			if (target && target.hp && target.status?.type !== 'protected') {
				// Apply damage based on the caster's level
				damage += Math.floor((damage * (caster?.level || 1)) / 10);

				target.update({ hp: target.hp - damage });
				target.pizzaElement.classList.add('blinking');
			}
		}

		if (recover) {
			if (who && who.hp) {
				const newHp = Math.min(who.hp + recover, who.maxHp);
				who.update({ hp: newHp });
			}
		}

		if (status) {
			who?.update({
				status: { ...status },
			});
		}

		if (status === null) {
			who?.update({
				status: null,
			});
		}

		// Wait a little bit, update teams, then stop blinking the Pizza
		await wait(600);

		this.battle.playerTeam.update();
		this.battle.enemyTeam.update();

		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}

	submissionMenu(resolve: SubmissionResolve) {
		const { caster, enemy } = this.event;
		const { items, combatants } = this.battle;
		const possibleCombatants = Object.values(combatants) as Combatant[];

		if (!caster || !enemy) return resolve();

		const menu = new SubmissionMenu({
			caster,
			enemy,
			items,
			replacements: possibleCombatants.filter(c => {
				const sameTeam = c.team === caster.team;
				const notCaster = c.id !== caster.id;
				const alive = (c.hp as number) > 0;

				return sameTeam && notCaster && alive;
			}),
			onComplete: submission => {
				resolve(submission as Submission);
			},
		});

		menu.init(this.battle.element);
	}

	replacementMenu(resolve: ReplacementResolve) {
		const replacements = Object.values(this.battle.combatants) as Combatant[];

		const menu = new ReplacementMenu({
			replacements: replacements.filter(c => {
				return c.team === this.event.team && (c.hp as number) > 0;
			}),
			onComplete: replacement => {
				resolve(replacement as Combatant);
			},
		});

		menu.init(this.battle.element);
	}

	async replace(resolve: VoidResolve) {
		const { replacement } = this.event;
		const prevCombatantId = this.battle.activeCombatants[replacement?.team];
		const prevCombatant = this.battle.combatants[prevCombatantId];

		// Clear out the old combatant and update the DOM
		this.battle.activeCombatants[replacement?.team] = null;
		prevCombatant?.update();

		// Wait a little bit so the player can see it
		await wait(400);

		// Add the new combatant and update the DOM
		this.battle.activeCombatants[replacement?.team] = replacement?.id;
		replacement?.update();

		// Wait a little bit so the player can see it, then resolve
		await wait(400);

		this.battle.playerTeam.update();
		this.battle.enemyTeam.update();

		resolve();
	}

	giveXp(resolve: VoidResolve) {
		let amount = this.event.xp;
		const { combatant } = this.event;

		const step = () => {
			if (!amount || !combatant) return resolve();

			if (amount > 0) {
				amount -= 1;
				(combatant.xp as number) += 1;

				// Check if we leveled up
				if (combatant.xp === combatant.maxXp) {
					combatant.xp = 0;
					combatant.maxXp = 100;
					combatant.level += 1;
					combatant.maxHp += 10;
				}

				combatant.update();
				requestAnimationFrame(step);
				return;
			}

			resolve();
		};

		requestAnimationFrame(step);
	}

	animation(resolve: VoidResolve) {
		if (!this.event.animation) return resolve();

		const fn = window.BattleAnimations[this.event.animation];

		fn(this.event, resolve);
	}

	init(resolve: Resolve) {
		const eventHandlers: EventHandler = {
			message: this.message,
			stateChange: this.stateChange,
			submissionMenu: this.submissionMenu,
			replacementMenu: this.replacementMenu,
			replace: this.replace,
			giveXp: this.giveXp,
			animation: this.animation,
		};

		const handler = eventHandlers[this.event.type as keyof EventHandler];

		handler?.call(this, resolve as () => void);
	}
}

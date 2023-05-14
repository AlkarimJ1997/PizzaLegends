import { Message } from '../Message';
import { SubmissionMenu } from './SubmissionMenu';
import { ReplacementMenu } from './ReplacementMenu';
import { wait } from '../../utils/utils';

type VoidResolve = () => void;
type SubmissionResolve = (submission?: Submission) => void;
type ReplacementResolve = (replacement: Combatant) => void;

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
		const { caster, target, damage, recover, status } = this.event;
		const who = this.event.onCaster ? caster : target;

		if (damage) {
			if (target && target.status?.type !== 'protected') {
				target.update({ hp: target.hp - damage });
				target.pizzaElement.classList.add('blinking');
			}
		}

		if (recover) {
			if (who) {
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

		// Wait a little bit, then stop blinking the Pizza
		await wait(600);
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
				const alive = c.hp > 0;

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
				return c.team === this.event.team && c.hp > 0;
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
		resolve();
	}

	animation(resolve: VoidResolve) {
		if (!this.event.animation) return resolve();

		const fn = window.BattleAnimations[this.event.animation];

		fn(this.event, resolve);
	}

	init(resolve: VoidResolve | SubmissionResolve | ReplacementResolve) {
		switch (this.event.type) {
			case 'message':
				this.message(resolve as VoidResolve);
				break;
			case 'stateChange':
				this.stateChange(resolve as VoidResolve);
				break;
			case 'submissionMenu':
				this.submissionMenu(resolve as SubmissionResolve);
				break;
			case 'replacementMenu':
				this.replacementMenu(resolve as ReplacementResolve);
				break;
			case 'replace':
				this.replace(resolve as VoidResolve);
				break;
			case 'animation':
				this.animation(resolve as VoidResolve);
				break;
			default:
				break;
		}
	}
}

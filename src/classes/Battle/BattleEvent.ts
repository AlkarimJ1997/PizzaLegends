import { Message } from '../Message';
import { Battle } from './Battle';
import { SubmissionMenu } from './SubmissionMenu';
import { BattleEventType, Submission } from '../../models/types';
import { wait } from '../../utils/utils';

type VoidResolve = () => void;
type SubmissionResolve = (submission?: Submission) => void;
type BattleEventMethod = (resolve: VoidResolve | SubmissionResolve) => void;

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
		const { caster, target, damage, recover } = this.event;

		if (damage) {
			target?.update({ hp: target.hp - damage });
			target?.pizzaElement.classList.add('blinking');
		}

		if (recover) {
			const who = this.event.onCaster ? caster : target;

			if (who) {
				const newHp = Math.min(who.hp + recover, who.maxHp);
				who.update({ hp: newHp });
			}
		}

		// Wait a little bit, then stop blinking the Pizza
		await wait(600);
		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}

	submissionMenu(resolve: SubmissionResolve) {
		if (!this.event.caster || !this.event.enemy) return resolve();

		const menu = new SubmissionMenu({
			caster: this.event.caster,
			enemy: this.event.enemy,
			onComplete: submission => {
				// submission { what move to use, who to use it on }
				resolve(submission);
			},
		});

		menu.init(this.battle.element);
	}

	animation(resolve: VoidResolve) {
		if (!this.event.animation) return resolve();

		const fn = window.BattleAnimations[this.event.animation];

		fn(this.event, resolve);
	}

	init(resolve: VoidResolve | SubmissionResolve) {
		const eventHandlers: Record<string, BattleEventMethod> = {
			message: this.message.bind(this),
			stateChange: this.stateChange.bind(this),
			submissionMenu: this.submissionMenu.bind(this),
			animation: this.animation.bind(this),
		};

		eventHandlers[this.event.type](resolve);
	}
}

import { Message } from '../Message';
import { Combatant } from './Combatant';
import { Battle } from './Battle';
import { SubmissionMenu } from './SubmissionMenu';
import { BattleEventType, Submission } from '../../models/types';
import { wait } from '../../utils/utils';

type Resolve = (submission?: Submission) => void;

export class BattleEvent {
	event: BattleEventType;
	battle: Battle;

	constructor(event: BattleEventType, battle: Battle) {
		this.event = event;
		this.battle = battle;
	}

	message(resolve: Resolve) {
		const textLines =
			this.event.textLines?.map(line => {
				return {
					...line,
					string: line.string
						.replace('{CASTER}', this.event.caster?.name)
						.replace('{TARGET}', this.event.target?.name)
						.replace('{ACTION}', this.event.action?.name),
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

	async stateChange(resolve: Resolve) {
		const { caster, target, damage } = this.event;

		if (damage) {
			// Modify the target to have less HP
			target?.update({
				hp: target.hp - damage,
			});

			// Start blinking the Pizza
			target?.pizzaElement.classList.add('blinking');
		}

		// Wait a little bit
		await wait(600);

		// Stop blinking the Pizza
		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}

	submissionMenu(resolve: Resolve) {
		const menu = new SubmissionMenu({
			caster: this.event.caster as Combatant,
			enemy: this.event.enemy as Combatant,
			onComplete: submission => {
				// submission { what move to use, who to use it on }
				resolve(submission);
			},
		});

		menu.init(this.battle.element);
	}

	animation(resolve: Resolve) {
		if (!this.event.animation) return resolve();

		const fn = window.BattleAnimations[this.event.animation];

		fn(this.event, resolve);
	}

	init(resolve: Resolve) {
		this[this.event.type](resolve);
	}
}

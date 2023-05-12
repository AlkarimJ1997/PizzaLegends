import { Message } from '../Message';
import { Combatant } from './Combatant';
import { Battle } from './Battle';
import { SubmissionMenu } from './SubmissionMenu';
import { BattleEventType, SubmissionEvent } from '../../models/types';

type Resolve = (submission?: SubmissionEvent) => void;

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

	init(resolve: Resolve) {
		this[this.event.type](resolve);
	}
}

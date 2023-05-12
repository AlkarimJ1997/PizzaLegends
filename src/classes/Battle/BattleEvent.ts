import { Message } from '../Message';
import { SubmissionMenu } from './SubmissionMenu';

export class BattleEvent {
	constructor(event, battle) {
		this.event = event;
		this.battle = battle;
	}

	message(resolve) {
		const textLines = this.event.textLines.map(line => {
			return {
				...line,
				string: line.string
					.replace('{CASTER}', this.event.caster?.name)
					.replace('{TARGET}', this.event.target?.name)
					.replace('{ACTION}', this.event.action?.name),
			};
		});

		const message = new Message({
			textLines,
			onComplete: () => {
				resolve();
			},
		});

		message.init(this.battle.element);
	}

	submissionMenu(resolve) {
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

	init(resolve) {
		this[this.event.type](resolve);
	}
}

import { Combatant } from './Combatant';
import { Submission } from '../../models/types';
import '../../styles/SubmissionMenu.css';

type SubmissionMenuConfig = {
	caster: Combatant;
	enemy: Combatant;
	onComplete: (submission: Submission) => void;
};

export class SubmissionMenu {
	caster: Combatant;
	enemy: Combatant;
	onComplete: (submission: Submission) => void;

	constructor({ caster, enemy, onComplete }: SubmissionMenuConfig) {
		this.caster = caster;
		this.enemy = enemy;
		this.onComplete = onComplete;
	}

	decide() {
		this.onComplete({
			action: window.Actions[this.caster.actions[0]],
			target: this.enemy,
		});
	}

	init(container: HTMLDivElement) {
		this.decide();
	}
}

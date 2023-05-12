import '../../styles/SubmissionMenu.css';

export class SubmissionMenu {
	constructor({ caster, enemy, onComplete }) {
		this.caster = caster;
		this.enemy = enemy;
		this.onComplete = onComplete;
	}

	decide() {
    console.log(window.Actions);
    console.log(this.caster);

		this.onComplete({
			action: window.Actions[this.caster.actions[0]],
			target: this.enemy,
		});
	}

	init(container) {
		this.decide();
	}
}

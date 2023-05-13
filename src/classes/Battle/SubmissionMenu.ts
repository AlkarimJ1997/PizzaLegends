import { Combatant } from './Combatant';
import { KeyboardMenu } from '../KeyboardMenu';
import { Submission, Action } from '../../models/types';
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

	keyboardMenu!: KeyboardMenu;

	constructor({ caster, enemy, onComplete }: SubmissionMenuConfig) {
		this.caster = caster;
		this.enemy = enemy;
		this.onComplete = onComplete;
	}

	getPages() {
		const backOption = {
			label: 'Go Back',
			description: 'Return to previous page',
			handler: () => {
				this.keyboardMenu.setOptions(this.getPages().root);
			},
            right: () => {
                return '🔙';
            }
		};

		return {
			root: [
				{
					label: 'Attack',
					description: 'Choose an attack',
					handler: () => {
						this.keyboardMenu.setOptions(this.getPages().attacks);
					},
					right: () => {
						return '💥';
					},
				},
				{
					label: 'Items',
					description: 'Use an item',
					handler: () => {
						this.keyboardMenu.setOptions(this.getPages().items);
					},
					right: () => {
						return '🎒';
					},
				},
				{
					label: 'Swap',
					description: 'Swap out your current pizza',
					handler: () => {
						// Do something when chosen
					},
                    right: () => {
                        return '🔄';
                    }
				},
			],
			attacks: [
				...this.caster.actions.map(attackName => {
					const action = window.Actions[attackName];

					return {
						label: action.name,
						description: action.description,
						handler: () => {
							this.menuSubmit(action);
						},
                        right: () => {
                            return action.icon;
                        }
					};
				}),
				backOption,
			],
			items: [
				// Items go here...
				backOption,
			],
		};
	}

	menuSubmit(action: Action, instanceId: number | null = null) {
		this.keyboardMenu?.end();

		this.onComplete({
			action,
			target: action.targetType === 'friendly' ? this.caster : this.enemy,
		});
	}

	decide() {
		this.menuSubmit(window.Actions[this.caster.actions[0]]);
	}

	showMenu(container: HTMLDivElement) {
		this.keyboardMenu = new KeyboardMenu();
		this.keyboardMenu.init(container);
		this.keyboardMenu.setOptions(this.getPages().root);
	}

	init(container: HTMLDivElement) {
		if (this.caster.isPlayerControlled) {
			this.showMenu(container);
			return;
		}

		this.decide();
	}
}

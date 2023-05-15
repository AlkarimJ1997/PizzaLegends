import { KeyboardMenu } from '../KeyboardMenu';
import '../../styles/SubmissionMenu.css';

type SubmissionMenuConfig = {
	caster: Combatant;
	enemy: Combatant;
	replacements: Combatant[];
	onComplete: (submission: Submission | Replacement) => void;
	items: Item[];
};

type QuantityMap = {
	[key: string]: MappedItem;
};

export class SubmissionMenu {
	caster: Combatant;
	enemy: Combatant;
	replacements: Combatant[];
	onComplete: (submission: Submission | Replacement) => void;
	items: MappedItem[];

	keyboardMenu!: KeyboardMenu;

	constructor({
		caster,
		enemy,
		replacements,
		onComplete,
		items,
	}: SubmissionMenuConfig) {
		this.caster = caster;
		this.enemy = enemy;
		this.replacements = replacements;
		this.onComplete = onComplete;

		const quantityMap: QuantityMap = {};

		items.forEach(item => {
			if (item.team !== caster.team) return;

			const existing = quantityMap[item.actionId];

			if (existing) {
				existing.quantity += 1;
			} else {
				quantityMap[item.actionId] = {
					actionId: item.actionId,
					instanceId: item.instanceId,
					quantity: 1,
				};
			}
		}, {});

		this.items = Object.values(quantityMap);
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
			},
		};

		return {
			root: [
				{
					label: 'Attack',
					description: 'Choose an attack',
					handler: () => {
						this.keyboardMenu.setOptions(this.getPages().attacks as Page[]);
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
						this.keyboardMenu.setOptions(this.getPages().replacements);
					},
					right: () => {
						return '🔄';
					},
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
						},
					};
				}),
				backOption,
			],
			items: [
				...this.items.map(item => {
					const action = window.Actions[item.actionId];

					return {
						label: action.name,
						description: action.description,
						handler: () => {
							this.menuSubmit(action, item.instanceId);
						},
						right: () => {
							return `x${item.quantity}`;
						},
					};
				}),
				backOption,
			],
			replacements: [
				...this.replacements.map(replacement => {
					return {
						label: replacement.name,
						description: replacement.description,
						handler: () => {
							this.menuSubmitReplacement(replacement);
						},
						right: () => {
							const iconImg = document.createElement('img');

							iconImg.src = replacement.icon;
							iconImg.alt = replacement.type;

							return iconImg.outerHTML;
						},
					};
				}),
				backOption,
			],
		};
	}

	menuSubmitReplacement(replacement: Combatant) {
		this.keyboardMenu?.end();
		this.onComplete({ replacement });
	}

	menuSubmit(action: Action, instanceId?: string) {
		this.keyboardMenu?.end();

		this.onComplete({
			action,
			target: action.targetType === 'friendly' ? this.caster : this.enemy,
			instanceId: instanceId || '',
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

import { wait } from '../utils/utils';
import { KeyPressListener } from './KeyPressListener';
import { KeyboardMenu } from './KeyboardMenu';
import '../styles/Menus.css';

export class PauseMenu {
	onComplete: () => void;

	element!: HTMLDivElement;
	keyboardMenu: KeyboardMenu | null = null;
	esc: KeyPressListener | null = null;

	constructor({ onComplete }: { onComplete: () => void }) {
		this.onComplete = onComplete;
	}

	getOptions(pageKey: string) {
		const { playerState, Pizzas } = window;

		// Case 1: Show options for the root page
		if (pageKey === 'root') {
			return [
				{
					label: 'Pizzas',
					description: 'Manage your pizzas',
					handler: () => {
						this.keyboardMenu?.setOptions(this.getOptions('pizzas'));
					},
					right: () => '🍕',
				},
				{
					label: 'Save',
					description: 'Save your progress',
					handler: () => {
						// We'll come back to this
					},
					right: () => '💾',
				},
				{
					label: 'Close',
					description: 'Close the pause menu',
					handler: () => this.close(),
					right: () => '❎',
				},
			];
		}

		// Case 2: Show options for the Pizza page
		if (pageKey === 'pizzas') {
			const lineupPizzas = playerState.lineup.map((id: string) => {
				const { pizzaId } = playerState.pizzas[id];
				const base = Pizzas[pizzaId];

				return {
					label: base.name,
					description: base.description,
					handler: () => {
						this.keyboardMenu?.setOptions(this.getOptions(id));
					},
					right: () => {
						return `<img src='${base.icon}' alt='${base.name}' />`;
					},
				};
			});

			return [
				...lineupPizzas,
				{
					label: 'Back',
					description: 'Go back to the previous menu',
					handler: () => {
						this.keyboardMenu?.setOptions(this.getOptions('root'));
					},
					right: () => '🔙',
				},
			];
		}

		// Case 3: Show options for one Pizza (specific ID)
		const inactiveIds = Object.keys(playerState.pizzas).filter((id: string) => {
			return !playerState.lineup.includes(id);
		});

		const inactivePizzas = inactiveIds.map((id: string) => {
			const { pizzaId } = playerState.pizzas[id];
			const base = Pizzas[pizzaId];

			return {
				label: `Swap for ${base.name}`,
				description: base.description,
				handler: () => {
					playerState.swapLineup(pageKey, id);
					this.keyboardMenu?.setOptions(this.getOptions('root'));
				},
				right: () => {
					return `<img src='${base.icon}' alt='${base.name}' />`;
				},
			};
		});

		return [
			...inactivePizzas,
			{
				label: 'Move to front',
				description: 'Move this pizza to the front of the line',
				handler: () => {
					playerState.moveToFront(pageKey);
					this.keyboardMenu?.setOptions(this.getOptions('root'));
				},
				right: () => '🔼',
			},
			{
				label: 'Back',
				description: 'Go back to the previous menu',
				handler: () => {
					this.keyboardMenu?.setOptions(this.getOptions('root'));
				},
				right: () => '🔙',
			},
		];
	}

	createElement() {
		this.element = document.createElement('div');
        this.element.classList.add('overlay-menu');
		this.element.classList.add('pause-menu');

		this.element.innerHTML = `
            <h2>Pause Menu</h2>
        `;
	}

	close() {
		this.esc?.unbind();
		this.keyboardMenu?.end();
		this.element.remove();
		this.onComplete();
	}

	async init(container: HTMLDivElement) {
		this.createElement();

		this.keyboardMenu = new KeyboardMenu({
			descriptionContainer: container,
		});
		this.keyboardMenu.init(this.element);
		this.keyboardMenu.setOptions(this.getOptions('root'));

		container.appendChild(this.element);

		// Close Pause Menu on Escape
		wait(200);
		this.esc = new KeyPressListener('Escape', () => {
			this.close();
		});
	}
}

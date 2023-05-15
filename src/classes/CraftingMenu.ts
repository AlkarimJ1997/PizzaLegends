import { KeyboardMenu } from './KeyboardMenu';

type CraftingMenuConfig = {
	pizzas: string[];
	onComplete: () => void;
};

export class CraftingMenu {
	pizzas: string[];
	onComplete: () => void;
	element!: HTMLDivElement;
	keyboardMenu: KeyboardMenu | null = null;

	constructor({ pizzas, onComplete }: CraftingMenuConfig) {
		this.pizzas = pizzas;
		this.onComplete = onComplete;
	}

	getOptions() {
		return this.pizzas.map((id: string) => {
			const base = window.Pizzas[id];

			return {
				label: base.name,
				description: base.description,
				handler: () => {
					window.playerState.addPizza(id);
					this.close();
				},
				right: () => {
					return `<img src='${base.icon}' alt='${base.name}' />`;
				},
			};
		});
	}

	createElement() {
		this.element = document.createElement('div');
		this.element.classList.add('overlay-menu');
		this.element.classList.add('crafting-menu');

		this.element.innerHTML = `
            <h2>Create a Pizza</h2>
        `;
	}

	close() {
		this.keyboardMenu?.end();
		this.element.remove();
		this.onComplete();
	}

	init(container: HTMLDivElement) {
		this.createElement();

		this.keyboardMenu = new KeyboardMenu({
			descriptionContainer: container,
		});
		this.keyboardMenu.init(this.element);
		this.keyboardMenu.setOptions(this.getOptions());

		container.appendChild(this.element);
	}
}

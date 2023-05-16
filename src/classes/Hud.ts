import { Combatant } from './Battle/Combatant';
import '../styles/Hud.css';

export class Hud {
	scoreboards: Combatant[] = [];
	element!: HTMLDivElement;

	createElement() {
		this.element?.remove();
		this.scoreboards = [];

		this.element = document.createElement('div');
		this.element.classList.add('hud');

		const { playerState, Pizzas } = window;

		playerState.lineup.forEach((key: string) => {
			const pizza = playerState.pizzas[key];

			if (!pizza.pizzaId) throw new Error(`Pizza ${key} is missing a pizzaId`);

			const scoreboard = new Combatant(
				{
					id: key,
					...Pizzas[pizza.pizzaId],
					...pizza,
				} as CombatantConfig,
				null
			);

			scoreboard.createElement();
			this.scoreboards.push(scoreboard);
			this.element.appendChild(scoreboard.hudElement);
		});
	}

	update() {
		this.scoreboards.forEach(scoreboard => {
			if (!scoreboard.id) return;

			scoreboard.update(window.playerState.pizzas[scoreboard.id]);
		});
	}

	init(container: HTMLDivElement) {
		this.createElement();
		this.update();
		container.appendChild(this.element);

		// Listen for update signals
		document.addEventListener('PlayerStateUpdated', () => {
			this.update();
		});

		document.addEventListener('LineupChanged', () => {
			this.createElement();
			this.update();
			container.appendChild(this.element);
		});
	}
}

import { Combatant } from './Combatant';
import { getSrc } from '../../utils/utils';
import '../../styles/Battle.css';

type BattleConfig = {
	onComplete: () => void;
};

type Combatants = {
	[key: string]: Combatant;
};

type ActiveCombatants = {
	player: string;
	enemy: string;
};

export class Battle {
	element!: HTMLDivElement;
	onComplete: () => void;

	combatants: Combatants;
	activeCombatants: ActiveCombatants;

	constructor({ onComplete }: BattleConfig) {
		this.onComplete = onComplete;

		this.combatants = {
			player1: new Combatant(
				{
					...window.Pizzas.s001,
					team: 'player',
					hp: 30,
					maxHp: 50,
					xp: 75,
					maxXp: 100,
					level: 1,
					status: {
						type: 'clumsy',
						expiresIn: 3,
					},
				},
				this
			),
			enemy1: new Combatant(
				{
					...window.Pizzas.v001,
					team: 'enemy',
					hp: 20,
					maxHp: 50,
					xp: 20,
					maxXp: 100,
					level: 1,
				},
				this
			),
			enemy2: new Combatant(
				{
					...window.Pizzas.f001,
					team: 'enemy',
					hp: 25,
					maxHp: 50,
					xp: 30,
					maxXp: 100,
					level: 1,
				},
				this
			),
		};

		this.activeCombatants = {
			player: 'player1',
			enemy: 'enemy1',
		};
	}

	createElement() {
		this.element = document.createElement('div');
		this.element.classList.add('battle');

		const heroSrc = getSrc('../assets/images/characters/people/hero.png');
		const enemySrc = getSrc('../assets/images/characters/people/npc3.png');

		this.element.innerHTML = `
      <div class='battle__hero'>
        <img src='${heroSrc}' alt='Hero' />
      </div>
      <div class='battle__enemy'>
        <img src='${enemySrc}' alt='Enemy' />
      </div>
    `;
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);

		Object.keys(this.combatants).forEach(key => {
			const combatant = this.combatants[key];

			combatant.id = key;
			combatant.init(this.element);
		});
	}
}

import { Battle } from './Battle';
import { BattleEventType, PizzaType, SPEEDS, TeamType } from '../../models/types';
import { getElement, getSrc, randomFromArray } from '../../utils/utils';
import '../../styles/Combatant.css';

type CombatantConfig = {
	id: string;
	name: string;
	type: PizzaType;
	src: string;
	icon: string;
	actions: string[];
	team: TeamType;
	hp: number;
	maxHp: number;
	xp: number;
	maxXp: number;
	level: number;
	status?: {
		type: string;
		expiresIn: number;
	} | null;
};

type CombatantProperty = {
	[P in keyof CombatantConfig]: CombatantConfig[P];
};

export class Combatant {
	id!: string;
	name: string;
	type: PizzaType;
	src: string;
	icon: string;
	actions: string[];
	team: TeamType;
	hp: number;
	maxHp: number;
	xp: number;
	maxXp: number;
	level: number;
	status?: {
		type: string;
		expiresIn: number;
	} | null;

	battle: Battle;

	hudElement!: HTMLDivElement;
	pizzaElement!: HTMLImageElement;
	hpFills!: NodeListOf<SVGRectElement>;
	xpFills!: NodeListOf<SVGRectElement>;

	constructor(config: CombatantConfig, battle: Battle) {
		// config is HP, maxHP, XP, name, actions, etc.
		this.id = config.id;
		this.name = config.name;
		this.type = config.type;
		this.src = config.src;
		this.icon = config.icon;
		this.actions = config.actions;
		this.team = config.team;
		this.hp = config.hp;
		this.maxHp = config.maxHp;
		this.xp = config.xp;
		this.maxXp = config.maxXp;
		this.level = config.level;
		this.status = config.status;

		this.battle = battle;
	}

	get hpPercentage() {
		return Math.max(0, Math.min(100, (this.hp / this.maxHp) * 100));
	}

	get xpPercentage() {
		return (this.xp / this.maxXp) * 100;
	}

	get isActive() {
		return this.battle.activeCombatants[this.team] === this.id;
	}

	private setProperty<T extends keyof CombatantConfig>(
		property: T,
		value: CombatantConfig[T]
	) {
		(this as CombatantProperty)[property] = value;
	}

	createElement() {
		this.hudElement = document.createElement('div');
		this.hudElement.classList.add('combatant');
		this.hudElement.setAttribute('data-combatant', this.id);
		this.hudElement.setAttribute('data-team', this.team);

		this.hudElement.innerHTML = `
      <p class='combatant__name'>${this.name}</p>
      <p class='combatant__level'></p>
      <div class='combatant__wrapper'>
        <img class='combatant__image' src='${this.src}' alt='${this.name}' />
      </div>
      <img class='combatant__type' src='${this.icon}' alt='${this.type}' />
      <svg viewBox='0 0 26 3' class='combatant__life-container'>
        <rect x=0 y=0 width='0%' height=1 fill='#82ff71' />
        <rect x=0 y=1 width='0%' height=2 fill='#3ef126' />
      </svg>
      <svg viewBox='0 0 26 2' class='combatant__xp-container'>
        <rect x=0 y=0 width='0%' height=1 fill='#ffd76a' />
        <rect x=0 y=1 width='0%' height=1 fill='#ffc934' />
      </svg>
      <p class='combatant__status'></p>
    `;

		this.pizzaElement = document.createElement('img');
		this.pizzaElement.classList.add('pizza');
		this.pizzaElement.setAttribute('src', getSrc(this.src));
		this.pizzaElement.setAttribute('alt', this.name);
		this.pizzaElement.setAttribute('data-team', this.team);

		this.hpFills = this.hudElement.querySelectorAll(
			'.combatant__life-container > rect'
		);

		this.xpFills = this.hudElement.querySelectorAll(
			'.combatant__xp-container > rect'
		);
	}

	update(changes: Partial<CombatantConfig> = {}) {
		Object.keys(changes).forEach((key: string) => {
			const propertyKey = key as keyof CombatantConfig;

			this.setProperty(propertyKey, changes[propertyKey]);
		});

		// Update active state
		this.hudElement.setAttribute('data-active', `${this.isActive}`);
		this.pizzaElement.setAttribute('data-active', `${this.isActive}`);

		// Update the HP
		this.hpFills.forEach(rect => {
			rect.style.width = `${this.hpPercentage}%`;
		});

		// Update the XP
		this.xpFills.forEach(rect => {
			rect.style.width = `${this.xpPercentage}%`;
		});

		// Update the Level
		getElement('.combatant__level', this.hudElement).innerText = `${this.level}`;

		// Update the Status
		const statusElement = getElement('.combatant__status', this.hudElement);

		if (this.status) {
			statusElement.innerText = this.status.type;
			statusElement.style.display = 'block';
			return;
		}

		statusElement.innerText = '';
		statusElement.style.display = 'none';
	}

	getReplacedEvents(originalEvents: BattleEventType[]) {
		const randomChance = [true, false, false];

		if (this.status?.type === 'clumsy' && randomFromArray(randomChance)) {
			return [
				{
					type: 'message',
					textLines: [{ speed: SPEEDS.Fast, string: `${this.name} flops over!` }],
				},
			];
		}

		return originalEvents;
	}

	getPostEvents() {
		if (this.status?.type === 'saucy') {
			return [
				{
					type: 'message',
					textLines: [
						{ speed: SPEEDS.Fast, string: "Feelin'" },
						{ speed: SPEEDS.Fast, string: 'saucy!', classes: ['orange', 'dance'] },
					],
				},
				{ type: 'stateChange', recover: 5, onCaster: true },
			];
		}

		return [];
	}

	decrementStatus() {
		if (!this.status) return null;

		if (this.status.expiresIn > 0) {
			this.status.expiresIn -= 1;

			if (this.status.expiresIn !== 0) return null;

			const { type } = this.status;
			this.update({ status: null });

			return {
				type: 'message',
				textLines: [
					{
						speed: SPEEDS.Fast,
						string: `${this.name} is no longer ${type}!`,
					},
				],
			};
		}
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.append(this.hudElement);
		container.append(this.pizzaElement);
		this.update();
	}
}

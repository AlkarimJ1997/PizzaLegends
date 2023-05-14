import { Combatant } from './Combatant';
import { TurnCycle } from './TurnCycle';
import { BattleEvent } from './BattleEvent';
import { getSrc } from '../../utils/utils';
import { Team } from './Team';
import '../../styles/Battle.css';

type BattleConfig = {
	enemy: EnemyConfig;
	onComplete: () => void;
};

type Combatants = {
	[key: string]: Combatant;
};

type ActiveCombatants = {
	player: string | null;
	enemy: string | null;
};

export class Battle {
	element!: HTMLDivElement;
	enemy: EnemyConfig;
	onComplete: () => void;

	combatants: Combatants = {};
	activeCombatants: ActiveCombatants;
	items: Item[] = [];
	usedInstanceIds: { [key: string]: boolean };

	playerTeam!: Team;
	enemyTeam!: Team;
	turnCycle!: TurnCycle;

	constructor({ enemy, onComplete }: BattleConfig) {
		this.enemy = enemy;
		this.onComplete = onComplete;

		this.activeCombatants = {
			player: null,
			enemy: null,
		};

		window.playerState.lineup.forEach(id => {
			this.addCombatant(id, 'player', window.playerState.pizzas[id]);
		});

		Object.keys(this.enemy.pizzas).forEach(key => {
			this.addCombatant(`e_${key}`, 'enemy', this.enemy.pizzas[key]);
		});

		window.playerState.items.forEach((item: Item) => {
			this.items.push({
				...item,
				team: 'player',
			});
		});

		this.usedInstanceIds = {};
	}

	addCombatant(id: string, team: TeamType, config: EnemyConfig) {
		this.combatants[id] = new Combatant(
			{
				...window.Pizzas[config.pizzaId],
				...config,
				team,
				isPlayerControlled: team === 'player',
			},
			this
		);

		// Populate first active combatant
		this.activeCombatants[team] = this.activeCombatants[team] || id;
	}

	createElement() {
		this.element = document.createElement('div');
		this.element.classList.add('battle');

		const heroSrc = getSrc('../assets/images/characters/people/hero.png');
		const enemySrc = getSrc(this.enemy.src);

		this.element.innerHTML = `
      <div class='battle__hero'>
        <img src='${heroSrc}' alt='Hero' />
      </div>
      <div class='battle__enemy'>
        <img src='${enemySrc}' alt='${this.enemy.name}' />
      </div>
    `;
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);

		// Team Icons
		this.playerTeam = new Team('player', 'hero');
		this.enemyTeam = new Team('enemy', 'Bully');

		Object.keys(this.combatants).forEach(key => {
			const combatant = this.combatants[key];

			combatant.id = key;
			combatant.init(this.element);

			// Add to team
			if (combatant.team === 'player') {
				this.playerTeam.combatants.push(combatant);
			} else if (combatant.team === 'enemy') {
				this.enemyTeam.combatants.push(combatant);
			}
		});

		// Initialize Team Elements
		this.playerTeam.init(this.element);
		this.enemyTeam.init(this.element);

		this.turnCycle = new TurnCycle({
			battle: this,
			onNewEvent: (event: BattleEventType) => {
				return new Promise<void | SubmissionReturn>(resolve => {
					const battleEvent = new BattleEvent(event, this);
					battleEvent.init(resolve);
				});
			},
			onWinner: winner => {
				if (winner === 'player') {
					const playerState = window.playerState;

					// Update player state
					Object.keys(playerState.pizzas).forEach(id => {
						const playerPizza = playerState.pizzas[id];
						const combatant = this.combatants[id];

						if (combatant) {
							playerPizza.hp = combatant.hp;
							playerPizza.xp = combatant.xp;
							playerPizza.maxXp = combatant.maxXp;
							playerPizza.level = combatant.level;
						}
					});

					// Get rid of items player used
					playerState.items = playerState.items.filter((item: Item) => {
						return !this.usedInstanceIds[item.instanceId];
					});
				}

				this.element.remove();
				this.onComplete();
			},
		});

		this.turnCycle.init();
	}
}

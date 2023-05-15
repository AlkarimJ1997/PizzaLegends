import { SPEEDS } from '../../data/enums';

type TurnCycleConfig = {
	battle: Battle;
	onNewEvent: (event: BattleEventType) => Promise<void | SubmissionReturn>;
	onWinner: (winner: 'player' | 'enemy') => void;
};

type AliveTeams = {
	player?: boolean;
	enemy?: boolean;
};

export class TurnCycle {
	battle: Battle;
	onNewEvent: (event: BattleEventType) => Promise<void | SubmissionReturn>;
	onWinner: (winner: 'player' | 'enemy') => void;
	currentTeam: 'player' | 'enemy';

	constructor({ battle, onNewEvent, onWinner }: TurnCycleConfig) {
		this.battle = battle;
		this.onNewEvent = onNewEvent;
		this.onWinner = onWinner;
		this.currentTeam = 'player';
	}

	async turn() {
		// Get the caster
		const casterId = this.battle.activeCombatants[this.currentTeam];
		const caster = this.battle.combatants[casterId];

		// Get the enemy
		const oppositeTeam = caster.team === 'player' ? 'enemy' : 'player';
		const enemyId = this.battle.activeCombatants[oppositeTeam];
		const enemy = this.battle.combatants[enemyId];

		// Check for pre events (e.g. protection expiring)
		const preEvents = caster.getPreEvents();

		for (const event of preEvents) {
			const newEvent = {
				...event,
				caster,
			};

			await this.onNewEvent(newEvent);
		}

		const submission = await this.onNewEvent({
			type: 'submissionMenu',
			caster,
			enemy,
		});

		// Stop here if we are replacing this Pizza
		if (submission && 'replacement' in submission) {
			await this.onNewEvent({
				type: 'replace',
				replacement: submission.replacement,
			});

			await this.onNewEvent({
				type: 'message',
				textLines: [
					{
						speed: SPEEDS.Normal,
						string: `Go get 'em, ${submission?.replacement?.name}!`,
					},
				],
			});

			// Change the current team and go to the next turn
			this.nextTurn();
			return;
		}

		// Check for items
		if (submission?.instanceId) {
			// Add to list to persist to player state later
			this.battle.usedInstanceIds[submission.instanceId] = true;

			// Remove item from battle state
			this.battle.items = this.battle.items.filter(item => {
				return item.instanceId !== submission.instanceId;
			});
		}

		const resultingEvents = caster.getReplacedEvents(
			submission?.action.success || []
		);

		for (const event of resultingEvents) {
			const newEvent = {
				...event,
				action: submission?.action,
				caster,
				target: submission?.target,
			};

			if (submission) newEvent.submission = submission;

			await this.onNewEvent(newEvent);
		}

		// Did the target die?
		const targetDead = submission && (submission.target.hp as number) <= 0;

		if (targetDead) {
			await this.onNewEvent({
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Normal, string: `${submission.target.name} has` },
					{ speed: SPEEDS.Fast, string: 'fainted!', classes: ['red'] },
				],
			});

			if (submission.target.team === 'enemy') {
				const playerActiveId = this.battle.activeCombatants.player;
				const activePizza = this.battle.combatants[playerActiveId];
				const xp = submission.target.givesXp;

				await this.onNewEvent({
					type: 'message',
					textLines: [
						{ speed: SPEEDS.Normal, string: `${activePizza.name} gained` },
						{ speed: SPEEDS.Fast, string: `${xp} XP!`, classes: ['green'] },
					],
				});

				await this.onNewEvent({
					type: 'giveXp',
					xp,
					combatant: activePizza,
				});
			}
		}

		// Do we have a winning team?
		const winner = this.getWinningTeam();

		if (winner) {
			await this.onNewEvent({
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Normal, string: 'The battle is' },
					{ speed: SPEEDS.Fast, string: 'over!', classes: ['green'] },
				],
			});

			this.onWinner(winner);
			return;
		}

		// If not, bring in a replacement
		if (targetDead) {
			const replacement = (await this.onNewEvent({
				type: 'replacementMenu',
				team: submission.target.team,
			})) as unknown as Combatant;

			await this.onNewEvent({
				type: 'replace',
				replacement,
			});

			await this.onNewEvent({
				type: 'message',
				textLines: [
					{
						speed: SPEEDS.Normal,
						string: `Go get 'em, ${replacement.name}!`,
					},
				],
			});
		}

		// Check for post events (e.g. status effects)
		const postEvents = caster.getPostEvents();

		for (const event of postEvents) {
			const newEvent = {
				...event,
				action: submission?.action,
				caster,
				target: submission?.target,
			};

			if (submission) newEvent.submission = submission;

			await this.onNewEvent(newEvent);
		}

		// Check for status expiration
		const expiredEvent = caster.decrementStatus();

		if (expiredEvent) await this.onNewEvent(expiredEvent);

		// Change the current team and go to the next turn
		this.nextTurn();
	}

	nextTurn() {
		this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
		this.turn();
	}

	getWinningTeam() {
		const aliveTeams: AliveTeams = {};
		const combatants = Object.values(this.battle.combatants) as Combatant[];

		combatants.forEach(c => {
			if ((c.hp as number) > 0) aliveTeams[c.team] = true;
		});

		if (!aliveTeams.player) return 'enemy';
		if (!aliveTeams.enemy) return 'player';

		return null;
	}

	async init() {
		await this.onNewEvent({
			type: 'message',
			textLines: [
				{
					speed: SPEEDS.Normal,
					string: `${this.battle.enemy.name} wants to throw down!`,
				},
			],
		});

		this.turn();
	}
}

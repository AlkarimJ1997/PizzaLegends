import { SPEEDS } from '../../data/enums';

type TurnCycleConfig = {
	battle: Battle;
	onNewEvent: (event: BattleEventType) => Promise<void | Submission>;
};

export class TurnCycle {
	battle: Battle;
	onNewEvent: (event: BattleEventType) => Promise<void | Submission>;
	currentTeam: 'player' | 'enemy';

	constructor({ battle, onNewEvent }: TurnCycleConfig) {
		this.battle = battle;
		this.onNewEvent = onNewEvent;
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
		this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
		this.turn();
	}

	async init() {
		await this.onNewEvent({
			type: 'message',
			textLines: [
				{ speed: SPEEDS.Normal, string: 'The battle is' },
				{ speed: SPEEDS.Fast, string: 'starting!', classes: ['green'] },
			],
		});

		this.turn();
	}
}

import { Battle } from './Battle';
import { BattleEventType, Submission, SPEEDS } from '../../models/types';

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

		const submission = await this.onNewEvent({
			type: 'submissionMenu',
			caster,
			enemy,
		});

		const resultingEvents = (submission?.action.success || []) as BattleEventType[];

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

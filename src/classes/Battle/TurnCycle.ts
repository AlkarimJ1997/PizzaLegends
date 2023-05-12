import { SPEEDS } from '../../models/types';

export class TurnCycle {
	constructor({ battle, onNewEvent }) {
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

		const resultingEvents = submission.action.success;

		for (const event of resultingEvents) {
			const newEvent = {
				...event,
				submission,
				action: submission.action,
				caster,
				target: submission.target,
			};

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

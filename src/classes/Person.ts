import { GameObject } from './GameObject';
import { BehaviorLoopEvent, PersonConfig, State } from '../models/types';
import { emitEvent } from '../utils/utils';

type DirectionUpdate = {
	[key: string]: ['x' | 'y', 1 | -1];
};

export class Person extends GameObject {
	protected isStanding: boolean;

	movingProgressRemaining: number;
	isPlayerControlled: boolean;
	directionUpdate: DirectionUpdate;

	constructor(config: PersonConfig) {
		super(config);

		this.movingProgressRemaining = 0;
		this.isStanding = false;
		this.isPlayerControlled = config.isPlayerControlled || false;
		this.directionUpdate = {
			up: ['y', -1],
			down: ['y', 1],
			left: ['x', -1],
			right: ['x', 1],
		};
	}

	updatePosition() {
		const [property, value] = this.directionUpdate[this.direction];

		this[property] += value;
		this.movingProgressRemaining -= 1;

		if (this.movingProgressRemaining === 0) {
			// We're done moving, so let's throw a signal
			emitEvent('PersonWalkingComplete', { whoId: this.id as string });
		}
	}

	updateSprite() {
		if (this.movingProgressRemaining > 0) {
			this.sprite.setAnimation(`walk-${this.direction}`);
			return;
		}

		this.sprite.setAnimation(`idle-${this.direction}`);
	}

	startBehavior(state: State, behavior: BehaviorLoopEvent) {
		this.direction = behavior.direction ?? this.direction;

		if (behavior.type === 'walk') {
			// Don't walk if the space is taken (i.e. a wall or other NPC)
			if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
				behavior.retry &&
					setTimeout(() => {
						this.startBehavior(state, behavior);
					}, 10);

				return;
			}

			// Ready to walk!
			state.map.moveWall(this.x, this.y, this.direction);
			this.movingProgressRemaining = 16;
			this.updateSprite();
		}

		if (behavior.type === 'stand') {
			this.isStanding = true;

			setTimeout(() => {
				emitEvent('PersonStandingComplete', { whoId: this.id as string });
				this.isStanding = false;
			}, behavior.time);
		}
	}

	update(state: State) {
		if (this.movingProgressRemaining > 0) {
			this.updatePosition();
			return;
		}
		// More cases for starting to walk will come here
		// ...

		// Case: We're keyboard ready (player is able to walk - no cutscene going on, etc.) and have an arrow pressed down
		if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
			this.startBehavior(state, {
				type: 'walk',
				direction: state.arrow,
			});
		}

		this.updateSprite();
	}
}

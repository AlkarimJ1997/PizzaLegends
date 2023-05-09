import { GameObject } from './GameObject';
import { OverworldMap } from './OverworldMap';

type DirectionUpdate = {
	[key: string]: ['x' | 'y', 1 | -1];
};

type PersonConfig = {
	x?: number;
	y?: number;
	src?: string;
	direction?: 'up' | 'down' | 'left' | 'right';
	isPlayerControlled?: boolean;
};

type State = {
	arrow: string;
	map: OverworldMap;
};

type Behavior = {
	type: string;
	direction: string;
};

export class Person extends GameObject {
	movingProgressRemaining: number;
	isPlayerControlled: boolean;
	directionUpdate: DirectionUpdate;

	constructor(config: PersonConfig) {
		super(config);

		this.movingProgressRemaining = 0;
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
	}

	updateSprite() {
		if (this.movingProgressRemaining > 0) {
			this.sprite.setAnimation(`walk-${this.direction}`);
			return;
		}

		this.sprite.setAnimation(`idle-${this.direction}`);
	}

	startBehavior(state: State, behavior: Behavior) {
		this.direction = behavior.direction;

		if (behavior.type === 'walk') {
			// Don't walk if the space is taken (i.e. a wall or other NPC)
			if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
				return;
			}

			// Ready to walk!
			state.map.moveWall(this.x, this.y, this.direction);
			this.movingProgressRemaining = 16;
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
		if (this.isPlayerControlled && state.arrow) {
			this.startBehavior(state, {
				type: 'walk',
				direction: state.arrow,
			});
		}

		this.updateSprite();
	}
}

import { OverworldEvent } from './OverworldEvent';
import { Sprite } from './Sprite';

export abstract class GameObject {
	isStanding?: boolean;
	id?: string | null;
	isMounted: boolean;
	x: number;
	y: number;
	direction: string;
	sprite: Sprite;
	behaviorLoop: BehaviorLoopEvent[];
	behaviorLoopIndex: number;
	talking: TalkEvent[];
	retryTimeout: number | null;

	constructor(config: GameObjectConfig) {
		this.id = null;
		this.isMounted = false;
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.direction = config.direction || 'down';
		this.sprite = new Sprite({
			gameObject: this,
			src: config.src || '../assets/images/characters/people/hero.png',
		});

		this.behaviorLoop = config.behaviorLoop || [];
		this.behaviorLoopIndex = 0;
		this.talking = config.talking || [];
		this.retryTimeout = null;
	}

	async doBehaviorEvent(map: OverworldMap) {
		if (this.behaviorLoop.length === 0) return;

        // If there's a cutscene playing, wait a bit then try again
		if (map.isCutscenePlaying) {
            if (this.retryTimeout) clearTimeout(this.retryTimeout);

			this.retryTimeout = setTimeout(() => {
				this.doBehaviorEvent(map);
			}, 1000);

			return;
		}

		const eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
		eventConfig.who = this.id as string;

		const eventHandler = new OverworldEvent({ map, event: eventConfig });
		await eventHandler.init();

		// Set next event to fire
		this.behaviorLoopIndex += 1;

		// Loop back to the beginning if we've reached the end
		if (this.behaviorLoopIndex >= this.behaviorLoop.length) {
			this.behaviorLoopIndex = 0;
		}

		// Kick off the next behavior loop event
		this.doBehaviorEvent(map);
	}

	mount(map: OverworldMap) {
		this.isMounted = true;

		// If we have a behavior loop, kick it off after a short delay
		setTimeout(() => {
			this.doBehaviorEvent(map);
		}, 10);
	}

	abstract update(state: State): void;
}

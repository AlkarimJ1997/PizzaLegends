import { OverworldMap } from './OverworldMap';
import { Sprite } from './Sprite';

type GameObjectConfig = {
	x?: number;
	y?: number;
	src?: string;
	direction?: 'up' | 'down' | 'left' | 'right';
};

type State = {
	arrow: string;
	map: OverworldMap;
};

export abstract class GameObject {
	isMounted: boolean;
	x: number;
	y: number;
	direction: string;
	sprite: Sprite;

	constructor(config: GameObjectConfig) {
		this.isMounted = false;
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.direction = config.direction || 'down';
		this.sprite = new Sprite({
			gameObject: this,
			src: config.src || '../assets/images/characters/people/hero.png',
		});
	}

	mount(map: OverworldMap) {
		this.isMounted = true;

		map.addWall(this.x, this.y);
	}

	abstract update(state: State): void;
}

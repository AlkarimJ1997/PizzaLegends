import { GameObject } from './GameObject';
import { Person } from './Person';
import { createImage, withGrid, asGridCoord, nextPosition } from '../utils/utils';

type GameObjects = {
	[key: string]: GameObject;
};

type Walls = {
	[key: string]: boolean;
};

type OverworldMapConfig = {
	lowerSrc: string;
	upperSrc: string;
	gameObjects: GameObjects;
	walls?: Walls;
};

export class OverworldMap {
	gameObjects: GameObjects;
	lowerImage: HTMLImageElement = new Image();
	upperImage: HTMLImageElement = new Image();
	walls: Walls;

	constructor(config: OverworldMapConfig) {
		this.gameObjects = config.gameObjects;
		this.walls = config.walls || {};

		createImage(config.lowerSrc).then(image => {
			this.lowerImage.src = image.src;
		});

		createImage(config.upperSrc).then(image => {
			this.upperImage.src = image.src;
		});
	}

	drawLowerImage(ctx: CanvasRenderingContext2D, cameraPerson: GameObject) {
		ctx.drawImage(
			this.lowerImage,
			withGrid(10.5) - cameraPerson.x,
			withGrid(6) - cameraPerson.y
		);
	}

	drawUpperImage(ctx: CanvasRenderingContext2D, cameraPerson: GameObject) {
		ctx.drawImage(
			this.upperImage,
			withGrid(10.5) - cameraPerson.x,
			withGrid(6) - cameraPerson.y
		);
	}

	mountObjects() {
		Object.values(this.gameObjects).forEach(gameObject => {
            // TODO: determine if object should actually be mounted
			gameObject.mount(this);
		});
	}

	isSpaceTaken(currentX: number, currentY: number, direction: string) {
		const { x, y } = nextPosition(currentX, currentY, direction);

		return this.walls[`${x},${y}`] || false;
	}

	addWall(x: number, y: number) {
		this.walls[`${x},${y}`] = true;
	}

	removeWall(x: number, y: number) {
		delete this.walls[`${x},${y}`];
	}

	moveWall(wasX: number, wasY: number, direction: string) {
		this.removeWall(wasX, wasY);

		const { x, y } = nextPosition(wasX, wasY, direction);

		this.addWall(x, y);
	}
}

declare global {
	interface Window {
		OverworldMaps: {
			[key: string]: OverworldMapConfig;
		};
	}
}

window.OverworldMaps = {
	DemoRoom: {
		lowerSrc: '../assets/images/maps/DemoLower.png',
		upperSrc: '../assets/images/maps/DemoUpper.png',
		gameObjects: {
			hero: new Person({
				isPlayerControlled: true,
				x: withGrid(5),
				y: withGrid(6),
			}),
			npcA: new Person({
				x: withGrid(7),
				y: withGrid(9),
				src: '../assets/images/characters/people/npc1.png',
			}),
		},
		walls: {
			[asGridCoord(7, 6)]: true,
			[asGridCoord(8, 6)]: true,
			[asGridCoord(7, 7)]: true,
			[asGridCoord(8, 7)]: true,
		},
	},
	// Kitchen: {
	// 	lowerSrc: '../assets/images/maps/KitchenLower.png',
	// 	upperSrc: '../assets/images/maps/KitchenUpper.png',
	// 	gameObjects: {
	// 		hero: new GameObject({
	// 			x: 3,
	// 			y: 5,
	// 		}),
	// 		npcA: new GameObject({
	// 			x: 9,
	// 			y: 6,
	// 			src: '../assets/images/characters/people/npc2.png',
	// 		}),
	// 		npcB: new GameObject({
	// 			x: 10,
	// 			y: 8,
	// 			src: '../assets/images/characters/people/npc3.png',
	// 		}),
	// 	},
	// },
};

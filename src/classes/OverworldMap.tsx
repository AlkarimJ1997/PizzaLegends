import { GameObject } from './GameObject';
import { createImage, withGrid, nextPosition } from '../utils/utils';
import { BehaviorLoopEvent } from '../models/types';
import { OverworldEvent } from './OverworldEvent';

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
	walls: Walls;
	lowerImage: HTMLImageElement = new Image();
	upperImage: HTMLImageElement = new Image();
	isCutscenePlaying: boolean;

	constructor(config: OverworldMapConfig) {
		this.gameObjects = config.gameObjects;
		this.walls = config.walls || {};

		createImage(config.lowerSrc).then(image => {
			this.lowerImage.src = image.src;
		});

		createImage(config.upperSrc).then(image => {
			this.upperImage.src = image.src;
		});

		this.isCutscenePlaying = true;
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
		Object.keys(this.gameObjects).forEach(key => {
			const gameObject = this.gameObjects[key];

			// TODO: determine if object should actually be mounted
			gameObject.id = key;
			gameObject.mount(this);
		});
	}

	async startCutscene(events: BehaviorLoopEvent[]) {
		this.isCutscenePlaying = true;

		// Start a loop of async events, awaiting each one
		for (const event of events) {
			const eventHandler = new OverworldEvent({
				event,
				map: this,
			});

			await eventHandler.init();
		}

		this.isCutscenePlaying = false;

		// Reset NPCs to do their idle behavior
		Object.values(this.gameObjects).forEach(gameObject => {
			gameObject.doBehaviorEvent(this);
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

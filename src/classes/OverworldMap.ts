import { OverworldEvent } from './OverworldEvent';
import { createImage, withGrid, nextPosition } from '../utils/utils';

export class OverworldMap {
	overworld: Overworld | null;
	gameObjects: GameObjects;
	walls: Walls;
	lowerImage: HTMLImageElement = new Image();
	upperImage: HTMLImageElement = new Image();
	isCutscenePlaying: boolean;
	cutsceneSpaces: CutsceneSpaces;
    isPaused: boolean;

	constructor(config: OverworldMapConfig) {
		this.overworld = null;
		this.gameObjects = config.gameObjects;
		this.walls = config.walls || {};

		createImage(config.lowerSrc).then(image => {
			this.lowerImage.src = image.src;
		});

		createImage(config.upperSrc).then(image => {
			this.upperImage.src = image.src;
		});

		this.isCutscenePlaying = false;
		this.cutsceneSpaces = config.cutsceneSpaces || {};

        this.isPaused = false;
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
			gameObject.mount(this as OverworldMap);
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

	checkForActionCutscene() {
		const hero = this.gameObjects.hero;
		const nextCoords = nextPosition(hero.x, hero.y, hero.direction);
		const match = Object.values(this.gameObjects).find(obj => {
			return `${obj.x},${obj.y}` === `${nextCoords.x},${nextCoords.y}`;
		});

		if (!this.isCutscenePlaying && match && match.talking.length) {
			this.startCutscene(match.talking[0].events);
		}
	}

	checkForFootstepCutscene() {
		const hero = this.gameObjects.hero;
		const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];

		if (!this.isCutscenePlaying && match) {
			this.startCutscene(match[0].events);
		}
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

import { OverworldEvent } from './OverworldEvent';
import { Person } from './Person';
import { createImage, withGrid, nextPosition } from '../utils/utils';
import { PizzaStone } from './PizzaStone';

export class OverworldMap {
	overworld: Overworld | null;
	gameObjects: GameObjects;
	configObjects: {
		[key: string]: GameObjectConfig;
	};

	walls: Walls;
	lowerImage: HTMLImageElement = new Image();
	upperImage: HTMLImageElement = new Image();
	isCutscenePlaying: boolean;
	cutsceneSpaces: CutsceneSpaces;
	isPaused: boolean;

	constructor(config: OverworldMapConfig) {
		this.overworld = null;
		this.gameObjects = {};
		this.configObjects = config.configObjects;

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
		Object.keys(this.configObjects).forEach(key => {
			const configObject = this.configObjects[key];
			let instance;

			configObject.id = key;

			switch (configObject.type) {
				case 'Person':
					instance = new Person(configObject);
					break;
				case 'PizzaStone':
					instance = new PizzaStone(configObject as PizzaStoneConfig);
					break;
				default:
					return;
			}

			// TODO: determine if object should actually be mounted
			this.gameObjects[key] = instance;
			this.gameObjects[key].id = key;
			instance.mount(this);
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

			const result = await eventHandler.init();

			if (result === 'LOST_BATTLE') break;
		}

		this.isCutscenePlaying = false;
	}

	checkForActionCutscene() {
		const hero = this.gameObjects.hero;
		const nextCoords = nextPosition(hero.x, hero.y, hero.direction);
		const match = Object.values(this.gameObjects).find(obj => {
			return `${obj.x},${obj.y}` === `${nextCoords.x},${nextCoords.y}`;
		});

		if (!this.isCutscenePlaying && match && match.talking.length) {
			const relevantScenario = match.talking.find(scenario => {
				return (scenario.required || []).every(sFlag => {
					return window.playerState.storyFlags[sFlag];
				});
			});

			relevantScenario && this.startCutscene(relevantScenario.events);
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

		if (this.walls[`${x},${y}`]) return true;

		// Check for game objects at this position
		return !!Object.values(this.gameObjects).find(gameObj => {
			if (gameObj.x === x && gameObj.y === y) return true;

            if ('intentPosition' in gameObj && gameObj.intentPosition) {
                const [objX, objY] = gameObj.intentPosition as [number, number];
                
                if (objX === x && objY === y) return true;
            }

			return false;
		});
	}
}

import { OverworldMap } from './OverworldMap';
import { Hud } from './Hud';
import { DirectionInput } from './DirectionInput';
import { KeyPressListener } from './KeyPressListener';
import { SPEEDS } from '../data/enums';
import { getElement } from '../utils/utils';
import { Progress } from './Progress';
import { TitleScreen } from './TitleScreen';

type OverworldConfig = {
	element: HTMLElement;
};

export class Overworld {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	currentAnimationFrame: number;

	progress: Progress | null = null;
	titleScreen: TitleScreen | null = null;
	hud!: Hud;
	map!: OverworldMap;
	directionInput!: DirectionInput;

	constructor(public config: OverworldConfig) {
		this.element = this.config.element as HTMLElement;
		this.canvas = getElement<HTMLCanvasElement>('.game__canvas');
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.currentAnimationFrame = 0;
	}

	startGameLoop() {
		const targetFPS = 60;
		const targetDeltaTime = 1000 / targetFPS;
		let lastFrameTime = performance.now();
		let accumulator = 0;

		const step = (currentFrameTime: number) => {
			const deltaTime = currentFrameTime - lastFrameTime;

			lastFrameTime = currentFrameTime;
			accumulator += deltaTime;

			while (accumulator >= targetDeltaTime) {
				// Update Game Objects
				Object.values(this.map.gameObjects).forEach(gameObject => {
					gameObject.update({
						arrow: this.directionInput.direction,
						map: this.map,
					});
				});

				accumulator -= targetDeltaTime;
			}

			// Clear Canvas
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			// Camera person
			const cameraPerson = this.map.gameObjects.hero;

			// Draw Lower Image
			this.map.drawLowerImage(this.ctx, cameraPerson);

			// Draw Game Objects
			Object.values(this.map.gameObjects)
				.sort((a, b) => a.y - b.y)
				.forEach(gameObject => {
					gameObject.sprite.draw(this.ctx, cameraPerson);
				});

			// Draw Upper Image
			this.map.drawUpperImage(this.ctx, cameraPerson);

			if (!this.map.isPaused) {
				this.currentAnimationFrame = requestAnimationFrame(step);
			}
		};

		this.currentAnimationFrame = requestAnimationFrame(step);
	}

	bindActionInput() {
		new KeyPressListener('Enter', () => {
			// Is there a person here to talk to?
			this.map.checkForActionCutscene();
		});

		new KeyPressListener('Escape', () => {
			if (!this.map.isCutscenePlaying) {
				this.map.startCutscene([{ type: 'pause' }]);
			}
		});
	}

	bindHeroPositionCheck() {
		document.addEventListener('PersonWalkingComplete', e => {
			if (e.detail.whoId === 'hero') {
				this.map.checkForFootstepCutscene();
			}
		});
	}

	startMap(
		mapConfig: OverworldMapConfig,
		heroInitialState?: HeroInitialState | null
	) {
		this.map = new OverworldMap(mapConfig);
		this.map.overworld = this;
		this.map.mountObjects();

		if (!heroInitialState) return;

		const { hero } = this.map.gameObjects;
		const { x, y, direction } = heroInitialState;

		this.map.removeWall(hero.x, hero.y);
		hero.x = x;
		hero.y = y;
		hero.direction = direction;
		this.map.addWall(hero.x, hero.y);

		// Load progress
		if (!this.progress) return;

		this.progress.mapId = mapConfig.id;
		this.progress.startingHeroX = this.map.gameObjects.hero.x;
		this.progress.startingHeroY = this.map.gameObjects.hero.y;
		this.progress.startingHeroDirection = this.map.gameObjects.hero.direction;
	}

	destroy() {
		this.directionInput.destroy();
		cancelAnimationFrame(this.currentAnimationFrame);

		// Remove any children except the canvas
		while (this.element.children.length > 1) {
			this.element.removeChild(this.element.lastChild as Node);
		}
	}

	async init() {
		// Game container
		const gameContainer = getElement<HTMLDivElement>('.game');

		this.progress = new Progress();

		// Show the Title Screen
		this.titleScreen = new TitleScreen({
			progress: this.progress,
		});

		const useSaveFile = await this.titleScreen.init(gameContainer);

		// Potentially load progress
		let initialHeroState = null;

		if (useSaveFile) {
			this.progress.load();
			initialHeroState = {
				x: this.progress.startingHeroX,
				y: this.progress.startingHeroY,
				direction: this.progress.startingHeroDirection,
			};
		}

		this.hud = new Hud();
		this.hud.init(gameContainer);

		this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState);

		this.bindActionInput();
		this.bindHeroPositionCheck();

		this.directionInput = new DirectionInput();
		this.directionInput.init();

		this.startGameLoop();

		// this.map.startCutscene([
		// 	{ type: 'battle', enemyId: 'beth' },
		// 	{
		// 		type: 'message',
		// 		textLines: [
		// 			{ speed: SPEEDS.Slow, string: 'Oh, hello!' },
		// 			{ speed: SPEEDS.Pause, string: '', pause: true },
		// 			{ speed: SPEEDS.Normal, string: 'Have you seen my pet' },
		// 			{ speed: SPEEDS.Fast, string: 'frog', classes: ['green'] },
		// 			{ speed: SPEEDS.Normal, string: 'around here?' },
		// 		],
		// 	},
		// 	{ who: 'hero', type: 'walk', direction: 'down' },
		// 	{ who: 'hero', type: 'walk', direction: 'down' },
		// 	{ who: 'npcA', type: 'walk', direction: 'up' },
		// 	{ who: 'npcA', type: 'walk', direction: 'left' },
		// 	{ who: 'hero', type: 'stand', direction: 'right', time: 200 },
		// 	{ type: 'changeMap', map: 'Kitchen' },
		// ]);
	}
}

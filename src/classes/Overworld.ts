import { OverworldMap } from './OverworldMap';
import { DirectionInput } from './DirectionInput';

type OverworldConfig = {
	element: HTMLElement;
};

export class Overworld {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	currentAnimationFrame: number;
	map!: OverworldMap;
	directionInput!: DirectionInput;

	constructor(public config: OverworldConfig) {
		this.element = this.config.element as HTMLElement;
		this.canvas = this.element.querySelector('.game__canvas') as HTMLCanvasElement;
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

			this.currentAnimationFrame = requestAnimationFrame(step);
		};

		this.currentAnimationFrame = requestAnimationFrame(step);
	}

	destroy() {
		this.directionInput.destroy();
		cancelAnimationFrame(this.currentAnimationFrame);
	}

	init() {
		this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
		this.map.mountObjects();

		this.directionInput = new DirectionInput();
		this.directionInput.init();

		this.startGameLoop();

		this.map.startCutscene([
			{ type: 'textMessage', text: 'WHY HELLO THERE! What a lovely day?' },
			// { who: 'hero', type: 'walk', direction: 'down' },
			// { who: 'hero', type: 'walk', direction: 'down' },
			// { who: 'npcA', type: 'walk', direction: 'left' },
			// { who: 'npcA', type: 'walk', direction: 'left' },
			// { who: 'npcA', type: 'stand', direction: 'up', time: 800 },
		]);
	}
}

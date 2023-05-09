import { OverworldMap } from './OverworldMap';
import { DirectionInput } from './DirectionInput';

type OverworldConfig = {
	element: HTMLElement;
};

export class Overworld {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	map!: OverworldMap;
	directionInput!: DirectionInput;

	constructor(public config: OverworldConfig) {
		this.element = this.config.element as HTMLElement;
		this.canvas = this.element.querySelector('.game__canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
	}

	startGameLoop() {
		const step = () => {
			// Clear Canvas
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			// Camera person
			const cameraPerson = this.map.gameObjects.hero;

			// Update Game Objects
			Object.values(this.map.gameObjects).forEach(gameObject => {
				gameObject.update({
					arrow: this.directionInput.direction,
					map: this.map,
				});
			});

			// Draw Lower Image
			this.map.drawLowerImage(this.ctx, cameraPerson);

			// Draw Game Objects
			Object.values(this.map.gameObjects).forEach(gameObject => {
				gameObject.sprite.draw(this.ctx, cameraPerson);
			});

			// Draw Upper Image
			this.map.drawUpperImage(this.ctx, cameraPerson);

			requestAnimationFrame(step);
		};

		requestAnimationFrame(step);
	}

	init() {
		this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
		this.map.mountObjects();

		this.directionInput = new DirectionInput();
		this.directionInput.init();

		this.startGameLoop();
	}
}
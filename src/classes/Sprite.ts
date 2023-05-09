import { GameObject } from './GameObject';
import { createImage, withGrid } from '../utils/utils';

type AnimationType = {
	[key: string]: number[][];
};

type SpriteConfig = {
	animations?: AnimationType;
	currentAnimation?: string;
	animationFrameLimit?: number;
	useShadow?: boolean;
	src: string;
	gameObject: GameObject;
};

export class Sprite {
	readonly SHADOW_SRC = '../assets/images/characters/shadow.png';
	readonly NUDGE_X = 8;
	readonly NUDGE_Y = 18;

	animations: AnimationType;
	currentAnimation: string;
	currentAnimationFrame: number;
	animationFrameLimit: number;
	animationFrameProgress: number;
	useShadow: boolean;
	image!: HTMLImageElement;
	shadow!: HTMLImageElement;
	isLoaded = false;
	isShadowLoaded = false;
	gameObject: GameObject;

	constructor(config: SpriteConfig) {
		// Sprite Image
		createImage(config.src).then(image => {
			this.image = image;
			this.isLoaded = true;
		});

		// Shadow
		this.useShadow = config.useShadow || true;

		if (this.useShadow) {
			createImage(this.SHADOW_SRC).then(image => {
				this.shadow = image;
				this.isShadowLoaded = true;
			});
		}

		// Animation and initial state
		this.animations = config.animations || {
			'idle-up': [[0, 2]],
			'idle-down': [[0, 0]],
			'idle-left': [[0, 3]],
			'idle-right': [[0, 1]],
			'walk-up': [
				[1, 2],
				[0, 2],
				[3, 2],
				[0, 2],
			],
			'walk-down': [
				[1, 0],
				[0, 0],
				[3, 0],
				[0, 0],
			],
			'walk-left': [
				[1, 3],
				[0, 3],
				[3, 3],
				[0, 3],
			],
			'walk-right': [
				[1, 1],
				[0, 1],
				[3, 1],
				[0, 1],
			],
		};
		this.currentAnimation = config.currentAnimation || 'idle-right';
		this.currentAnimationFrame = 0;

		// game loop frames per animation frame (lower is faster)
		this.animationFrameLimit = config.animationFrameLimit || 16;
		this.animationFrameProgress = this.animationFrameLimit;

		// Game Object reference
		this.gameObject = config.gameObject;
	}

	get frame() {
		return this.animations[this.currentAnimation][this.currentAnimationFrame];
	}

	setAnimation(key: string) {
		if (this.currentAnimation === key) return;

		this.currentAnimation = key;
		this.currentAnimationFrame = 0;
		this.animationFrameProgress = this.animationFrameLimit;
	}

	updateAnimationProgress() {
		if (this.animationFrameProgress > 0) {
			this.animationFrameProgress--;
			return;
		}

		this.animationFrameProgress = this.animationFrameLimit;
		this.currentAnimationFrame++;

		if (!this.frame) this.currentAnimationFrame = 0;
	}

	draw(ctx: CanvasRenderingContext2D, cameraPerson: GameObject) {
		const x = this.gameObject.x - this.NUDGE_X + withGrid(10.5) - cameraPerson.x;
		const y = this.gameObject.y - this.NUDGE_Y + withGrid(6) - cameraPerson.y;

		this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

		// Animation
		const [frameX, frameY] = this.frame;

		this.isLoaded &&
			ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);

		this.updateAnimationProgress();
	}
}

import { Detail } from '../models/types';

export const getSrc = (src: string) => new URL(src, import.meta.url).href;

export const createImage = (src: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const image = new Image();

		image.src = getSrc(src);
		image.onload = () => resolve(image);
		image.onerror = reject;
	});
};

export const getElement = <T extends HTMLElement>(
	selector: string,
	parent: Document | HTMLElement = document
): T => {
	return parent.querySelector(selector) as T;
};

export const withGrid = (n: number) => n * 16;

export const asGridCoord = (x: number, y: number) => `${x * 16},${y * 16}`;

export const nextPosition = (initialX: number, initialY: number, dir: string) => {
	const size = 16;

	switch (dir) {
		case 'left':
			return { x: initialX - size, y: initialY };
		case 'right':
			return { x: initialX + size, y: initialY };
		case 'up':
			return { x: initialX, y: initialY - size };
		case 'down':
			return { x: initialX, y: initialY + size };
		default:
			return { x: initialX, y: initialY };
	}
};

export const emitEvent = (name: string, detail: Detail) => {
	const event = new CustomEvent(name, { detail });

	document.dispatchEvent(event);
};

export const oppositeDirection = (direction: string) => {
	switch (direction) {
		case 'left':
			return 'right';
		case 'right':
			return 'left';
		case 'up':
			return 'down';
		default:
			return 'up';
	}
};

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

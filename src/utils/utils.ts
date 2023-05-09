export const createImage = (src: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const url = new URL(src, import.meta.url);
		const image = new Image();

		image.src = url.href;
		image.onload = () => resolve(image);
		image.onerror = reject;
	});
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
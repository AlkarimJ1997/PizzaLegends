type Keymap = {
	ArrowUp: 'up';
	ArrowDown: 'down';
	ArrowLeft: 'left';
	ArrowRight: 'right';
	KeyW: 'up';
	KeyS: 'down';
	KeyA: 'left';
	KeyD: 'right';
};

export class DirectionInput {
	heldDirections: string[];
	map: Keymap;

	constructor() {
		this.heldDirections = [];
		this.map = {
			ArrowUp: 'up',
			KeyW: 'up',
			ArrowDown: 'down',
			KeyS: 'down',
			ArrowLeft: 'left',
			KeyA: 'left',
			ArrowRight: 'right',
			KeyD: 'right',
		};
	}

	get direction() {
		return this.heldDirections[0];
	}

	init() {
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			const dir = this.map[e.code as keyof Keymap];

			if (dir && this.heldDirections.indexOf(dir) === -1) {
				this.heldDirections.unshift(dir);
			}
		});

		document.addEventListener('keyup', (e: KeyboardEvent) => {
			const dir = this.map[e.code as keyof Keymap];
			const index = this.heldDirections.indexOf(dir);

			if (index > -1) {
				this.heldDirections.splice(index, 1);
			}
		});
	}
}

export class Progress {
	mapId: string;
	startingHeroX: number;
	startingHeroY: number;
	startingHeroDirection: string;
	saveFileKey: string;

	constructor() {
		this.mapId = 'Kitchen';
		this.startingHeroX = 0;
		this.startingHeroY = 0;
		this.startingHeroDirection = 'down';
		this.saveFileKey = 'PizzaLegends_SaveFile1';
	}

	save(): void {
		window.localStorage.setItem(
			this.saveFileKey,
			JSON.stringify({
				mapId: this.mapId,
				startingHeroX: this.startingHeroX,
				startingHeroY: this.startingHeroY,
				startingHeroDirection: this.startingHeroDirection,
				playerState: {
					pizzas: window.playerState.pizzas,
					lineup: window.playerState.lineup,
					items: window.playerState.items,
					storyFlags: window.playerState.storyFlags,
				},
			})
		);
	}

	getSaveFile(): SaveFile | null {
		const saveFile = window.localStorage.getItem(this.saveFileKey);

		return saveFile ? JSON.parse(saveFile) : null;
	}

	load() {
		const saveFile = this.getSaveFile();

		if (!saveFile) return;

		this.mapId = saveFile.mapId;
		this.startingHeroX = saveFile.startingHeroX;
		this.startingHeroY = saveFile.startingHeroY;
		this.startingHeroDirection = saveFile.startingHeroDirection;

		Object.keys(saveFile.playerState).forEach(key => {
			window.playerState[key] = saveFile.playerState[key];
		});
	}
}

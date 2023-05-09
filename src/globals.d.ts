declare global {
	interface Window {
		OverworldMaps: {
			[key: string]: OverworldMapConfig;
		};
	}

	interface DocumentEventMap {
		PersonWalkingComplete: CustomEvent<Detail>;
        PersonStandingComplete: CustomEvent<Detail>;
	}
}

export {};

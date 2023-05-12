declare global {
	interface Window {
		OverworldMaps: {
			[key: string]: OverworldMapConfig;
		};
		PizzaTypes: {
			[key: string]: string;
		};
		Pizzas: {
			[key: string]: PizzaConfig;
		};
		Actions: {
			[key: string]: ActionConfig;
		};
		BattleAnimations: {
			[key: string]: (event: BattleEventType, onComplete: () => void) => void;
		};
	}

	interface DocumentEventMap {
		PersonWalkingComplete: CustomEvent<Detail>;
		PersonStandingComplete: CustomEvent<Detail>;
	}
}

export {};

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
	}

	interface DocumentEventMap {
		PersonWalkingComplete: CustomEvent<Detail>;
		PersonStandingComplete: CustomEvent<Detail>;
	}
}

export {};

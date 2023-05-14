declare global {
	// Class Interfaces
	interface Overworld {
		element: HTMLElement;
		canvas: HTMLCanvasElement;
		ctx: CanvasRenderingContext2D;
		currentAnimationFrame: number;
		map: OverworldMap;
		directionInput: DirectionInput;

		startGameLoop(): void;
		bindActionInput(): void;
		bindHeroPositionCheck(): void;
		startMap(mapConfig: OverworldMapConfig): void;
		init(): void;
	}

	interface OverworldMap {
		overworld: Overworld | null;
		gameObjects: GameObjects;
		walls: Walls;
		lowerImage: HTMLImageElement;
		upperImage: HTMLImageElement;
		isCutscenePlaying: boolean;
		cutsceneSpaces: CutsceneSpaces;

		drawLowerImage(
			ctx: CanvasRenderingContext2D,
			cameraPerson: GameObject
		): void;
		drawUpperImage(
			ctx: CanvasRenderingContext2D,
			cameraPerson: GameObject
		): void;
		mountObjects(): void;
		startCutscene(events: BehaviorLoopEvent[]): Promise<void>;
		checkForActionCutscene(): void;
		checkForFootstepCutscene(): void;
		isSpaceTaken(
			currentX: number,
			currentY: number,
			direction: string
		): boolean;
		addWall(x: number, y: number): void;
		removeWall(x: number, y: number): void;
		moveWall(wasX: number, wasY: number, direction: string): void;
	}

	interface GameObject {
		isStanding: boolean;
		id: string | null;
		isMounted: boolean;
		x: number;
		y: number;
		direction: string;
		sprite: Sprite;
		behaviorLoop: BehaviorLoopEvent[];
		behaviorLoopIndex: number;
		talking: TalkEvent[];

		doBehaviorEvent(map: OverworldMap): Promise<void>;
		mount(map: OverworldMap): void;
		update(state: State): void;
	}

	interface Person extends GameObject {
		isStanding: boolean;
		movingProgressRemaining: number;
		isPlayerControlled: boolean;
		directionUpdate: DirectionUpdate;

		updatePosition(): void;
		updateSprite(): void;
		startBehavior(state: State, behavior: BehaviorLoopEvent): void;
		update(state: State): void;
	}

	interface Battle {
		element: HTMLDivElement;
		onComplete: () => void;
		combatants: Combatants;
		activeCombatants: ActiveCombatants;
        items: Item[];
		turnCycle: TurnCycle;

		createElement(): void;
		init(container: HTMLDivElement): void;
	}

	interface Combatant {
		id: string;
		name: string;
		type: PizzaType;
		src: string;
		icon: string;
		actions: string[];
		team: TeamType;
		hp: number;
		maxHp: number;
		xp: number;
		maxXp: number;
		level: number;
		status?: {
			type: string;
			expiresIn: number;
		} | null;
		isPlayerControlled: boolean;

		battle: Battle;

		hudElement: HTMLDivElement;
		pizzaElement: HTMLImageElement;
		hpFills: NodeListOf<SVGRectElement>;
		xpFills: NodeListOf<SVGRectElement>;

		get hpPercentage(): number;
		get xpPercentage(): number;
		get isActive(): boolean;
		setProperty<T extends keyof CombatantConfig>(
			property: T,
			value: CombatantConfig[T]
		): void;
		createElement(): void;
		update(changes: Partial<CombatantConfig> = {}): void;
		getReplacedEvents(originalEvents: BattleEventType[]): BattleEventType[];
		getPostEvents(): BattleEventType[];
		decrementStatus(): null | BattleEventType;
		init(container: HTMLDivElement): void;
	}

	// GameObject.ts types
	type GameObjectConfig = {
		x?: number;
		y?: number;
		src?: string;
		direction?: 'up' | 'down' | 'left' | 'right';
		behaviorLoop?: BehaviorLoopEvent[];
		talking?: TalkEvent[];
	};

	type State = {
		arrow?: string;
		map: OverworldMap;
	};

	type BehaviorLoopEvent = {
		who?: string;
		type: string;
		direction?: string;
		time?: number;
		retry?: true;
		textLines?: TextObj[];
		faceHero?: string;
		map?: string;
	};

	type TalkEvent = {
		events: BehaviorLoopEvent[];
	};

	// OverworldMap.ts types
	type GameObjects = {
		[key: string]: GameObject;
	};

	type Walls = {
		[key: string]: boolean;
	};

	type CutsceneSpace = {
		events: BehaviorLoopEvent[];
	};

	type CutsceneSpaces = {
		[key: string]: CutsceneSpace[];
	};

	type OverworldMapConfig = {
		lowerSrc: string;
		upperSrc: string;
		gameObjects: GameObjects;
		walls?: Walls;
		cutsceneSpaces?: CutsceneSpaces;
	};

	// Person.ts types
	type PersonConfig = GameObjectConfig & {
		isPlayerControlled?: boolean;
	};

	type DirectionUpdate = {
		[key: string]: ['x' | 'y', 1 | -1];
	};

	// Message.ts and RevealingText.ts types
	enum SPEEDS {
		Pause = 500,
		Slow = 90,
		Normal = 60,
		Fast = 30,
		SuperFast = 10,
	}

	type TextObj = {
		speed: SPEEDS;
		string: string;
		pause?: boolean;
		classes?: string[];
	};

	// Event Detail types
	type Detail = {
		whoId: string;
	};

	// Combatant.ts types
	type CombatantConfig = {
		id?: string;
		name: string;
		type: PizzaType;
		src: string;
		icon: string;
		actions: string[];
		team: TeamType;
		hp: number;
		maxHp: number;
		xp: number;
		maxXp: number;
		level: number;
		status?: {
			type: string;
			expiresIn: number;
		} | null;
		isPlayerControlled?: boolean;
	};

	// Pizza Configurations
	enum PizzaType {
		Normal = 'normal',
		Spicy = 'spicy',
		Veggie = 'veggie',
		Fungi = 'fungi',
		Chill = 'chill',
	}

	type TeamType = 'player' | 'enemy';

	type PizzaConfig = {
		name: string;
		type: PizzaType;
		src: string;
		icon: string;
		actions: string[];
	};

	// Battle.ts types
	type Submission = {
		action: Action;
		target: Combatant;
        instanceId?: string;
	};

	type BattleEventType = {
		type: string;
		textLines?: TextObj[];
		caster?: Combatant;
		target?: Combatant;
		enemy?: Combatant; // TODO: Remove this?
		submission?: Submission;
		action?: Action;
		damage?: number;
		animation?: string;
		color?: string;
		recover?: number;
		onCaster?: boolean;
		status?: {
			type: string;
			expiresIn: number;
		} | null;
	};

	type Action = {
		name: string;
		targetType?: string;
		success: BattleEventType[];
	};

	type Item = {
		actionId: string;
		instanceId: string;
		team: 'player' | 'enemy';
	};

    type MappedItem = {
        actionId: string;
        instanceId: string;
        quantity: number;
    }

	// window Objects
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

	// Custom Events
	interface DocumentEventMap {
		PersonWalkingComplete: CustomEvent<Detail>;
		PersonStandingComplete: CustomEvent<Detail>;
	}
}

export {};

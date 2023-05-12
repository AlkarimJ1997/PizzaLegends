import { Combatant } from '../classes/Battle/Combatant';
import { GameObject } from '../classes/GameObject';
import { OverworldMap } from '../classes/OverworldMap';

// Talking Types
export enum SPEEDS {
	Pause = 500,
	Slow = 90,
	Normal = 60,
	Fast = 30,
	SuperFast = 10,
}

export type Text = {
	speed: SPEEDS;
	string: string;
	pause?: boolean;
	classes?: string[];
};

// OverworldMap types
export type GameObjects = {
	[key: string]: GameObject;
};

export type Walls = {
	[key: string]: boolean;
};

export type CutsceneSpace = {
	events: BehaviorLoopEvent[];
};

export type CutsceneSpaces = {
	[key: string]: CutsceneSpace[];
};

export type OverworldMapConfig = {
	lowerSrc: string;
	upperSrc: string;
	gameObjects: GameObjects;
	walls?: Walls;
	cutsceneSpaces?: CutsceneSpaces;
};

// GameObject types
export type BehaviorLoopEvent = {
	who?: string;
	type: string;
	direction?: string;
	time?: number;
	retry?: true;
	textLines?: Text[];
	faceHero?: string;
	map?: string;
};

export type TalkEvent = {
	events: BehaviorLoopEvent[];
};

export type GameObjectConfig = {
	x?: number;
	y?: number;
	src?: string;
	direction?: 'up' | 'down' | 'left' | 'right';
	behaviorLoop?: BehaviorLoopEvent[];
	talking?: TalkEvent[];
};

export type State = {
	arrow?: string;
	map: OverworldMap;
};

// Person types
export type PersonConfig = GameObjectConfig & {
	isPlayerControlled?: boolean;
};

// Event Detail types
export type Detail = {
	whoId: string;
};

// Pizza types
export type PizzaType = 'normal' | 'spicy' | 'veggie' | 'fungi' | 'chill';

export type TeamType = 'player' | 'enemy';

export type PizzaConfig = {
	name: string;
	type: PizzaType;
	src: string;
	icon: string;
};

// Battle types
export type Submission = {
	action: Action;
	target: Combatant;
};

export type BattleEventType = {
	type: string;
	textLines?: Text[];
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

export type Action = {
	name: string;
    targetType?: string;
	success: BattleEventType[];
};

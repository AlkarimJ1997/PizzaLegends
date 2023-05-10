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

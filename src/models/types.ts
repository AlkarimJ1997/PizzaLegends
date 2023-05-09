import { OverworldMap } from '../classes/OverworldMap';

// Game Object types
export type BehaviorLoopEvent = {
    who?: string;
	type: string;
	direction: string;
	time?: number;
    retry?: true;
};

export type GameObjectConfig = {
	x?: number;
	y?: number;
	src?: string;
	direction?: 'up' | 'down' | 'left' | 'right';
	behaviorLoop?: BehaviorLoopEvent[];
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
}
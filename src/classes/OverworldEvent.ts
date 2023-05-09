import { OverworldMap } from './OverworldMap';
import { Person } from './Person';
import { BehaviorLoopEvent, Detail } from '../models/types';
import { TextMessage } from './TextMessage';

type OverworldEventConfig = {
	map: OverworldMap;
	event: BehaviorLoopEvent;
};

type OverworldEventMethod = (resolve: () => void) => void;

export class OverworldEvent {
	map: OverworldMap;
	event: BehaviorLoopEvent;

	constructor({ map, event }: OverworldEventConfig) {
		this.map = map;
		this.event = event;
	}

	stand(resolve: () => void) {
		const who = this.map.gameObjects[this.event.who as string] as Person;

		who.startBehavior(
			{ map: this.map },
			{
				type: 'stand',
				direction: this.event.direction,
				time: this.event.time,
			}
		);

		// Complete handler for the PersonStandingComplete event
		const completeHandler = (e: CustomEvent<Detail>) => {
			if (e.detail.whoId === this.event.who) {
				document.removeEventListener('PersonStandingComplete', completeHandler);
				resolve();
			}
		};

		// Listen for the PersonStandingComplete event
		document.addEventListener('PersonStandingComplete', completeHandler);
	}

	walk(resolve: () => void) {
		const who = this.map.gameObjects[this.event.who as string] as Person;

		who.startBehavior(
			{ map: this.map },
			{
				type: 'walk',
				direction: this.event.direction,
				retry: true,
			}
		);

		// Complete handler for the PersonWalkingComplete event
		const completeHandler = (e: CustomEvent<Detail>) => {
			if (e.detail.whoId === this.event.who) {
				document.removeEventListener('PersonWalkingComplete', completeHandler);
				resolve();
			}
		};

		// Listen for the PersonWalkingComplete event
		document.addEventListener('PersonWalkingComplete', completeHandler);
	}

	textMessage(resolve: () => void) {
		const message = new TextMessage({
			text: this.event.text as string,
			onComplete: () => resolve(),
		});

		message.init(document.querySelector('.game') as HTMLDivElement);
	}

	init() {
		const eventHandlers: Record<string, OverworldEventMethod> = {
			stand: this.stand.bind(this),
			walk: this.walk.bind(this),
			textMessage: this.textMessage.bind(this),
		};

		return new Promise<void>(resolve => {
			eventHandlers[this.event.type](resolve);
		});
	}
}

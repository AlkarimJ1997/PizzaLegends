import { OverworldMap } from './OverworldMap';
import { Person } from './Person';
import { BehaviorLoopEvent, Detail } from '../models/types';
import { TextMessage } from './TextMessage';
import { oppositeDirection } from '../utils/utils';

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

		// TODO: I MADE THIS CODE MYSELF TO FIX A BUG (WE'LL SEE IF THERE ARE ANY SIDE EFFECTS)
		if (
			who.id === 'hero' &&
			this.event.direction &&
			this.map.isSpaceTaken(who.x, who.y, this.event.direction)
		) {
			who.direction = this.event.direction;
			resolve();
			return;
		}
		// TODO: END OF MY CODE

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
		if (this.event.faceHero) {
			const hero = this.map.gameObjects.hero;
			const obj = this.map.gameObjects[this.event.faceHero];

			obj.direction = oppositeDirection(hero.direction);
		}

		const message = new TextMessage({
			text: this.event.text as string,
			onComplete: () => resolve(),
		});

		message.init(document.querySelector('.game') as HTMLDivElement);
	}

	changeMap(resolve: () => void) {
		this.map.overworld?.startMap(window.OverworldMaps[this.event.map as string]);
		resolve();
	}

	init() {
		const eventHandlers: Record<string, OverworldEventMethod> = {
			stand: this.stand.bind(this),
			walk: this.walk.bind(this),
			textMessage: this.textMessage.bind(this),
			changeMap: this.changeMap.bind(this),
		};

		return new Promise<void>(resolve => {
			eventHandlers[this.event.type](resolve);
		});
	}
}

import { Message } from './Message';
import { SceneTransition } from './SceneTransition';
import { Battle } from './Battle/Battle';
import { oppositeDirection, getElement } from '../utils/utils';

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

	message(resolve: () => void) {
		if (this.event.faceHero) {
			const hero = this.map.gameObjects.hero;
			const obj = this.map.gameObjects[this.event.faceHero];

			obj.direction = oppositeDirection(hero.direction);
		}

		const messageInstance = new Message({
			textLines: this.event.textLines as TextObj[],
			onComplete: () => resolve(),
		});

		messageInstance.init(getElement<HTMLDivElement>('.game'));
	}

	changeMap(resolve: () => void) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			this.map.overworld?.startMap(
				window.OverworldMaps[this.event.map as string]
			);
			resolve();

			sceneTransition.fadeOut();
		});
	}

	battle(resolve: () => void) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			const battle = new Battle({
				onComplete: () => {
					resolve();
				},
			});

			battle.init(getElement<HTMLDivElement>('.game'));

			// After battle is over
			sceneTransition.fadeOut();
		});
	}

	init() {
		const eventHandlers: Record<string, OverworldEventMethod> = {
			stand: this.stand.bind(this),
			walk: this.walk.bind(this),
			message: this.message.bind(this),
			changeMap: this.changeMap.bind(this),
			battle: this.battle.bind(this),
		};

		return new Promise<void>(resolve => {
			eventHandlers[this.event.type](resolve);
		});
	}
}

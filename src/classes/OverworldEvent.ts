import { Message } from './Message';
import { SceneTransition } from './SceneTransition';
import { Battle } from './Battle/Battle';
import { oppositeDirection, getElement } from '../utils/utils';
import { PauseMenu } from './PauseMenu';

type OverworldEventConfig = {
	map: OverworldMap;
	event: BehaviorLoopEvent;
};

type BattleResolve<T> = (value?: T | PromiseLike<T>) => void;

type OverworldEventMethod = (resolve: () => void) => void | string;

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

	battle(resolve: BattleResolve<'WON_BATTLE' | 'LOST_BATTLE'>) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			const battle = new Battle({
				enemy: window.Enemies[this.event.enemyId as string],
				onComplete: didWin => {
					resolve(didWin ? 'WON_BATTLE' : 'LOST_BATTLE');
				},
			});

			battle.init(getElement<HTMLDivElement>('.game'));

			// After battle is over
			sceneTransition.fadeOut();
		});
	}

	pause(resolve: () => void) {
		this.map.isPaused = true;

		const menu = new PauseMenu({
			onComplete: () => {
				resolve();
				this.map.isPaused = false;
				this.map.overworld?.startGameLoop();
			},
		});

		menu.init(getElement<HTMLDivElement>('.game'));
	}

	addStoryFlag(resolve: () => void) {
		window.playerState.storyFlags[this.event.flag] = true;
		resolve();
	}

	init() {
		const eventHandlers: Record<string, OverworldEventMethod> = {
			stand: this.stand.bind(this),
			walk: this.walk.bind(this),
			message: this.message.bind(this),
			changeMap: this.changeMap.bind(this),
			battle: this.battle.bind(this),
			pause: this.pause.bind(this),
			addStoryFlag: this.addStoryFlag.bind(this),
		};

		return new Promise<void | string>(resolve => {
			eventHandlers[this.event.type](resolve);
		});
	}
}

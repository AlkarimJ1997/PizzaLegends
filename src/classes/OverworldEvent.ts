import { Message } from './Message';
import { SceneTransition } from './SceneTransition';
import { Battle } from './Battle/Battle';
import { PauseMenu } from './PauseMenu';
import { CraftingMenu } from './CraftingMenu';
import { oppositeDirection, getElement } from '../utils/utils';

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
		if (!this.event.who) throw new Error('No who specified in event');

		const who = this.map.gameObjects[this.event.who] as Person;

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

	jump(resolve: () => void) {
		if (!this.event.who) throw new Error('No who specified in event');

		const who = this.map.gameObjects[this.event.who] as Person;
		const { hero } = this.map.gameObjects;

		who.direction = oppositeDirection(hero.direction);

		setTimeout(() => {
			who.sprite.jumpHeight += 10;

			setTimeout(() => {
				who.sprite.jumpHeight -= 10;
				resolve();
			}, this.event.time || 500);
		}, 200);
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
		// Demount all game objects
		Object.values(this.map.gameObjects).forEach(obj => (obj.isMounted = false));

		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			const { OverworldMaps } = window;
			const { map, x, y, direction } = this.event ?? {};

			if (!map) throw new Error('No map specified in event');

			if (!x || !y || !direction) {
				this.map.overworld?.startMap(OverworldMaps[map]);
			} else {
				this.map.overworld?.startMap(OverworldMaps[map], { x, y, direction });
			}

			resolve();
			sceneTransition.fadeOut();
		});
	}

	battle(resolve: BattleResolve<'WON_BATTLE' | 'LOST_BATTLE'>) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			if (!this.event.enemyId) throw new Error('No enemy specified in event');

			const battle = new Battle({
				enemy: window.Enemies[this.event.enemyId],
				arena: this.event.arena || null,
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
			progress: this.map.overworld?.progress,
			onComplete: () => {
				resolve();
				this.map.isPaused = false;
				this.map.overworld?.startGameLoop();
			},
		});

		menu.init(getElement<HTMLDivElement>('.game'));
	}

	addStoryFlag(resolve: () => void) {
		if (!this.event.flag) throw new Error('No flag specified in event');

		window.playerState.storyFlags[this.event.flag] = true;
		resolve();
	}

	craftingMenu(resolve: () => void) {
		const menu = new CraftingMenu({
			pizzas: this.event.pizzas as string[],
			onComplete: () => {
				resolve();
			},
		});

		menu.init(getElement<HTMLDivElement>('.game'));
	}

	init() {
		const eventHandlers: Record<string, OverworldEventMethod> = {
			stand: this.stand.bind(this),
			walk: this.walk.bind(this),
			jump: this.jump.bind(this),
			message: this.message.bind(this),
			changeMap: this.changeMap.bind(this),
			battle: this.battle.bind(this),
			pause: this.pause.bind(this),
			addStoryFlag: this.addStoryFlag.bind(this),
			craftingMenu: this.craftingMenu.bind(this),
		};

		return new Promise<void | string>(resolve => {
			eventHandlers[this.event.type](resolve);
		});
	}
}

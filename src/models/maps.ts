import { Person } from '../classes/Person';
import { withGrid, asGridCoord } from '../utils/utils';

window.OverworldMaps = {
	DemoRoom: {
		lowerSrc: '../assets/images/maps/DemoLower.png',
		upperSrc: '../assets/images/maps/DemoUpper.png',
		gameObjects: {
			hero: new Person({
				isPlayerControlled: true,
				x: withGrid(5),
				y: withGrid(6),
			}),
			npcA: new Person({
				x: withGrid(7),
				y: withGrid(9),
				src: '../assets/images/characters/people/npc1.png',
				behaviorLoop: [
					{ type: 'stand', direction: 'left', time: 800 },
					{ type: 'stand', direction: 'up', time: 800 },
					{ type: 'stand', direction: 'right', time: 1200 },
					{ type: 'stand', direction: 'up', time: 300 },
				],
			}),
			npcB: new Person({
				x: withGrid(3),
				y: withGrid(7),
				src: '../assets/images/characters/people/npc2.png',
				behaviorLoop: [
					{ type: 'walk', direction: 'left' },
					{ type: 'stand', direction: 'up', time: 800 },
					{ type: 'walk', direction: 'up' },
					{ type: 'walk', direction: 'right' },
					{ type: 'walk', direction: 'down' },
				],
			}),
		},
		walls: {
			[asGridCoord(7, 6)]: true,
			[asGridCoord(8, 6)]: true,
			[asGridCoord(7, 7)]: true,
			[asGridCoord(8, 7)]: true,
		},
	},
	// Kitchen: {
	// 	lowerSrc: '../assets/images/maps/KitchenLower.png',
	// 	upperSrc: '../assets/images/maps/KitchenUpper.png',
	// 	gameObjects: {
	// 		hero: new GameObject({
	// 			x: 3,
	// 			y: 5,
	// 		}),
	// 		npcA: new GameObject({
	// 			x: 9,
	// 			y: 6,
	// 			src: '../assets/images/characters/people/npc2.png',
	// 		}),
	// 		npcB: new GameObject({
	// 			x: 10,
	// 			y: 8,
	// 			src: '../assets/images/characters/people/npc3.png',
	// 		}),
	// 	},
	// },
};

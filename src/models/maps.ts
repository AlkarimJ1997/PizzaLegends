import { Person } from '../classes/Person';
import { SPEEDS } from '../data/enums';
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
				talking: [
					{
						required: ['TALKED_TO_ERIO'],
						events: [
							{
								type: 'message',
								textLines: [
									{
										speed: SPEEDS.Fast,
										string: "Isn't Erio the coolest?",
									},
								],
								faceHero: 'npcA',
							},
						],
					},
					{
						required: ['DEFEATED_BETH'],
						events: [
							{
								type: 'message',
								textLines: [
									{
										speed: SPEEDS.Fast,
										string: "What do you want now? I'm busy!",
									},
								],
								faceHero: 'npcA',
							},
						],
					},
					{
						events: [
							{
								type: 'message',
								textLines: [
									{
										speed: SPEEDS.Normal,
										string: "I'm going to crush you!",
									},
									// { speed: SPEEDS.Pause, string: '', pause: true },
									// { speed: SPEEDS.Fast, string: 'Go away!' },
								],
								faceHero: 'npcA',
							},
							{ type: 'battle', enemyId: 'beth' },
							{ type: 'addStoryFlag', flag: 'DEFEATED_BETH' },
							{
								type: 'message',
								textLines: [
									{
										speed: SPEEDS.Fast,
										string: 'You crushed me like weak pepper.',
									},
								],
							},
							// { type: 'walk', direction: 'up', who: 'hero' },
						],
					},
				],
			}),
			npcB: new Person({
				x: withGrid(8),
				y: withGrid(5),
				src: '../assets/images/characters/people/erio.png',
				// behaviorLoop: [
				// 	{ type: 'walk', direction: 'left' },
				// 	{ type: 'stand', direction: 'up', time: 800 },
				// 	{ type: 'walk', direction: 'up' },
				// 	{ type: 'walk', direction: 'right' },
				// 	{ type: 'walk', direction: 'down' },
				// ],
				talking: [
					{
						events: [
							{
								type: 'message',
								textLines: [{ speed: SPEEDS.SuperFast, string: 'Bahaha!' }],
								faceHero: 'npcB',
							},
							{ type: 'addStoryFlag', flag: 'TALKED_TO_ERIO' },
							// { type: 'battle', enemyId: 'erio' },
						],
					},
				],
			}),
		},
		walls: {
			[asGridCoord(7, 6)]: true,
			[asGridCoord(8, 6)]: true,
			[asGridCoord(7, 7)]: true,
			[asGridCoord(8, 7)]: true,
		},
		cutsceneSpaces: {
			[asGridCoord(7, 4)]: [
				{
					events: [
						{ who: 'npcB', type: 'walk', direction: 'left' },
						{ who: 'npcB', type: 'stand', direction: 'up', time: 500 },
						{
							type: 'message',
							textLines: [
								{
									speed: SPEEDS.Fast,
									string: "You can't be in there!",
									classes: ['red'],
								},
							],
						},
						{ who: 'npcB', type: 'walk', direction: 'right' },
						{ who: 'npcB', type: 'stand', direction: 'down', time: 100 },
						{ who: 'hero', type: 'walk', direction: 'down' },
						{ who: 'hero', type: 'walk', direction: 'left' },
					],
				},
			],
			[asGridCoord(5, 10)]: [
				{
					events: [{ type: 'changeMap', map: 'Kitchen' }],
				},
			],
		},
	},
	Kitchen: {
		lowerSrc: '../assets/images/maps/KitchenLower.png',
		upperSrc: '../assets/images/maps/KitchenUpper.png',
		gameObjects: {
			hero: new Person({
				isPlayerControlled: true,
				x: withGrid(5),
				y: withGrid(5),
			}),
			npcB: new Person({
				x: withGrid(10),
				y: withGrid(8),
				src: '../assets/images/characters/people/npc3.png',
				talking: [
					{
						events: [
							{
								type: 'message',
								textLines: [{ speed: SPEEDS.Normal, string: 'You made it!' }],
								faceHero: 'npcB',
							},
						],
					},
				],
			}),
		},
	},
};

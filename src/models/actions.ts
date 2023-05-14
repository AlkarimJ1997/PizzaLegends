import { SPEEDS } from '../data/enums';

window.Actions = {
	damage1: {
		name: 'Fling',
		description: 'Fling yourself at your opponent',
		icon: '🍕',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
			},
			{ type: 'animation', animation: 'spin' },
			{ type: 'stateChange', damage: 10 },
		],
	},
	saucyStatus: {
		name: 'Tomato Squeeze',
		description: 'Squeeze tomato sauce for an HP boost',
		icon: '🍅',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
			},
			{
				type: 'stateChange',
				status: {
					type: 'saucy',
					expiresIn: 3,
				},
			},
		],
	},
	clumsyStatus: {
		name: 'Olive Oil',
		description: 'Spray olive oil to make your opponent slip',
		icon: '🫒',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
			},
			{ type: 'animation', animation: 'glob', color: 'var(--clr-olive-oil)' },
			{ type: 'animation', animation: 'slip' },
			{
				type: 'stateChange',
				status: {
					type: 'clumsy',
					expiresIn: 3,
				},
			},
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{TARGET} is slipping all around!' },
				],
			},
		],
	},
	protect1: {
		name: 'Pizza Shield',
		description: 'Protect yourself from damage',
		icon: '🛡️',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
			},
			{ type: 'animation', animation: 'shield' },
			{
				type: 'stateChange',
				status: {
					type: 'protected',
					expiresIn: 1,
				},
			},
		],
	},
	// Items
	item_recoverStatus: {
		name: 'Heating Lamp',
		description: 'Feeling fresh and warm',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{CASTER} used a {ACTION}!' },
				],
			},
			{ type: 'stateChange', status: null },
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{TARGET} is feeling' },
					{ speed: SPEEDS.Fast, string: 'fresh!', classes: ['blue'] },
				],
			},
		],
	},
	item_recoverHp: {
		name: 'Parmesan',
		description: 'Recover some HP',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{CASTER} sprinkled some {ACTION}!' },
				],
			},
			{ type: 'stateChange', recover: 10 },
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{TARGET} recovered' },
					{ speed: SPEEDS.Fast, string: '10 HP!', classes: ['green'] },
				],
			},
		],
	},
};

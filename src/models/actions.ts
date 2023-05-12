import { SPEEDS } from './types';

window.Actions = {
	damage1: {
		name: 'Fling',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Normal, string: '{CASTER} uses {ACTION}!' }],
			},
			// { type: 'animation', animation: 'TODO' },
			// { type: 'stateChange', damage: 10 },
		],
	},
};

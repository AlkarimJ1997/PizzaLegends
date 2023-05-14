import { PlayerState } from "../data/PlayerState";

window.Enemies = {
	erio: {
		name: 'Erio',
		src: '../assets/images/characters/people/erio.png',
		pizzas: {
			a: {
				pizzaId: 's001',
				maxHp: 50,
				level: 1,
			},
			b: {
				pizzaId: 's002',
				maxHp: 50,
				level: 1,
			},
		},
	},
	beth: {
		name: 'Beth',
		src: '../assets/images/characters/people/npc1.png',
		pizzas: {
			a: {
				pizzaId: 's001',
				hp: 1,
				maxHp: 50,
				level: 1,
			},
		},
	},
};

window.playerState = new PlayerState();
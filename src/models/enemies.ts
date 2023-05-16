import { PlayerState } from '../data/PlayerState';

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
	chefRootie: {
		name: 'Rootie',
		src: '../assets/images/characters/people/secondBoss.png',
		pizzas: {
			a: {
				pizzaId: 'f002',
				maxHp: 30,
				level: 2,
			},
		},
	},
	streetNorthBattle: {
		name: 'Pizza Thug',
		src: '../assets/images/characters/people/npc8.png',
		pizzas: {
			a: {
				pizzaId: 's001',
				maxHp: 20,
				level: 1,
			},
		},
	},
	diningRoomBattle: {
		name: 'Pizza Thug',
		src: '../assets/images/characters/people/npc8.png',
		pizzas: {
			a: {
				pizzaId: 's001',
				maxHp: 15,
				level: 1,
			},
			b: {
				pizzaId: 's002',
				maxHp: 15,
				level: 1,
			},
		},
	},
	streetBattle: {
		name: 'Pizza Thug',
		src: '../assets/images/characters/people/npc8.png',
		pizzas: {
			a: {
				pizzaId: 'f002',
				maxHp: 25,
				level: 1,
			},
		},
	},
};

window.playerState = new PlayerState();

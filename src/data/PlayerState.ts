import { emitEvent } from '../utils/utils';

export class PlayerState {
	pizzas: { [key: string]: Partial<CombatantConfig> };
	lineup: string[];
	items: Item[];
	storyFlags: { [key: string]: boolean };
    [key: string]: unknown;

	constructor() {
		this.pizzas = {
			p1: {
				pizzaId: 's001',
				hp: 50,
				maxHp: 50,
				xp: 0,
				maxXp: 100,
				level: 1,
				status: null,
			},
		};

		this.lineup = ['p1'];
		this.items = [
			{ actionId: 'item_recoverHp', instanceId: 'item1' },
			{ actionId: 'item_recoverHp', instanceId: 'item2' },
			{ actionId: 'item_recoverHp', instanceId: 'item3' },
		];

		this.storyFlags = {};
	}

	addPizza(pizzaId: string) {
		const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);

		this.pizzas[newId] = {
			pizzaId,
			hp: 50,
			maxHp: 50,
			xp: 0,
			maxXp: 100,
			level: 1,
			status: null,
		};

		if (this.lineup.length < 3) this.lineup.push(newId);

		emitEvent('LineupChanged', {});
	}

	swapLineup(oldId: string, incomingId: string) {
		const oldIndex = this.lineup.indexOf(oldId);
		this.lineup[oldIndex] = incomingId;

		emitEvent('LineupChanged', {});
	}

	moveToFront(incomingId: string) {
		this.lineup = this.lineup.filter(id => id !== incomingId);
		this.lineup.unshift(incomingId);

		emitEvent('LineupChanged', {});
	}
}

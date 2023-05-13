import { PizzaType } from '../data/enums';
import { getSrc } from '../utils/utils';

window.Pizzas = {
	s001: {
		name: 'Slice Samurai',
		type: PizzaType.Normal,
		src: getSrc('../assets/images/characters/pizzas/s001.png'),
		icon: getSrc('../assets/images/icons/spicy.png'),
		actions: ['damage1', 'clumsyStatus', 'saucyStatus', 'protect1'],
	},
	v001: {
		name: 'Call Me Kale',
		type: PizzaType.Veggie,
		src: getSrc('../assets/images/characters/pizzas/v001.png'),
		icon: getSrc('../assets/images/icons/veggie.png'),
		actions: ['protect1', 'damage1'],
	},
	f001: {
		name: 'Portobello Express',
		type: PizzaType.Fungi,
		src: getSrc('../assets/images/characters/pizzas/f001.png'),
		icon: getSrc('../assets/images/icons/fungi.png'),
		actions: ['damage1'],
	},
};

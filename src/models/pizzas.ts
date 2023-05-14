import { PizzaType } from '../data/enums';
import { getSrc } from '../utils/utils';

window.Pizzas = {
	s001: {
		name: 'Slice Samurai',
		description: 'A pizza with hard crust, ready to fight!',
		type: PizzaType.Normal,
		src: getSrc('../assets/images/characters/pizzas/s001.png'),
		icon: getSrc('../assets/images/icons/spicy.png'),
		actions: ['damage1', 'clumsyStatus', 'saucyStatus', 'protect1'],
	},
	s002: {
		name: 'Bacon Brigade',
		description: 'A pizza with smokey bacon and a spicy kick!',
		type: PizzaType.Spicy,
		src: getSrc('../assets/images/characters/pizzas/s002.png'),
		icon: getSrc('../assets/images/icons/spicy.png'),
		actions: ['damage1', 'clumsyStatus', 'saucyStatus'],
	},
	v001: {
		name: 'Call Me Kale',
		description: 'A healthy pizza with kale and spinach!',
		type: PizzaType.Veggie,
		src: getSrc('../assets/images/characters/pizzas/v001.png'),
		icon: getSrc('../assets/images/icons/veggie.png'),
		actions: ['damage1'],
	},
	f001: {
		name: 'Portobello Express',
		description: 'A pizza with portobello mushrooms!',
		type: PizzaType.Fungi,
		src: getSrc('../assets/images/characters/pizzas/f001.png'),
		icon: getSrc('../assets/images/icons/fungi.png'),
		actions: ['damage1'],
	},
};

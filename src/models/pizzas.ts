import { getSrc } from '../utils/utils';

window.PizzaTypes = {
	normal: 'normal',
	spicy: 'spicy',
	veggie: 'veggie',
	fungi: 'fungi',
	chill: 'chill',
};

window.Pizzas = {
	s001: {
		name: 'Slice Samurai',
		type: window.PizzaTypes.normal,
		src: getSrc('../assets/images/characters/pizzas/s001.png'),
		icon: getSrc('../assets/images/icons/spicy.png'),
	},
	v001: {
		name: 'Call Me Kale',
		type: window.PizzaTypes.veggie,
		src: getSrc('../assets/images/characters/pizzas/v001.png'),
		icon: getSrc('../assets/images/icons/veggie.png'),
	},
	f001: {
		name: 'Portobello Express',
		type: window.PizzaTypes.fungi,
		src: getSrc('../assets/images/characters/pizzas/f001.png'),
		icon: getSrc('../assets/images/icons/fungi.png'),
	},
};

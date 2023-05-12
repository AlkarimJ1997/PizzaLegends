import { BattleEventType } from './types';
import { wait } from '../utils/utils';

window.BattleAnimations = {
	async spin(event: BattleEventType, onComplete: () => void) {
		const element = event.caster?.pizzaElement;
		const animationClass =
			event.caster?.team === 'player' ? 'spin-right' : 'spin-left';

		element?.classList.add(animationClass);

		// Remove the animation when it's done
		element?.addEventListener(
			'animationend',
			() => {
				element.classList.remove(animationClass);
			},
			{ once: true }
		);

		// Continue turn cycle right around when Pizzas collide
		await wait(100);
		onComplete();
	},
};

import { BattleEventType } from './types';
import { getElement, getSrc, wait } from '../utils/utils';

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
	async glob(event: BattleEventType, onComplete: () => void) {
		const { caster } = event;

		const element = document.createElement('div');

		element.classList.add('glob-orb');
		element.classList.add(
			caster?.team === 'player' ? 'glob-orb-right' : 'glob-orb-left'
		);

		element.innerHTML = `
            <img 
                src="${getSrc('../assets/images/animations/glob.png')}" 
                alt="Glob Orb" />
        `;

		element.addEventListener('animationend', () => {
			element.remove();
		});

		getElement('.battle').appendChild(element);

		await wait(820);
		onComplete();
	},
	async slip(event: BattleEventType, onComplete: () => void) {
		const element = event.target?.pizzaElement;

		element?.classList.add('slip');

		// Remove the animation when it's done
		element?.addEventListener(
			'animationend',
			() => {
				element.classList.remove('slip');
			},
			{ once: true }
		);

		onComplete();
	},
};

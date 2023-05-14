import { KeyPressListener } from './KeyPressListener';
import { getElement, getElements, isSingleEmoji } from '../utils/utils';
import '../styles/KeyboardMenu.css';

type Page = {
	label: string;
	description: string;
	disabled?: boolean;
	handler: () => void;
	right?: () => string;
};

export class KeyboardMenu {
	options: Page[];
	up: KeyPressListener | null;
	down: KeyPressListener | null;
	prevFocus: HTMLButtonElement | null;

	element!: HTMLDivElement;
	descriptionElement!: HTMLDivElement;
	descriptionElementText!: HTMLParagraphElement;

	constructor() {
		this.options = [];
		this.up = null;
		this.down = null;
		this.prevFocus = null;
	}

	setOptions(options: Page[]) {
		this.options = options;

		const optionHTML = this.options.map((option, index) => {
			const disabled = option.disabled ? 'disabled' : '';
			const rightOption = option.right ? option.right() : '';
			const emoji = isSingleEmoji(rightOption) ? 'emoji' : '';
			const img = rightOption.includes('img') ? 'img' : '';

			return `
                <div class='option'>
                    <button
                        ${disabled} 
                        data-button='${index}' 
                        data-description='${option.description}'>
                        ${option.label}
                    </button>
                    <span class='right ${emoji} ${img}'>
                        ${rightOption}
                    </span>
                </div>
            `;
		});

		this.element.innerHTML = optionHTML.join('');

		this.element.querySelectorAll('button').forEach(button => {
			button.addEventListener('click', () => {
				const index = button.getAttribute('data-button');

				if (index) {
					const option = this.options[parseInt(index)];
					option.handler();
				}
			});

			button.addEventListener('mouseenter', () => button.focus());

			button.addEventListener('focus', () => {
				this.prevFocus = button;
				this.descriptionElementText.innerText =
					button.dataset.description || '';
			});
		});

		setTimeout(() => {
			getElement('button[data-button]:not([disabled])', this.element)?.focus();
		}, 10);
	}

	createElement() {
		this.element = document.createElement('div');
		this.element.classList.add('keyboard-menu');

		// Description Box
		this.descriptionElement = document.createElement('div');
		this.descriptionElement.classList.add('description');
		this.descriptionElement.innerHTML = `<p>I will provide information</p>`;
		this.descriptionElementText = getElement('p', this.descriptionElement);
	}

	end() {
		this.element.remove();
		this.descriptionElement.remove();

		this.up?.unbind();
		this.down?.unbind();
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.descriptionElement);
		container.appendChild(this.element);

		// Keyboard Navigation
		this.up = new KeyPressListener('ArrowUp', () => {
			const current = Number(this.prevFocus?.getAttribute('data-button'));
			const buttonArr = getElements<HTMLButtonElement>('button', this.element);
			const prevButton = buttonArr.reverse().find(button => {
				if (!button.dataset.button) return;

				const buttonNumber = Number(button.dataset.button);

				return buttonNumber < current && !button.disabled;
			});

			prevButton?.focus();
		});

		this.down = new KeyPressListener('ArrowDown', () => {
			const current = Number(this.prevFocus?.getAttribute('data-button'));
			const buttonArr = getElements<HTMLButtonElement>('button', this.element);
			const nextButton = buttonArr.find(button => {
				if (!button.dataset.button) return;

				const buttonNumber = Number(button.dataset.button);

				return buttonNumber > current && !button.disabled;
			});

			nextButton?.focus();
		});
	}
}

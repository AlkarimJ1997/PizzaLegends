import { KeyPressListener } from './KeyPressListener';

type MessageConfig = {
	text: string;
	onComplete: () => void;
};

export class Message {
	text: string;
	onComplete: () => void;
	element: HTMLDivElement | null;
	actionListener?: KeyPressListener;

	constructor({ text, onComplete }: MessageConfig) {
		this.text = text;
		this.onComplete = onComplete;
		this.element = null;
	}

	createElement() {
		// Create the element
		this.element = document.createElement('div');
		this.element.classList.add('message');

		// Set the content
		this.element.innerHTML = `
            <p class='message__text'>${this.text}</p>
            <div class='message__corner'>
                <svg
                    viewBox='0 0 65 62'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path d='M35 3.5L65 6.5V62L0 0L35 3.5Z' fill='hsl(0 0% 97%)' />
                </svg>
            </div>
        `;

		// Close message on click
		this.element.addEventListener('click', () => {
			this.done();
		});

		// Enter key closes message
		this.actionListener = new KeyPressListener('Enter', () => {
			this.actionListener?.unbind();
			this.done();
		});
	}

	done() {
		this.element?.remove();
		this.onComplete();
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);
	}
}

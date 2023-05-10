import { KeyPressListener } from './KeyPressListener';
import { RevealingText } from './RevealingText';
import { getElement } from '../utils/utils';
import { Text } from '../models/types';
import '../styles/Message.css';

type MessageConfig = {
	textLines: Text[];
	onComplete: () => void;
};

export class Message {
	textLines: Text[];
	onComplete: () => void;
	element: HTMLDivElement | null;
	actionListener?: KeyPressListener;
	revealingText?: RevealingText;

	constructor({ textLines, onComplete }: MessageConfig) {
		this.textLines = textLines;
		this.onComplete = onComplete;
		this.element = null;
	}

	createElement() {
		// Create the element
		this.element = document.createElement('div');
		this.element.classList.add('message');

		// Set the content
		this.element.innerHTML = `
            <p class='message__text'></p>
            <div class='message__corner'>
                <svg
                    viewBox='0 0 65 62'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path d='M35 3.5L65 6.5V62L0 0L35 3.5Z' fill='hsl(0 0% 97%)' />
                </svg>
            </div>
        `;

		// Add revealing text
		this.revealingText = new RevealingText({
			element: getElement<HTMLParagraphElement>('.message__text', this.element),
			textLines: this.textLines,
		});

		// Close message on click
		this.element.addEventListener('click', () => {
			this.done();
		});

		// Enter key closes message
		this.actionListener = new KeyPressListener('Enter', () => {
			this.done();
		});
	}

	done() {
		if (!this.revealingText?.isDone) {
			this.revealingText?.warpToDone();
			return;
		}

		this.element?.remove();
		this.actionListener?.unbind();
		this.onComplete();
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);

		this.revealingText?.init();
	}
}

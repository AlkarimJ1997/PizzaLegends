import { Text } from '../models/types';

type RevealingTextConfig = {
	element: HTMLParagraphElement;
	textLines: Text[];
};

type Characters = {
	span: HTMLSpanElement;
	isSpace: boolean;
	delayAfter: number;
	classes: string[];
};

export class RevealingText {
	element: HTMLParagraphElement;
	textLines: Text[];
	characters!: Characters[];
	timeout: number | null;
	isDone: boolean;

	constructor(config: RevealingTextConfig) {
		this.element = config.element;
		this.textLines = config.textLines;

		this.timeout = null;
		this.isDone = false;
	}

	revealOneCharacter() {
		const next = this.characters.splice(0, 1)[0];

		next.span.classList.add('revealed');
		next.classes.forEach(className => {
			next.span.classList.add(className);
		});

		const delay = next.isSpace ? 0 : next.delayAfter;

		if (this.characters.length > 0) {
			this.timeout = setTimeout(() => {
				this.revealOneCharacter();
			}, delay);
		} else {
			this.isDone = true;
		}
	}

	warpToDone() {
		if (this.timeout) clearTimeout(this.timeout);

		this.isDone = true;

		this.element.querySelectorAll('span').forEach(span => {
			span.classList.add('revealed');
		});

		this.characters.forEach(config => {
			config.classes.forEach(className => {
				config.span.classList.add(className);
			});
		});
	}

	init() {
		this.characters = [];

		// Add spaces between text lines
		this.textLines.forEach((line, index) => {
			if (index < this.textLines.length - 1) {
				line.string += ' ';
			}

			line.string.split('').forEach(character => {
				const span = document.createElement('span');

				span.textContent = character;

				this.element.appendChild(span);

				this.characters.push({
					span,
					isSpace: character === ' ' && !line.pause,
					delayAfter: line.speed,
					classes: line.classes || [],
				});
			});
		});

		// Wait for the slide in animation to finish
		this.element.parentElement?.addEventListener(
			'animationend',
			() => {
				this.revealOneCharacter();
			},
			{ once: true }
		);
	}
}

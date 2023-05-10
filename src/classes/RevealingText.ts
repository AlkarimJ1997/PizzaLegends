type RevealingTextConfig = {
	element: HTMLParagraphElement;
	text: string;
	speed?: number;
};

type Characters = {
	span: HTMLSpanElement;
	delayAfter: number;
};

export class RevealingText {
	element: HTMLParagraphElement;
	text: string;
	speed!: number;
	timeout: number | null;
	isDone: boolean;

	constructor(config: RevealingTextConfig) {
		this.element = config.element;
		this.text = config.text;
		this.speed = config.speed || 60;

		this.timeout = null;
		this.isDone = false;
	}

	revealOneCharacter(characters: Characters[]) {
		const next = characters.splice(0, 1)[0];

		next.span.classList.add('revealed');

		if (characters.length > 0) {
			this.timeout = setTimeout(() => {
				this.revealOneCharacter(characters);
			}, next.delayAfter);
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
	}

	init() {
		const characters: Characters[] = [];

		this.text.split('').forEach(character => {
			const span = document.createElement('span');

			span.textContent = character;

			this.element.appendChild(span);

			characters.push({
				span,
				delayAfter: character === ' ' ? 0 : this.speed,
			});
		});

		// Wait for the slide in animation to finish
		this.element.parentElement?.addEventListener('animationend', () => {
            this.revealOneCharacter(characters);
        }, { once: true })
	}
}

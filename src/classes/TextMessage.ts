type TextMessageConfig = {
	text: string;
	onComplete: () => void;
};

export class TextMessage {
	text: string;
	onComplete: () => void;
	element: HTMLDivElement | null;

	constructor({ text, onComplete }: TextMessageConfig) {
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
            <button class='message__btn'>Next</button>
            <svg
                class='message__corner'
                viewBox='0 0 65 62'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'>
                <path d='M35 3.5L65 6.5V62L0 0L35 3.5Z' fill='hsl(0 0% 97%)' />
            </svg>
        `;
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);
	}
}

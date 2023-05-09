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

		// InnerHTML
		this.element.innerHTML = `
            <p class='message__text'>${this.text}</p>
            <button class='message__btn'>Next</button>
        `;
	}

	init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);
	}
}

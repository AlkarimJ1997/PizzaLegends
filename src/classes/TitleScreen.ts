import { KeyboardMenu } from './KeyboardMenu';
import type { Progress } from './Progress';
import { getSrc } from '../utils/utils';
import '../styles/TitleScreen.css';

export class TitleScreen {
	progress: Progress;
	element!: HTMLDivElement;
	keyboardMenu: KeyboardMenu | null = null;

	constructor({ progress }: { progress: Progress }) {
		this.progress = progress;
	}

	getOptions(resolve: (saveFile?: SaveFile | null) => void) {
		const saveFile = this.progress.getSaveFile();

		return [
			{
				label: 'New Game',
				description: 'Start a new pizza adventure!',
				handler: () => {
					//
					this.close();
					resolve();
				},
			},
			saveFile && {
				label: 'Continue Game',
				description: 'Continue your pizza adventure!',
				handler: () => {
					this.close();
					resolve(saveFile);
				},
			},
		].filter(v => v) as Page[];
	}

	createElement() {
		this.element = document.createElement('div');
		this.element.classList.add('title-screen');

		const titleScreen = getSrc('../assets/images/logo.png');

		this.element.innerHTML = `
            <img class='title-screen__logo' src='${titleScreen}' alt='Pizza Legends ' />
        `;
	}

	close() {
		this.keyboardMenu?.end();
		this.element.remove();
	}

	async init(container: HTMLDivElement) {
		return new Promise(resolve => {
			this.createElement();
			container.appendChild(this.element);

			this.keyboardMenu = new KeyboardMenu();
			this.keyboardMenu.init(this.element);
			this.keyboardMenu.setOptions(this.getOptions(resolve));
		});
	}
}

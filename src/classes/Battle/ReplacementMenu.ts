import { KeyboardMenu } from '../KeyboardMenu';

type ReplacementMenuConfig = {
	replacements: Combatant[];
	onComplete: (replacement: Combatant) => void;
};

export class ReplacementMenu {
	replacements: Combatant[];
	onComplete: (replacement: Combatant) => void;

	keyboardMenu: KeyboardMenu | null = null;

	constructor({ replacements, onComplete }: ReplacementMenuConfig) {
		this.replacements = replacements;
		this.onComplete = onComplete;
	}

	decide() {
		this.menuSubmit(this.replacements[0]);
	}

	menuSubmit(replacement: Combatant) {
		this.keyboardMenu?.end();
		this.onComplete(replacement);
	}

	showMenu(container: HTMLDivElement) {
		this.keyboardMenu = new KeyboardMenu();
		this.keyboardMenu.init(container);
		this.keyboardMenu.setOptions(
			this.replacements.map(r => {
				return {
					label: r.name,
					description: r.description,
					handler: () => {
						this.menuSubmit(r);
					},
				};
			})
		);
	}

	init(container: HTMLDivElement) {
        if (this.replacements[0].isPlayerControlled) {
            this.showMenu(container);
            return;
        }

        this.decide();
	}
}

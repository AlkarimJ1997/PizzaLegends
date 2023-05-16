import { GameObject } from './GameObject';
import { Sprite } from './Sprite';
import { SPEEDS } from '../data/enums';

export class PizzaStone extends GameObject {
	sprite: Sprite;
	storyFlag: string;
	pizzas: string[];

	constructor(config: PizzaStoneConfig) {
		super(config);

		this.sprite = new Sprite({
			gameObject: this,
			src: '../assets/images/characters/pizza-stone.png',
			animations: {
				'used-down': [[0, 0]],
				'unused-down': [[1, 0]],
			},
			currentAnimation: 'used-down',
		});

		this.storyFlag = config.storyFlag || '';
		this.pizzas = config.pizzas || Object.keys(window.Pizzas);
        console.log(this.pizzas);

		this.talking = [
			{
				required: [this.storyFlag],
				events: [
					{
						type: 'message',
						textLines: [
							{
								speed: SPEEDS.Normal,
								string: 'You have already used this.',
							},
						],
					},
				],
			},
			{
				events: [
					{
						type: 'message',
						textLines: [
							{
								speed: SPEEDS.Normal,
								string: 'Approaching the legendary pizza stone...',
							},
						],
					},
					{ type: 'craftingMenu', pizzas: this.pizzas },
					{ type: 'addStoryFlag', flag: this.storyFlag },
				],
			},
		];
	}

	update() {
		if (window.playerState.storyFlags[this.storyFlag]) {
			this.sprite.currentAnimation = 'used-down';
			return;
		}

		this.sprite.currentAnimation = 'unused-down';
	}
}

<style>
    summary {
        user-select: none;
    }
</style>

# Pizza Legends

This repository contains the code for a 2D RPG game called Pizza Legends. It was made following this [tutorial](https://www.youtube.com/watch?v=fyi4vfbKEeo) by Drew Conley.

While the tutorial was created in Vanilla JS, I decided to use TypeScript instead for an extra challenge.

## How to run

1. Clone the repository

```bash
git clone https://github.com/AlkarimJ1997/Pizza-Legends.git
```

2. Install dependencies

```bash
npm install
```

3. Run the project

```bash
npm run dev
```

## Development Process

### Day 1

- [x] [Set up the project](#set-up-the-project)
- [x] [Create the map](#create-the-map)
- [x] [Pixelate the map](#pixelate-the-map)
- [x] [Create the player](#create-the-player)
- [x] [Create a shadow](#create-a-shadow)
- [x] [Draw the shadow below the player](#draw-the-shadow-below-the-player)

<details>
    <summary>Set up the project</summary>

    I used [Vite](https://vitejs.dev/) to set up the project. It's a build tool that allows you to use modern JavaScript features without having to worry about compatibility issues. It also has a built-in development server that allows you to hot reload your code.

    From there, we removed any boilerplate code and started the server using `npm run dev`.
</details>

#### Set up the project

I used [Vite](https://vitejs.dev/) to set up the project. It's a build tool that allows you to use modern JavaScript features without having to worry about compatibility issues. It also has a built-in development server that allows you to hot reload your code.

From there, we removed any boilerplate code and started the server using `npm run dev`.

#### Create the map

To create the map, and other visual elements, we used a `canvas` element.

```tsx
<div className='game'>
	<canvas className='game__canvas' width={352} height={198}></canvas>
</div>
```

Notice the 16:9 aspect ratio. We also utilized CSS to center the canvas, stop overflow, and specify its dimensions.

```css
body {
	display: grid;
	place-content: center;
	min-height: 100vh;
	overflow: hidden;
}

.game {
	position: relative;
	width: 352px;
	height: 198px;
	outline: 1px solid hsl(0 0% 100%);
}
```

From there, we utilized an Overworld class to draw the map on the canvas. The overworld class takes in a config object that is an HTML element that contains the canvas.

```ts
class Overworld {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	constructor(public config: OverworldConfig) {
		this.element = this.config.element as HTMLElement;
		this.canvas = this.element.querySelector('.game__canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
	}
}
```

From there, we created an `init()` method that would draw the map on the canvas using a URL object and HTML image element.

```tsx
init() {
    const url: URL = new URL(
        '../assets/images/maps/DemoLower.png',
        import.meta.url
    );
    const image: HTMLImageElement = new Image();

    image.onload = () => {
        this.ctx.drawImage(image, 0, 0);
    };
    image.src = url.href;
}
```

Finally, in React, we created an instance of the Overworld class as state and called the `init()` method using `useEffect()`.

```tsx
const [overworld, setOverworld] = useState<Overworld>();
const containerRef = useRef<HTMLDivElement>(null);

useEffect(() => {
	if (!containerRef.current) return;

	setOverworld(new Overworld({ element: containerRef.current }));
}, [containerRef]);

useEffect(() => {
	if (!overworld) return;

	overworld.init();
}, [overworld]);
```

Notice the `useRef()` hook was used to follow best practices when working with the DOM in TypeScript React.

#### Pixelate the map

To pixelate the map, we scaled the canvas using `transform` and used the `image-rendering` CSS property.

```css
.game {
	transform: scale(3);
}

.game__canvas {
	image-rendering: pixelated;
}
```

#### Create the player

Initially, creating the player was much like creating the map. We used a URL object and HTML image element to draw the player on the canvas in the `init()` method.

```tsx
const x = 5;
const y = 6;

const urlHero: URL = new URL(
	'../assets/images/characters/people/hero.png',
	import.meta.url
);
const hero: HTMLImageElement = new Image();

hero.onload = () => {
	this.ctx.drawImage(hero, 0, 0, 32, 32, x * 16 - 8, y * 16 - 18, 32, 32);
};
hero.src = urlHero.href;
```

Notice the increased complexity in the `drawImage()` method. This is because we are using a sprite sheet to draw the player. The sprite sheet contains all the different animations for the player.

The arguments passed to the `drawImage()` method are as follows:

- `image`: The image element to draw
- `sx`: The left cut of the image (x-axis coordinate of top left corner)
- `sy`: The top cut of the image (y-axis coordinate of top left corner)
- `sWidth`: The width of the cut
- `sHeight`: The height of the cut
- `dx`: The left position to draw the image (on the canvas)
- `dy`: The top position to draw the image (on the canvas)
- `dWidth`: The width of the cut (for scaling)
- `dHeight`: The height of the cut (for scaling)

`32` was used as each sprite tile in the spritesheet is 32x32 pixels.
`dx` and `dy` wre multiplied by 16 because each tile on the canvas map is 16 pixels.
`dx` was nudged to the left by 8 pixels to horizontally center the player on the tile.
`dy` was nudged up by 18 pixels to vertically center the player on the tile.
`dWidth` and `dHeight` were set to 32 to keep the same scale as the tile.

#### Create a shadow and draw the shadow below the player

Drawing the shadow was essentially the same as drawing the player. It took a different image asset and was drawn in the identical position as the player.

However, **_the shadow was drawn before the player to ensure that the player would be drawn on top of the shadow_**.

```tsx
const urlShadow: URL = new URL(
	'../assets/images/characters/shadow.png',
	import.meta.url
);
const shadow: HTMLImageElement = new Image();

shadow.onload = () => {
	this.ctx.drawImage(shadow, 0, 0, 32, 32, x * 16 - 8, y * 16 - 18, 32, 32);
};
shadow.src = urlShadow.href;
```

### Day 2

- [x] [Create GameObject pattern](#create-gameobject-pattern)
- [x] [Refactor](#refactor)

#### Create GameObject pattern

For developing this game, we opted to use a GameObject pattern used often with Unity, Godot, etc. This pattern is used to create objects that can be drawn on the canvas. It also allows us to create objects that can be interacted with.

We first created a GameObject class that would be the base class for all other objects.

```tsx
type GameObjectConfig = {
	x?: number;
	y?: number;
	src?: string;
};

export class GameObject {
	x: number;
	y: number;
	sprite: Sprite;

	constructor(config: GameObjectConfig) {
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.sprite = new Sprite({
			gameObject: this,
			src: config.src || '../assets/images/characters/people/hero.png',
		});
	}
}
```

Notice how each GameObject has an `x` and `y` position for drawing, and an optional `src` for the image asset.

Each gameObject then creates a Sprite when it is instantiated.

```tsx
type AnimationType = {
	idleDown: number[][];
};

type SpriteConfig = {
	animations?: AnimationType;
	currentAnimation?: string;
	src: string;
	gameObject: GameObject;
};

export class Sprite {
	readonly SHADOW_SRC = '../assets/images/characters/shadow.png';
	readonly NUDGE_X = 8;
	readonly NUDGE_Y = 18;

	animations: AnimationType;
	currentAnimation: string;
	currentAnimationFrame: number;
	url: URL;
	image: HTMLImageElement;
	urlShadow: URL;
	shadow: HTMLImageElement;
	isLoaded = false;
	isShadowLoaded = false;
	useShadow = true;
	gameObject: GameObject;

	constructor(config: SpriteConfig) {
		// Sprite Image
		this.url = new URL(config.src, import.meta.url);
		this.image = new Image();
		this.image.src = this.url.href;

		this.image.onload = () => {
			this.isLoaded = true;
		};

		// Shadow
		this.urlShadow = new URL(this.SHADOW_SRC, import.meta.url);
		this.useShadow = true; // config.useShadow || false;
		this.shadow = new Image();

		if (this.useShadow) this.shadow.src = this.urlShadow.href;

		this.shadow.onload = () => {
			this.isShadowLoaded = true;
		};

		// Animation and initial state
		this.animations = config.animations || {
			idleDown: [[0, 0]],
		};
		this.currentAnimation = config.currentAnimation || 'idleDown';
		this.currentAnimationFrame = 0;

		// Game Object reference
		this.gameObject = config.gameObject;
	}

	draw(ctx: CanvasRenderingContext2D) {
		const x = this.gameObject.x * 16 - this.NUDGE_X;
		const y = this.gameObject.y * 16 - this.NUDGE_Y;

		this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);
		this.isLoaded && ctx.drawImage(this.image, 0, 0, 32, 32, x, y, 32, 32);
	}
}
```

Notice the intricacies of the Sprite class as it is responsible for drawing the sprite and shadow on the canvas, as well as handling animations (to be implemented).

#### Refactor

Now that we have created the `GameObject` and `Sprite` classes, we can refactor the `Overworld` class to use these classes.

```tsx
type OverworldConfig = {
	element: HTMLElement;
};

export class Overworld {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;

	constructor(public config: OverworldConfig) {
		this.element = this.config.element as HTMLElement;
		this.canvas = this.element.querySelector('.game__canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
	}

	init() {
		console.log('Hello from the Overworld!', this);

		const url: URL = new URL('../assets/images/maps/DemoLower.png', import.meta.url);
		const image: HTMLImageElement = new Image();

		image.onload = () => {
			this.ctx.drawImage(image, 0, 0);
		};
		image.src = url.href;

		// Place some game objects!
		const hero = new GameObject({
			x: 5,
			y: 6,
		});

		const npc1 = new GameObject({
			x: 7,
			y: 9,
			src: '../assets/images/characters/people/npc1.png',
		});

		setTimeout(() => {
			hero.sprite.draw(this.ctx);
			npc1.sprite.draw(this.ctx);
		}, 200);
	}
}
```

Notice the reduced code in the `init()` method. Now, we only have to create GameObjects and call the `draw()` method on their sprites. We also temporarily utilize `setTimeout()` to ensure that the images are loaded before drawing them (won't be needed once we have a game loop)

### Day 3

- [x] [Create Image Utility](#create-image-utility)
- [x] [Create Overworld Maps](#create-overworld-maps)
- [x] [Define Map Configs](#define-map-configs)
- [x] [Create Game Loop](#create-game-loop)

#### Create Image Utility

As we have seen, creating an Image in TypeScript React is a bit tedious. We need a URL object, an image object, and an onload handler.

For reusability, we can create a utility function that will handle this for us.

```tsx
export const createImage = (src: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const url = new URL(src, import.meta.url);
		const image = new Image();

		image.src = url.href;
		image.onload = () => resolve(image);
		image.onerror = reject;
	});
};
```

Notice that it returns a Promise, so we can chain it with `.then()` to retrieve the loaded image.

#### Create Overworld Maps

Now, we created an `OverworldMap` class that will be responsible for drawing the map on the canvas. This class will also be responsible for drawing the GameObjects on the map.

By abstracting this to its own class, we can create highly configurable maps that can be changed on the fly.

```tsx
type GameObjects = {
	[key: string]: GameObject;
};

type OverworldMapConfig = {
	lowerSrc: string;
	upperSrc: string;
	gameObjects: GameObjects;
};

export class OverworldMap {
	gameObjects: GameObjects;
	lowerImage: HTMLImageElement = new Image();
	upperImage: HTMLImageElement = new Image();

	constructor(config: OverworldMapConfig) {
		this.gameObjects = config.gameObjects;

		createImage(config.lowerSrc).then(image => {
			this.lowerImage.src = image.src;
		});

		createImage(config.upperSrc).then(image => {
			this.upperImage.src = image.src;
		});
	}

	drawLowerImage(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.lowerImage, 0, 0);
	}

	drawUpperImage(ctx: CanvasRenderingContext2D) {
		ctx.drawImage(this.upperImage, 0, 0);
	}
}
```

Notice that we have a `lowerImage` and `upperImage` that will be drawn on the canvas, both of which are created using our new utility function.

The `lowerImage` will be the base map, and the `upperImage` will be stuff that's layered over, i.e. trees, rooftops, etc.

We create separate methods to draw each image so that we can draw game objects in between.

#### Define Map Configs

Now that we have an `OverworldMap` class, we can create a map config that will be used to hold the information for each map.

We are going to attach this to the `window` object so that we can access it from anywhere.

```tsx
declare global {
	interface Window {
		OverworldMaps: {
			[key: string]: OverworldMapConfig;
		};
	}
}
```

Now, we can define our map configs.

```tsx
window.OverworldMaps = {
	DemoRoom: {
		lowerSrc: '../assets/images/maps/DemoLower.png',
		upperSrc: '../assets/images/maps/DemoUpper.png',
		gameObjects: {
			hero: new GameObject({
				x: 5,
				y: 6,
			}),
			npc1: new GameObject({
				x: 7,
				y: 9,
				src: '../assets/images/characters/people/npc1.png',
			}),
		},
	},
	Kitchen: {
		lowerSrc: '../assets/images/maps/KitchenLower.png',
		upperSrc: '../assets/images/maps/KitchenUpper.png',
		gameObjects: {
			hero: new GameObject({
				x: 3,
				y: 5,
			}),
			npcA: new GameObject({
				x: 9,
				y: 6,
				src: '../assets/images/characters/people/npc2.png',
			}),
			npcB: new GameObject({
				x: 10,
				y: 8,
				src: '../assets/images/characters/people/npc3.png',
			}),
		},
	},
};
```

See how each map has a `lowerSrc`, `upperSrc`, and `gameObjects` property. This is what we will pass to the `OverworldMap` class, and call in our game loop.

#### Create Game Loop

Now, we can finally create our game loop that will run on every frame, `startGameLoop()`, in our `Overworld` class.

```tsx
export class Overworld {
	element: HTMLElement;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	map!: OverworldMap;

	constructor(public config: OverworldConfig) {
		this.element = this.config.element as HTMLElement;
		this.canvas = this.element.querySelector('.game__canvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
	}

	startGameLoop() {
		const step = () => {
			// Clear Canvas
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			// Draw Lower Image
			this.map.drawLowerImage(this.ctx);

			// Draw Game Objects
			Object.values(this.map.gameObjects).forEach(gameObject => {
				gameObject.sprite.draw(this.ctx);
			});

			// Draw Upper Image
			this.map.drawUpperImage(this.ctx);

			requestAnimationFrame(step);
		};

		requestAnimationFrame(step);
	}

	init() {
		this.map = new OverworldMap(window.OverworldMaps.Kitchen);
		this.startGameLoop();
	}
}
```

Notice that we create a loop function called `step()`, and call `requestAnimationFrame()` inside of it. This will call the `step()` function on every frame.

We then actually invoke `requestAnimationFrame()` with `step()` to start the loop in `startGameLoop()`.

Finally, we define our current map in `init()` and call `startGameLoop()`.

### Day 4

- [x] [Fix Jaggedy Movement](#fix-jaggedy-movement)
- [x] [Adding Sprite Updater](#adding-sprite-updater)
- [x] [Grid Based Movement](#grid-based-movement)
- [x] [Keyboard Events](#keyboard-events)
- [x] [Player Controlled Flag](#player-controlled-flag)

#### Fix Jaggedy Movement

Currently, our movement is jaggedy because we are not handling `x` and `y` coordinates that are not nice and round, i.e. showing characters in between cells.

To fix this, we will create another utility function called `withGrid()` that will take in an `x` or `y` coordinate, and return the coordinate that is on the grid.

```ts
export const withGrid = (n: number) => n * 16;
```

Now, we can use this function in our map config to set the `x` and `y` coordinates of our game objects.

```tsx
gameObjects: {
    hero: new GameObject({
        x: withGrid(3),
        y: withGrid(5),
    }),
    npcA: new GameObject({
        x: withGrid(9),
        y: withGrid(6),
        src: '../assets/images/characters/people/npc2.png',
    }),
    npcB: new GameObject({
        x: withGrid(10),
        y: withGrid(8),
        src: '../assets/images/characters/people/npc3.png',
    }),
},
```

Remembering to remove the multiplication of 16 from the `draw()` method in the `Sprite` class.

#### Adding Sprite Updater

As we have it right now, there is no `update()` method on the `Sprite` class.

This is a common method part of games to update the state of the sprite, i.e. direction, animation, movement, etc. So we need to add one.

First, each Game Object will update differently, so we need to create an abstract method on the `GameObject` class called `update()`. From there, we can configure each subclass that extends `GameObject` to update differently.

```tsx
export abstract class GameObject {
	x: number;
	y: number;
	direction: string;
	sprite: Sprite;

	constructor(config: GameObjectConfig) {
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.direction = config.direction || 'down';
		this.sprite = new Sprite({
			gameObject: this,
			src: config.src || '../assets/images/characters/people/hero.png',
		});
	}

	abstract update(state: State): void;
}
```

Notice that the class is now abstract, and we have an abstract method called `update()`. `state` will be used as needed to update the sprite.

Now, we can create a `Person` class that extends `GameObject` and implements the `update()` method.

#### Grid Based Movement

With our Person class, or movable sprites, we want to utilize grid based movement. This means that we will only move in increments of 16 pixels, or 1 cell. And every time an input is received, we will move in that direction, not accepting any other input until the movement is complete.

```tsx
type DirectionUpdate = {
	[key: string]: ['x' | 'y', 1 | -1];
};

type PersonConfig = {
	x?: number;
	y?: number;
	src?: string;
	direction?: 'up' | 'down' | 'left' | 'right';
};

type State = {
	arrow?: string;
};

export class Person extends GameObject {
	movingProgressRemaining: number;
	directionUpdate: DirectionUpdate;

	constructor(config: PersonConfig) {
		super(config);

		this.movingProgressRemaining = 0;
		this.isPlayerControlled = config.isPlayerControlled || false;
		this.directionUpdate = {
			up: ['y', -1],
			down: ['y', 1],
			left: ['x', -1],
			right: ['x', 1],
		};
	}

	updatePosition() {
		if (this.movingProgressRemaining > 0) {
			const [property, value] = this.directionUpdate[this.direction];

			this[property] += value;
			this.movingProgressRemaining -= 1;
		}
	}

	update(state: State) {
		this.updatePosition();
	}
}
```

Notice that we have a `movingProgressRemaining` property that will be used to determine how much longer the sprite needs to move (16 pixels). We also have a `directionUpdate` object that will be used to determine how to update the `x` and `y` coordinates of the sprite based on the direction.

If the `movingProgressRemaining` is greater than 0, we will update the `x` or `y` coordinate based on the `directionUpdate` object, and decrement the `movingProgressRemaining` by 1.

But now, to actually move the sprite, we need to create an event listener for the arrow keys. We will do so with another class.

#### Keyboard Events

To implement keyboard events to move the player, we will create a class called `DirectionInput` and add event listeners to the `window` object.

```tsx
type Keymap = {
	ArrowUp: 'up';
	ArrowDown: 'down';
	ArrowLeft: 'left';
	ArrowRight: 'right';
	KeyW: 'up';
	KeyS: 'down';
	KeyA: 'left';
	KeyD: 'right';
};

export class DirectionInput {
	heldDirections: string[];
	map: Keymap;

	constructor() {
		this.heldDirections = [];
		this.map = {
			ArrowUp: 'up',
			KeyW: 'up',
			ArrowDown: 'down',
			KeyS: 'down',
			ArrowLeft: 'left',
			KeyA: 'left',
			ArrowRight: 'right',
			KeyD: 'right',
		};
	}

	get direction() {
		return this.heldDirections[0];
	}

	init() {
		document.addEventListener('keydown', (e: KeyboardEvent) => {
			const dir = this.map[e.code as keyof Keymap];

			if (dir && this.heldDirections.indexOf(dir) === -1) {
				this.heldDirections.unshift(dir);
			}
		});

		document.addEventListener('keyup', (e: KeyboardEvent) => {
			const dir = this.map[e.code as keyof Keymap];
			const index = this.heldDirections.indexOf(dir);

			if (index > -1) {
				this.heldDirections.splice(index, 1);
			}
		});
	}
}
```

Notice the logic here. We utilize an array to keep track of the directions that are being held down. When a key is pressed, we add the direction to the beginning of the array. When a key is released, we remove the direction from the array.

By doing this, if a user presses the left arrow, then while still holding the left arrow, presses the up arrow, the sprite will move up, not left. And if the user releases the up arrow, the sprite will continue to move left.

This is for better user experience, and is a common pattern in games.

We also create a getter for `direction` that will return the first direction in the array, i.e. the direction that is currently being held down.

Finally, we need to call this `init()` method when our game starts in the `Overworld` class.

```tsx
init() {
    this.map = new OverworldMap(window.OverworldMaps.DemoRoom);

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();
}
```

Now, when we draw the game objects in the game loop, we can update the state of the game objects based on the direction input.

```tsx
Object.values(this.map.gameObjects).forEach(gameObject => {
	gameObject.update({
		arrow: this.directionInput.direction,
	});
	gameObject.sprite.draw(this.ctx);
});
```

Finally, we have to utilize this direction in the `Person` class.

```tsx
updatePosition() {
    if (this.movingProgressRemaining > 0) {
        const [property, value] = this.directionUpdate[this.direction];

        this[property] += value;
        this.movingProgressRemaining -= 1;
    }
}

update(state: State) {
    this.updatePosition();

    if (this.movingProgressRemaining === 0 && state.arrow) {
        this.direction = state.arrow;
        this.movingProgressRemaining = 16;
    }
}
```

Now, when the `update()` method is called, we check if the `movingProgressRemaining` is 0, and if `state.arrow` exists (i.e. a direction is being held down).

If so, we set the `direction` and set the `movingProgressRemaining` to 16 (since each tile is 16 pixels). Notice that thanks to our if statement, a player will only be able to move if it's not already moving, and will move by a full tile each time, i.e. grid-based movement.

#### Player Controlled Flag

Now, the final issue with the code is that each `Person` is moving when the arrow keys are pressed, even NPCs. We want only the player to be able to move.

To do this, let's pass in a boolean flag to the hero when we create it. Also, remember to change all GameObject instances to Person instances in the `OverworldMap` class.

```tsx
gameObjects: {
    hero: new Person({
        isPlayerControlled: true,
        x: withGrid(5),
        y: withGrid(6),
    }),
    npcA: new Person({
        x: withGrid(7),
        y: withGrid(9),
        src: '../assets/images/characters/people/npc1.png',
    }),
}
```

Now, we can say that, by default, a `Person` is not player controlled.

```tsx
this.isPlayerControlled = config.isPlayerControlled || false;
```

And finally, we can check this flag in the `update()` method.

```tsx
update(state: State) {
    this.updatePosition();

    if (!this.isPlayerControlled) return;

    if (this.movingProgressRemaining === 0 && state.arrow) {
        this.direction = state.arrow;
        this.movingProgressRemaining = 16;
    }
}
```

So now, if the `Person` is not player controlled, we simply won't run any movement code. This is also awesome for future ideas. We could easily change this flag to false and give it to another NPC if we wanted that NPC to be player controlled in a cutscene or game event.

### Day 5

- [x] [Character Animations](#character-animations)

#### Character Animations

Today, we added idle and walking character animations to the game.

We start by updating the `animations` object in the `Sprite` class.

```tsx
this.animations = config.animations || {
	'idle-up': [[0, 2]],
	'idle-down': [[0, 0]],
	'idle-left': [[0, 3]],
	'idle-right': [[0, 1]],
	'walk-up': [
		[1, 2],
		[0, 2],
		[3, 2],
		[0, 2],
	],
	'walk-down': [
		[1, 0],
		[0, 0],
		[3, 0],
		[0, 0],
	],
	'walk-left': [
		[1, 3],
		[0, 3],
		[3, 3],
		[0, 3],
	],
	'walk-right': [
		[1, 1],
		[0, 1],
		[3, 1],
		[0, 1],
	],
};
```

Each subarray corresponds to a frame of the animation from the spritesheet. The first number is the row, and the second number is the column.

For example, `walk-up: [[1, 2], [0, 2], [3, 2], [0, 2]]` means the frames of the animation are the sprite frames at (1, 2), (0, 2), (3, 2), and (0, 2).

The rows and columns are zero-indexed, so the first row is 0, the second row is 1, etc.

From there, we create variables for the `animationFrameLimit` and `animationFrameProgress` in the `Sprite` class.

`animationFrameLimit` is the game loop frames per animation frame, so lower numbers mean faster animations.

`animationFrameProgress` is the progress of the current animation frame, so it defaults to the `animationFrameLimit` and goes to the next animation frame when it reaches 0.

```tsx
this.animationFrameLimit = config.animationFrameLimit || 8;
this.animationFrameProgress = this.animationFrameLimit;
```

From there, we can create a getter for the current animation frame.

```tsx
get frame() {
    return this.animations[this.currentAnimation][this.currentAnimationFrame];
}
```

Now we update the `draw()` method to draw the current animation frame.

```tsx
draw(ctx: CanvasRenderingContext2D) {
    const x = this.gameObject.x - this.NUDGE_X;
    const y = this.gameObject.y - this.NUDGE_Y;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    // Animation
    const [frameX, frameY] = this.frame;

    this.isLoaded &&
        ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);

    this.updateAnimationProgress();
}
```

Notice that we multiply `frameX` and `frameY` by 32 because each sprite frame in the spritesheet is 32x32 pixels.

We also call `this.updateAnimationProgress()` at the end of the `draw()` method to update the progress of the animation frame.

```tsx
updateAnimationProgress() {
    if (this.animationFrameProgress > 0) {
        this.animationFrameProgress--;
        return;
    }

    this.animationFrameProgress = this.animationFrameLimit;
    this.currentAnimationFrame++;

    if (!this.frame) this.currentAnimationFrame = 0;
}
```

If there is still progress, we simply downtick the progress (since the method is called every frame).

If the progress gets to 0, we reset the progress to the `animationFrameLimit` and go to the next animation frame.

And, if the animation frame is undefined, it means we've reached the end of the animation, so we reset the animation frame to 0.

Now that our animation is settable based on the `currentAnimation` property, we can create a function that sets the animation based on the direction the `Person` is facing.

```tsx
setAnimation(key: string) {
    if (this.currentAnimation === key) return;

    this.currentAnimation = key;
    this.currentAnimationFrame = 0;
    this.animationFrameProgress = this.animationFrameLimit;
}
```

Notice that if the passed in `key`, which is the animation name (`idle-up`, `walk-down`, etc.), is the same as the currently playing animation, we don't do anything so that the animation doesn't reset.

Otherwise, we set the new animation, reset the animation frame, and reset the animation frame progress.

Finally, we need to create an `updateSprite()` method that is called in the `update()` method of the `Person` class.

It will be passed the same `state` that the `update()` receives as it holds the arrow key information.

```tsx
updateSprite(state: State) {
    if (
        this.isPlayerControlled &&
        this.movingProgressRemaining === 0 &&
        !state.arrow
    ) {
        this.sprite.setAnimation(`idle-${this.direction}`);
        return;
    }

    if (this.movingProgressRemaining > 0) {
        this.sprite.setAnimation(`walk-${this.direction}`);
    }
}
```

As long as the player is user controlled, not currently moving, and there is no arrow key pressed, we know the player is idle.

If there is any moving progress, we know the player is walking.

We then call this function in the `update()` method of the `Person` class.

```tsx
update(state: State) {
    // update logic...

    this.updateSprite(state);
}
```

One thing to keep in mind is that `animationFrameLimit` can be adjusted if we want a quicker or slower animation, to imitate a character in a hurry or a character that is tired.

### Day 6

- [x] [Creating a Camera](#creating-a-camera)

#### Creating a Camera

Today, we created a camera that follows the player around the map, a typical element of most RPGs.

We start by defining who the camera person is going to be, and passing a reference to it to every `draw()` method in the game loop.

```tsx
startGameLoop() {
    const step = () => {
        // Clear Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Camera person
        const cameraPerson = this.map.gameObjects.hero;

        // Draw Lower Image
        this.map.drawLowerImage(this.ctx, cameraPerson);

        // Draw Game Objects
        Object.values(this.map.gameObjects).forEach(gameObject => {
            gameObject.update({
                arrow: this.directionInput.direction,
            });

            gameObject.sprite.draw(this.ctx, cameraPerson);
        });

        // Draw Upper Image
        this.map.drawUpperImage(this.ctx, cameraPerson);

        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}
```

From there, we can modify the `draw()` method of the `Sprite` class to take in a `cameraPerson` parameter.

```tsx
draw(ctx: CanvasRenderingContext2D, cameraPerson: GameObject) {
    const x = this.gameObject.x - this.NUDGE_X + withGrid(10.5) - cameraPerson.x;
    const y = this.gameObject.y - this.NUDGE_Y + withGrid(6) - cameraPerson.y;

    this.isShadowLoaded && ctx.drawImage(this.shadow, x, y);

    // Animation
    const [frameX, frameY] = this.frame;

    this.isLoaded &&
        ctx.drawImage(this.image, frameX * 32, frameY * 32, 32, 32, x, y, 32, 32);

    this.updateAnimationProgress();
}
```

What's important to grasp here are the magic numbers `10.5` and `6`.

In this game, the width of the `canvas` or game viewport is 22 units wide, each unit being a 16 pixel square (352 / 16 = 22)

The hero or camera person being centered takes up 1 unit, leaving `10.5` units on either side, the offset we want to apply to the `x` coordinate of every game object.

Similarly, the height of the `canvas` is 12 units tall, leaving `6` units on either vertical side of the camera person (192 / 16 = 12).

If you are using different image assets, you can adjust these numbers to fit your game.

We do the same logic in drawing the map in `OverworldMap`

```tsx
drawLowerImage(ctx: CanvasRenderingContext2D, cameraPerson: GameObject) {
    ctx.drawImage(
        this.lowerImage,
        withGrid(10.5) - cameraPerson.x,
        withGrid(6) - cameraPerson.y
    );
}

drawUpperImage(ctx: CanvasRenderingContext2D, cameraPerson: GameObject) {
    ctx.drawImage(
        this.upperImage,
        withGrid(10.5) - cameraPerson.x,
        withGrid(6) - cameraPerson.y
    );
}
```

There's one more thing to be mindful of in the game loop. We currently update gameObjects and draw them in the same loop. This poses an issue with drawing consistency.

To fix this, we need dedicated loops for updating and drawing.

```tsx
startGameLoop() {
    const step = () => {
        // Clear Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Camera person
        const cameraPerson = this.map.gameObjects.hero;

        // Update Game Objects
        Object.values(this.map.gameObjects).forEach(gameObject => {
            gameObject.update({
                arrow: this.directionInput.direction,
            });
        });

        // Draw Lower Image
        this.map.drawLowerImage(this.ctx, cameraPerson);

        // Draw Game Objects
        Object.values(this.map.gameObjects).forEach(gameObject => {
            gameObject.sprite.draw(this.ctx, cameraPerson);
        });

        // Draw Upper Image
        this.map.drawUpperImage(this.ctx, cameraPerson);

        requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
}
```

**_One last thing to remember is that the cameraPerson can easily be changed to another game object, such as an NPC to create a cutscene, or an inanimate object to create a cinematic effect._**

### Day 7

- [x] [Creating a Collision System](#creating-a-collision-system)
- [x] [NPC Puppeting and Refactoring](#npc-puppeting-and-refactoring)
- [x] [Mounting Game Objects and Moving Walls](#mounting-game-objects-and-moving-walls)

#### Creating a Collision System

Today, we created a collision system that prevents the player from walking through walls.

We start by creating a `walls` object in the `OverworldMap` class.

Notice that we don't use an array for optimization purposes.

```tsx
constructor(config: OverworldMapConfig) {
    this.gameObjects = config.gameObjects;
    this.walls = config.walls || {};
    // ... rest of code
}
```

Then we are going to create a utility function that, given an `x` and `y` coordinate, returns a comma separated string of the `x` and `y` coordinates as grid coordinates.

```tsx
export const asGridCoord = (x: number, y: number) => `${x * 16},${y * 16}`;
```

Now, we add walls to each map in the configuration.

```tsx
window.OverworldMaps = {
	DemoRoom: {
		lowerSrc: '../assets/images/maps/DemoLower.png',
		upperSrc: '../assets/images/maps/DemoUpper.png',
		gameObjects: {
			hero: new Person({
				isPlayerControlled: true,
				x: withGrid(5),
				y: withGrid(6),
			}),
			npcA: new Person({
				x: withGrid(7),
				y: withGrid(9),
				src: '../assets/images/characters/people/npc1.png',
			}),
		},
		walls: {
			[asGridCoord(7, 6)]: true,
			[asGridCoord(8, 6)]: true,
			[asGridCoord(7, 7)]: true,
			[asGridCoord(8, 7)]: true,
		},
	},
};
```

Now, we need to determine if the next position of the player is a wall or not, which we can do with another utility function.

```tsx
export const nextPosition = (initialX: number, initialY: number, dir: string) => {
	const size = 16;

	switch (dir) {
		case 'left':
			return { x: initialX - size, y: initialY };
		case 'right':
			return { x: initialX + size, y: initialY };
		case 'up':
			return { x: initialX, y: initialY - size };
		case 'down':
			return { x: initialX, y: initialY + size };
		default:
			return { x: initialX, y: initialY };
	}
};
```

Now, we check if the next position is a wall or not in `OverworldMap`.

```tsx
isSpaceTaken(currentX: number, currentY: number, direction: string) {
    const { x, y } = nextPosition(currentX, currentY, direction);

    return this.walls[`${x},${y}`] || false;
}
```

We now pass our map instance to the `update()` method in the game loop so we can call this method before moving the player or NPC.

```tsx
// Update Game Objects
Object.values(this.map.gameObjects).forEach(gameObject => {
	gameObject.update({
		arrow: this.directionInput.direction,
		map: this.map,
	});
});
```

#### NPC Puppeting and Refactoring

Before we use our collision system, there's something we need to consider.

With our current system for moving the `Person` game object, we are only able to move the player based on a keyboard event. This isn't sustainable for NPCs or other game objects that we want to move.

To fix this, we will implement NPC puppeting, a system that takes a behavior object that tells the game object how to behave (i.e. move, speak, etc.)

```tsx
export class Person extends GameObject {
	// ... member variables

	constructor(config: PersonConfig) {
		// ... constructor stuff
	}

	updatePosition() {
		const [property, value] = this.directionUpdate[this.direction];

		this[property] += value;
		this.movingProgressRemaining -= 1;
	}

	updateSprite() {
		if (this.movingProgressRemaining > 0) {
			this.sprite.setAnimation(`walk-${this.direction}`);
			return;
		}

		this.sprite.setAnimation(`idle-${this.direction}`);
	}

	startBehavior(state: State, behavior: Behavior) {
		this.direction = behavior.direction;

		if (behavior.type === 'walk') {
			// Don't walk if the space is taken (i.e. a wall or other NPC)
			if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
				return;
			}

			// Ready to walk!
			state.map.moveWall(this.x, this.y, this.direction);
			this.movingProgressRemaining = 16;
		}
	}

	update(state: State) {
		if (this.movingProgressRemaining > 0) {
			this.updatePosition();
			return;
		}
		// More cases for starting to walk will come here
		// ...

		// Case: We're keyboard ready (player is able to walk - no cutscene going on, etc.) and have an arrow pressed down
		if (this.isPlayerControlled && state.arrow) {
			this.startBehavior(state, {
				type: 'walk',
				direction: state.arrow,
			});
		}

		this.updateSprite();
	}
}
```

Notice the drastic changes to the `Person` class. In `update()`, if the player is currently moving, we update the position and nothing else.

If not, and the player is keyboard ready (meaning the player is allowed to give input to move), we start a walk behavior. We also update the sprite.

Due to our refactoring of if checks, we can also simplify the `updateSprite()` method and we add a `startBehavior()` method that takes a `Behavior` object and starts the behavior.

But notice how we first check if the space is taken before starting to walk. If the space is taken, we don't allow the walk to happen.

Finally, take note of the following line:

```tsx
state.map.moveWall(this.x, this.y, this.direction);
```

It will be touched on in the next section.

#### Mounting Game Objects and Moving Walls

Now that we have a system for moving, depending on if the next space is a `wall` or not, we also need to implement walls for other NPCs and game objects.

If we don't do this, a player could walk through an NPC or vice versa.

We start by adding 3 CRUD-like methods to `OverworldMap`:

```tsx
addWall(x: number, y: number) {
    this.walls[`${x},${y}`] = true;
}

removeWall(x: number, y: number) {
    delete this.walls[`${x},${y}`];
}

moveWall(wasX: number, wasY: number, direction: string) {
    this.removeWall(wasX, wasY);

    const { x, y } = nextPosition(wasX, wasY, direction);

    this.addWall(x, y);
}
```

Very basic concepts here:

- `addWall()` will be called whenever a game object enters the scene, or is mounted.
- `removeWall()` will be called whenever a game object exits the scene.
- `moveWall()` will be called whenever a game object moves.

We now need to actually mount our game objects (i.e. add their walls to the map) so they can't be collided with.

In the `GameObject` constructor, we initialize a flag `isMounted` to `false`.

```tsx
this.isMounted = false;
```

We then create a `mount()` method that will be called when the game object is mounted.

```tsx
mount(map: OverworldMap) {
    this.isMounted = true;

    map.addWall(this.x, this.y);
}
```

Now, we create a method in `OverworldMap` that mounts all game objects that are to be in the scene.

Here, we would also add optional additional logic to determine if the game object should be mounted or not.

For example, if a story flag has been set, and a key or other item has been picked up, we may not want to mount that game object, otherwise its invisible wall will still be in the scene.

```tsx
mountObjects() {
    Object.values(this.gameObjects).forEach(gameObject => {
        // TODO: determine if object should actually be mounted
        gameObject.mount(this);
    });
}
```

We then call this method when we initialize the map in the `init()` method of `Overworld`

```tsx
init() {
    this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
    this.map.mountObjects();
    // ... rest of init
}
```

Finally, we need to move the wall of the game object, or the player itself when they move. If we didn't do this, the player could not walk in the spot it was previously in, as the wall would still be there.

We do this in the `startBehavior()` method of the `Person` class in the line I mentioned earlier:

```tsx
startBehavior(state: State, behavior: Behavior) {
    this.direction = behavior.direction;

    if (behavior.type === 'walk') {
        // Don't walk if the space is taken (i.e. a wall or other NPC)
        if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
            return;
        }

        // Ready to walk!
        state.map.moveWall(this.x, this.y, this.direction);
        this.movingProgressRemaining = 16;
    }
}
```

### Day 8

- [x] [Behavior Loop System](#behavior-loop-system)
- [x] [Signal Pattern](#signal-pattern)
- [x] [Retry Behavior](#retry-behavior)
- [x] [Drawing Order](#drawing-order)
- [x] [Cutscene System](#cutscene-system)

#### Behavior Loop System

The most important part of the game is the behavior loop and cutscene system. These systems will allow idle NPCs to walk around, and allow for cutscenes to be played.

There's an important distinction to make here.

We have an internal person behavior loop system which is used for NPCs to walk around when nothing else is going on.

We also have a global cutscene system which is used for cutscenes, which tells the player or other NPCs to move a predetermined way or do something when the player steps on a certain spot or picks up an item, etc.

If you've played Pokemon, an example of the first system is spinner trainers, while your rival appearing to battle you is an example of the second system.

We'll start with the internal behavior loop system, but its code is very similar to the cutscene system.

To actually reference each game object in the scene, we need a `who` property to uniquely identify each game object.

Luckily, we can do this dynamically when the objects are mounted.

```tsx
mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {
        const gameObject = this.gameObjects[key];

        // TODO: determine if object should actually be mounted
        gameObject.id = key;
        gameObject.mount(this);
    });
}
```

Notice we iterate by the keys and use it as the `id` of the game object. Make sure to take in the `id` as a parameter in the constructor of `GameObject`.

Now, we can start giving `behaviorLoop` properties to our game objects.

```tsx
npcB: new Person({
    x: withGrid(3),
    y: withGrid(7),
    src: '../assets/images/characters/people/npc2.png',
    behaviorLoop: [
        { type: 'walk', direction: 'left' },
        { type: 'stand', direction: 'up', time: 800 },
        { type: 'walk', direction: 'up' },
        { type: 'walk', direction: 'right' },
        { type: 'walk', direction: 'down' },
    ],
}),
```

Currently, we only have `walk` or `stand` behaviors. We'll add more later. The `time` property is only for `stand` behaviors and is the amount of time in milliseconds to stand facing the given direction.

**_One thing that is imperative to understand with these behavior loops are they will repeat forever. So, when authoring them, you need to ensure the behavior loop ends in the same spot it starts._**

If you don't do this, the game object will walk off the map and disappear forever.

Now, we need to actually handle these events in the `GameObject` class.

We'll start with adding the class properties to the constructor.

```tsx
this.behaviorLoop = config.behaviorLoop || [];
this.behaviorLoopIndex = 0;
```

From here, we can kick off the event loop when the object is mounted, waiting a short delay before starting (to give priority to potential global cutscenes).

```tsx
mount(map: OverworldMap) {
    this.isMounted = true;

    map.addWall(this.x, this.y);

    // If we have a behavior loop, kick it off after a short delay
    setTimeout(() => {
        this.doBehaviorEvent(map);
    }, 10);
}
```

Now, we need to actually implement the `doBehaviorEvent()` method. It's purpose is to asynchronously wait for the current behavior to finish, then start the next one.

```tsx
async doBehaviorEvent(map: OverworldMap) {
    // If we're in a cutscene or there's no behavior loop, bail out
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0) return;

    const eventConfig = this.behaviorLoop[this.behaviorLoopIndex];
    eventConfig.who = this.id as string;

    const eventHandler = new OverworldEvent({ map, event: eventConfig });
    await eventHandler.init();

    // Set next event to fire
    this.behaviorLoopIndex += 1;

    // Loop back to the beginning if we've reached the end
    if (this.behaviorLoopIndex >= this.behaviorLoop.length) {
        this.behaviorLoopIndex = 0;
    }

    // Kick off the next behavior loop event
    this.doBehaviorEvent(map);
}
```

Notice that we are dynamically assigning the `who` property to the event config. This is so the event handler knows which game object to move and when that specific game object is done moving.

After the event finishes (is `await`ed), we increment to the next event in the loop, and if we've reached the end, we loop back to the beginning.

Finally, we kick off the next event.

Also, notice that at the very beginning, we check if a cutscene is playing or if we have no behavior loop tied to the game object. In either case, we want this method to do nothing.

Remember to add the `isCutscenePlaying` property to the `OverworldMap` class.

Now, for the OverworldEvent class, it's imperative that it knows when the event is finished. In other words, when the game object is done walking or standing. We need to implement this in the `Person` class.

To do this, we'll use a signal pattern using Custom Events.

#### Signal Pattern

The signal pattern is a way to communicate between two objects without having to pass a callback function as a parameter. It's like a click event on a button, but the browser listens for the events we create.

In our `updatePosition()` method, we can check if a `Person` is done moving, and if so, dispatch a `PersonWalkingComplete` event.

Dispatching custom events will be used in many places, so we'll create another utility function for it.

```tsx
export const emitEvent = (name: string, detail: Detail) => {
	const event = new CustomEvent(name, { detail });

	document.dispatchEvent(event);
};
```

Notice we have a `detail` object which has any information we may want to pass along with the event.

Now we can use this in our `updatePosition()` method to dispatch the event when the person is done moving.

```tsx
updatePosition() {
    const [property, value] = this.directionUpdate[this.direction];

    this[property] += value;
    this.movingProgressRemaining -= 1;

    if (this.movingProgressRemaining === 0) {
        // We're done moving, so let's throw a signal
        emitEvent('PersonWalkingComplete', { whoId: this.id as string });
    }
}
```

Notice that we named our custom event `PersonWalkingComplete` and passed along which game object is done walking, i.e. the `whoId`.

We can do the same thing for the `PersonStandingComplete` event.

```tsx
startBehavior(state: State, behavior: BehaviorLoopEvent) {
    this.direction = behavior.direction;

    if (behavior.type === 'walk') {
        // Don't walk if the space is taken (i.e. a wall or other NPC)
        if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
            return;
        }

        // Ready to walk!
        state.map.moveWall(this.x, this.y, this.direction);
        this.movingProgressRemaining = 16;
        this.updateSprite();
    }

    if (behavior.type === 'stand') {
        setTimeout(() => {
            emitEvent('PersonStandingComplete', { whoId: this.id as string });
        }, behavior.time);
    }
}
```

Here, we just use `setTimeout` to wait for the given amount of time before dispatching the event being complete, as that simulates the person standing still.

Notice that we also add a call to `updateSprite()` when the person is ready to walk. This is because we want to update the sprite to the walking sprite before the person (i.e. an NPC) starts walking.

Now, let's implement the `OverworldEvent` class.

```tsx
type OverworldEventConfig = {
	map: OverworldMap;
	event: BehaviorLoopEvent;
};

type OverworldEventMethod = (resolve: () => void) => void;

export class OverworldEvent {
	map: OverworldMap;
	event: BehaviorLoopEvent;

	constructor({ map, event }: OverworldEventConfig) {
		this.map = map;
		this.event = event;
	}

	stand(resolve: () => void) {
		const who = this.map.gameObjects[this.event.who as string] as Person;

		who.startBehavior(
			{ map: this.map },
			{
				type: 'stand',
				direction: this.event.direction,
				time: this.event.time,
			}
		);

		// Complete handler for the PersonStandingComplete event
		const completeHandler = (e: CustomEvent<Detail>) => {
			if (e.detail.whoId === this.event.who) {
				document.removeEventListener('PersonStandingComplete', completeHandler);
				resolve();
			}
		};

		// Listen for the PersonStandingComplete event
		document.addEventListener('PersonStandingComplete', completeHandler);
	}

	walk(resolve: () => void) {
		const who = this.map.gameObjects[this.event.who as string] as Person;

		who.startBehavior(
			{ map: this.map },
			{
				type: 'walk',
				direction: this.event.direction,
			}
		);

		// Complete handler for the PersonWalkingComplete event
		const completeHandler = (e: CustomEvent<Detail>) => {
			if (e.detail.whoId === this.event.who) {
				document.removeEventListener('PersonWalkingComplete', completeHandler);
				resolve();
			}
		};

		// Listen for the PersonWalkingComplete event
		document.addEventListener('PersonWalkingComplete', completeHandler);
	}

	init() {
		const eventHandlers: Record<string, OverworldEventMethod> = {
			stand: this.stand.bind(this),
			walk: this.walk.bind(this),
		};

		return new Promise<void>(resolve => {
			eventHandlers[this.event.type](resolve);
		});
	}
}
```

There's a lot going on here, so let's break it down.

Notice that we have a method named **_exactly_** the same as the event type. This is so we can dynamically call the correct method in the `init()` method.

In each of these methods, we get the `Person` object from the `OverworldMap` (that will be executing this event) and call the `startBehavior()` method with the correct parameters.

Then, we add an event listener for the event being complete. Notice that we have a `completeHandler` function that checks if the `whoId` matches the `who` property of the event config. This is necessary because we have multiple identical events for different NPCs, etc.

Finally, we call `resolve()` when the event is complete to let the `await` know that it can continue.

#### Retry Behavior

There is one more thing we need to handle. Currently, if we, as the player, walk in front of the NPC in the middle of its walk behavior, and then walk away, the NPC will stop altogether.

This is because the `Person` class doesn't know how to retry its behavior. We need to add this functionality.

But this is a simple boolean flag that we can pass to the `startBehavior()` method.

```tsx
walk(resolve: () => void) {
    const who = this.map.gameObjects[this.event.who as string] as Person;

    who.startBehavior(
        { map: this.map },
        {
            type: 'walk',
            direction: this.event.direction,
            retry: true,
        }
    );

    // ... rest of code
}
```

Remember we have to pass it explicitly here because we don't always want to retry the behavior, i.e. if the player is the one walking.

Now, in the `Person` class, we can check for this flag and retry the behavior if necessary.

```tsx
startBehavior(state: State, behavior: BehaviorLoopEvent) {
    this.direction = behavior.direction;

    if (behavior.type === 'walk') {
        // Don't walk if the space is taken (i.e. a wall or other NPC)
        if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
            behavior.retry &&
                setTimeout(() => {
                    this.startBehavior(state, behavior);
                }, 10);

            return;
        }
        // ... rest of code
}
```

We pass along the same `state` and `behavior` parameters, so it will always retry until it can walk.

#### Drawing Order

One small thing we need to fix is the drawing order of game objects in the scene. Currently, they are drawn in the order they are explicitly defined in the map config.

But, we want the game objects below to be drawn first, so that game objects with a smaller `y` value are drawn below game objects with a larger `y` value.

We can do this by sorting the game objects before drawing them in the game loop.

```tsx
Object.values(this.map.gameObjects)
	.sort((a, b) => a.y - b.y)
	.forEach(gameObject => {
		gameObject.sprite.draw(this.ctx, cameraPerson);
	});
```

Now, the game objects will be drawn in the correct order.

#### Cutscene System

The last thing we want to do is implement our global cutscene system, which is very similar to how we are already handling events.

Notice that if we set `isCutscenePlaying` to `true`, all the NPCs just stand there and don't perform their behaviors, which is what we want because they think a cutscene is playing.

But the player can still move, so we need to disable that.

```tsx
update(state: State) {
    // ... rest of code

    // Case: We're keyboard ready (player is able to walk - no cutscene going on, etc.) and have an arrow pressed down
    if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        this.startBehavior(state, {
            type: 'walk',
            direction: state.arrow,
        });
    }

    this.updateSprite();
}
```

Now, for checking if we're keyboard ready, we also ensure that no cutscene is playing.

From here, we can define a `startCutscene()` method on the `OverworldMap` class to handle global cutscene events.

```tsx
async startCutscene(events: BehaviorLoopEvent[]) {
    this.isCutscenePlaying = true;

    // Start a loop of async events, awaiting each one
    for (const event of events) {
        const eventHandler = new OverworldEvent({
            event,
            map: this,
        });

        await eventHandler.init();
    }

    this.isCutscenePlaying = false;
}
```

Notice the similarities to the `doBehaviorEvent()` method in the `GameObject` class. We loop through each event and await it, so that we can wait for the event to complete before moving on to the next one.

For now, we'll define a global cutscene array in the `init()` method of the `Overworld` class.

```tsx
init() {
    this.map = new OverworldMap(window.OverworldMaps.DemoRoom);
    this.map.mountObjects();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();

    this.map.startCutscene([
        { who: 'hero', type: 'walk', direction: 'down' },
        { who: 'hero', type: 'walk', direction: 'down' },
        { who: 'npcA', type: 'walk', direction: 'left' },
        { who: 'npcA', type: 'walk', direction: 'left' },
        { who: 'npcA', type: 'stand', direction: 'up', time: 800 },
    ]);
}
```

As you can see, we can define a cutscene with a series of events, and the `startCutscene()` method will handle the rest.

### Day 9

- [x] [Restarting Idle Behaviors](#restarting-idle-behaviors)
- [x] [Multiplying SetTimeouts](#multiplying-settimeouts)
- [x] [Message Event](#message-event)
- [x] [Talking to NPCs](#talking-to-npcs)
- [x] [Cutscene Spaces](#cutscene-spaces)
- [x] [ChangeMap Event](#changemap-event)

#### Restarting Idle Behaviors

We left off with a working cutscene system, but there is one more thing we need to fix.

After a global cutscene, we need to tell all the NPCs to restart their idle behaviors.

We can do this at the end of the `startCutscene()` method.

```tsx
async startCutscene(events: BehaviorLoopEvent[]) {
    // ... rest of code

    this.isCutscenePlaying = false;

    // Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(gameObject => {
        gameObject.doBehaviorEvent(this);
    });
}
```

#### Multiplying SetTimeouts

There is one more thing we need to fix. Currently, we are using `setTimeout()` to handle the `time` property of the `stand` event.

But with restarting idle behaviors, it's possible for multiple `setTimeout()` calls to be made, which will multiply on top of each other.

To fix this, we want game objects that are currently in a `stand` event not to be able to have another `stand` event called on them.

We can do this by adding a `isStanding` flag to the `GameObject` class, to be consumed by the `Person` class.

```tsx
protected abstract isStanding: boolean;
```

Notice that we make it `protected` and `abstract` so that we can define it in the `Person` class and use it. We can't define it in `Person` because we need to check the flag in the `GameObject`'s `doBehaviorEvent()` method.

Now, in the `startBehavior()` method of the `Person` class, we can set the flag to `true` if the behavior is a `stand` event, and set it back to `false` after it's done.

```tsx
startBehavior(state: State, behavior: BehaviorLoopEvent) {
    // ... rest of code

    if (behavior.type === 'stand') {
        this.isStanding = true;

        setTimeout(() => {
            emitEvent('PersonStandingComplete', { whoId: this.id as string });
            this.isStanding = false;
        }, behavior.time);
    }
}
```

Now, we just add this check to the `doBehaviorEvent()` method of the `GameObject` class.

```tsx
async doBehaviorEvent(map: OverworldMap) {
    // If we're in a cutscene or there's no behavior loop, bail out
    if (map.isCutscenePlaying || this.behaviorLoop.length === 0 || this.isStanding) {
        return;
    }

    // ... rest of code
}
```

#### Message Event

Now, it's time to add a `message` event to the `OverworldEvent` system, similar to `stand` and `walk`.

This event will allow NPCs and other game objects to display a message to the player.

We'll start by creating a `Message` class.

```tsx
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
```

Here, we dynamically create a message element and append it to the container.

Notice that we have an `onComplete` callback, which will be called when the message is closed.

And we can close the message by clicking on it.

We also have an optional `actionListener` property, which will be used to listen for a key press to close the message. More on that later.

Now we can add a `message()` method to the `OverworldEvent` class to handle the `message` event.

```tsx
message(resolve: () => void) {
    const messageInstance = new Message({
        text: this.event.text as string,
        onComplete: () => resolve(),
    });

    messageInstance.init(document.querySelector('.game') as HTMLDivElement);
}
```

This method will create a new `Message` instance with text from the event, and call the `init()` method to append it to the game container.

Now let's make it so that we can close the message by pressing the `Enter` key.

We will create a new `KeyPressListener` class that will be reusable for any key press we want to listen for.

We can't use the `keydown` event or the `DirectionInput` class we currently have because the event for pressing the `Enter` key should only be pressable once per press.

```tsx
export class KeyPressListener {
	keydownFunction: (event: KeyboardEvent) => void;
	keyupFunction: (event: KeyboardEvent) => void;

	constructor(key: string, callback: () => void) {
		let keySafe = true;

		this.keydownFunction = (event: KeyboardEvent) => {
			if (event.key === key && keySafe) {
				keySafe = false;
				callback();
			}
		};

		this.keyupFunction = (event: KeyboardEvent) => {
			if (event.key === key) {
				keySafe = true;
			}
		};

		document.addEventListener('keydown', this.keydownFunction);
		document.addEventListener('keyup', this.keyupFunction);
	}

	unbind() {
		document.removeEventListener('keydown', this.keydownFunction);
		document.removeEventListener('keyup', this.keyupFunction);
	}
}
```

Now we can use this to close our message in the `Message` class.

```tsx
createElement() {
    // ... rest of code

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
```

Notice that we also unbind the key press listener when the message is closed as we don't need it anymore.

#### Talking to NPCs

Now that we have a `message` event, we can use it to talk to NPCs. But we want these messages to also be triggerable by the player when they talk to an NPC.

We can do this by using the same `KeyPressListener` class we just created on the `Overworld` class.

Let's create a `bindActionInput()` method on the `Overworld` class that we will call in the `init()` method.

```ts
bindActionInput() {
    new KeyPressListener('Enter', () => {
        // Is there a person here to talk to?
        this.map.checkForActionCutscene();
    });
}

init() {
    this.startMap(window.OverworldMaps.DemoRoom);

    this.bindActionInput();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();
}
```

Now we can define the `checkForActionCutscene()` method on the `OverworldMap` class.

But before we do, we need to update the configuration for game objects and give them a `talking` property for the messages they will say.

```ts
npcA: new Person({
    x: withGrid(7),
    y: withGrid(9),
    src: '../assets/images/characters/people/npc1.png',
    behaviorLoop: [
        { type: 'stand', direction: 'left', time: 800 },
        { type: 'stand', direction: 'up', time: 800 },
        { type: 'stand', direction: 'right', time: 1200 },
        { type: 'stand', direction: 'up', time: 300 },
    ],
    talking: [
        {
            events: [
                { type: 'message', text: "I'm busy...", faceHero: 'npcA' },
                { type: 'message', text: 'Go away!' },
                { type: 'walk', direction: 'up', who: 'hero' },
            ],
        },
    ],
}),
```

Notice the combining of `message` events and other events to create a story. Also, the structure of the `talking` property may seem a bit strange, but it will be useful for story flags which we will get to later.

Now let's actually pass the `talking` property to the `GameObject` class.

```ts
this.talking = config.talking || [];
```

Now we can define the `checkForActionCutscene()` method on the `OverworldMap` class.

```ts
checkForActionCutscene() {
    const hero = this.gameObjects.hero;
    const nextCoords = nextPosition(hero.x, hero.y, hero.direction);
    const match = Object.values(this.gameObjects).find(obj => {
        return `${obj.x},${obj.y}` === `${nextCoords.x},${nextCoords.y}`;
    });

    if (!this.isCutscenePlaying && match && match.talking.length) {
        this.startCutscene(match.talking[0].events);
    }
}
```

This method is surprisingly simple. We use our utility function from early on to check if an NPC is in front of the player, and if there is, and they have something to say, and there is no global cutscene currently playing, we start the cutscene.

One little tidbit with this. We want to ensure that the NPC faces the player when they talk to them. We can do this by passing the `faceHero` property to the `message` event.

For example:

```ts
{ type: 'message', text: "I'm busy...", faceHero: 'npcA' },
```

Notice that the value of `faceHero` is the name of the NPC we want to face the player.

Now in the `message()` method on the `OverworldEvent` class, we can check for this property and set the direction of the NPC to face the player.

```ts
message(resolve: () => void) {
    if (this.event.faceHero) {
        const hero = this.map.gameObjects.hero;
        const obj = this.map.gameObjects[this.event.faceHero];

        obj.direction = oppositeDirection(hero.direction);
    }

    const messageInstance = new Message({
        text: this.event.text as string,
        onComplete: () => resolve(),
    });

    messageInstance.init(document.querySelector('.game') as HTMLDivElement);
}
```

We want the NPC to face the opposite direction of the player. In other words, if the player is facing right, the NPC should face left.

This is a trivial utility function we can create.

```ts
export const oppositeDirection = (direction: string) => {
	switch (direction) {
		case 'left':
			return 'right';
		case 'right':
			return 'left';
		case 'up':
			return 'down';
		default:
			return 'up';
	}
};
```

What's an added bonus is this `faceHero` property is a flag, meaning if we are designing a cutscene where perhaps we don't want the NPC to face the player because they are angry or something, we can just omit the `faceHero` property.

We may also expand on this later to allow a specific direction to be passed to the `faceHero` property.

#### Cutscene Spaces

So far, we have a system that can trigger cutscenes explicitly or when the player talks to an NPC. But what if we want to trigger a cutscene when the player walks into a specific space?

We can do this by adding a `cutsceneSpaces` property to our `OverworldMaps` configuration. It will have the same structure as the `talking` property because we may want to change the cutscene based on story flags later on.

We start by defining the `cutsceneSpaces` property on the `OverworldMaps` configuration.

```ts
	DemoRoom: {
		lowerSrc: '../assets/images/maps/DemoLower.png',
		upperSrc: '../assets/images/maps/DemoUpper.png',
		gameObjects: {
			// ... game objects
		},
		walls: {
			// ... walls
		},
		cutsceneSpaces: {
			[asGridCoord(7, 4)]: [
				{
					events: [
						{ who: 'npcB', type: 'walk', direction: 'left' },
						{ who: 'npcB', type: 'stand', direction: 'up', time: 500 },
						{ type: 'message', text: "You can't be in there!" },
						{ who: 'npcB', type: 'walk', direction: 'right' },
						{ who: 'npcB', type: 'stand', direction: 'down', time: 100 },
						{ who: 'hero', type: 'walk', direction: 'down' },
						{ who: 'hero', type: 'walk', direction: 'left' },
					],
				},
			]
		},
	},
```

Notice that we are using the `asGridCoord()` utility function that we used before.

Remember to pass the `cutsceneSpaces` property to the `OverworldMap` class.

```ts
this.cutsceneSpaces = config.cutsceneSpaces || {};
```

Now, let's create a `bindHeroPositionCheck()` method on the `Overworld` class, which we'll call in the `init()` method.

```ts
bindHeroPositionCheck() {
    document.addEventListener('PersonWalkingComplete', e => {
        if (e.detail.whoId === 'hero') {
            this.map.checkForFootstepCutscene();
        }
    });
}

init() {
    this.startMap(window.OverworldMaps.DemoRoom);

    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();
}
```

We are listening for the `PersonWalkingComplete` event, which is fired when a person finishes walking. We check if the person that finished walking was the hero, and if so, we call the `checkForFootstepCutscene()` method on the `OverworldMap` class.

Now let's define the `checkForFootstepCutscene()` method on the `OverworldMap` class.

```ts
checkForFootstepCutscene() {
    const hero = this.gameObjects.hero;
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];

    if (!this.isCutscenePlaying && match) {
        this.startCutscene(match[0].events);
    }
}
```

Notice its similar to the `checkForActionCutscene()` method. If we have a cutscene space and there is no global cutscene playing, we start the cutscene.

We repeat this event every time we walk into that space (but we don't have to as we'll see later with story flags).

#### ChangeMap Event

First, let's define the `changeMap` event to take place in one of our `cutsceneSpaces`.

```ts
cutsceneSpaces: {
    [asGridCoord(7, 4)]: [
        {
            events: [
                { who: 'npcB', type: 'walk', direction: 'left' },
                { who: 'npcB', type: 'stand', direction: 'up', time: 500 },
                { type: 'message', text: "You can't be in there!" },
                { who: 'npcB', type: 'walk', direction: 'right' },
                { who: 'npcB', type: 'stand', direction: 'down', time: 100 },
                { who: 'hero', type: 'walk', direction: 'down' },
                { who: 'hero', type: 'walk', direction: 'left' },
            ],
        },
    ],
    [asGridCoord(5, 10)]: [
        {
            events: [{ type: 'changeMap', map: 'Kitchen' }],
        },
    ],
},
```

Notice that we are using the `changeMap` event type and passing the name of the map we want to change to.

Now to actually implement this, we will need to do something we haven't done yet. We need a back reference to the `Overworld` class on the `OverworldMap` class. This is because we no longer want to only set the map when the game starts, but also when we change maps.

So first, let's pass the `overworld` reference to the `OverworldMap` class.

```ts
this.overworld = null;
```

Now, let's create a `startMap()` method in `Overworld` and pass the `overworld` reference to the `OverworldMap` class when we instantiate it.

```ts
startMap(mapConfig: OverworldMapConfig) {
    this.map = new OverworldMap(mapConfig);
    this.map.overworld = this;
    this.map.mountObjects();
}

init() {
    this.startMap(window.OverworldMaps.DemoRoom);

    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();
}
```

Notice how we pass the `Overworld` as a reference to the `OverworldMap` class and use this method when we start the game.

But now, we can also use this method when we change maps. Let's create a `changeMap()` method on the `OverworldEvent` class like usual.

```ts
changeMap(resolve: () => void) {
    this.map.overworld?.startMap(window.OverworldMaps[this.event.map as string]);
    resolve();
}
```

Notice the name of the map is passed as a string in the event that we use as a key to the `OverworldMaps` window object.

Remember to update the `Record` type in `init()` whenever you add a method like so:

```ts
init() {
    const eventHandlers: Record<string, OverworldEventMethod> = {
        stand: this.stand.bind(this),
        walk: this.walk.bind(this),
        message: this.message.bind(this),
        changeMap: this.changeMap.bind(this),
    };

    return new Promise<void>(resolve => {
        eventHandlers[this.event.type](resolve);
    });
}
```

### Day 10

- [x] Typewriter effect
- [x] Scene Transitions

<details>
    <summary>Typewriter Effect</summary>

    This is expandable content.

</details>

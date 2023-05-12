<style>
  details {
    margin-bottom: 0.5rem;
  }

  summary {
    font-size: 1.1rem;
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

- [x] Set up the project
- [x] Create the map
- [x] Pixelate the map
- [x] Create the player
- [x] Create a shadow
- [x] Draw the shadow below the player

<details>
  <summary>Set up the project</summary></br>

  I used [Vite](https://vitejs.dev/) to set up the project. It's a build tool that allows you to use modern JavaScript features without having to worry about compatibility issues. It also has a built-in development server that allows you to hot reload your code.

  From there, we removed any boilerplate code and started the server using `npm run dev`.
</details>

<details>
  <summary>Create the map</summary></br>
  
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
</details>

<details>
  <summary>Pixelate the map</summary></br>

  To pixelate the map, we scaled the canvas using `transform` and used the `image-rendering` CSS property.

  ```css
  .game {
    transform: scale(3);
  }

  .game__canvas {
    image-rendering: pixelated;
  }
  ```
</details>

<details>
  <summary>Create the player</summary></br>
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
  - `sx` and `sy`: tilesheet x, y (top left corner of the grab)
  - `sWidth` and `sHeight`: how big of a grab (width and height)
  - `dx` and `dy`: position to draw image on the canvas (top, left)
  - `dWidth` and `dHeight`: size of the image on the canvas (scaling)

  `32` was used as each sprite tile in the spritesheet is 32x32 pixels.
  `dx` and `dy` wre multiplied by 16 because each tile on the canvas map is 16 pixels.
  `dx` was nudged to the left by 8 pixels to horizontally center the player on the tile.
  `dy` was nudged up by 18 pixels to vertically center the player on the tile.
  `dWidth` and `dHeight` were set to 32 to keep the same scale as the tile.
</details>

<details>
  <summary>Create a shadow and draw the shadow below the player</summary></br>

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
</details>

### Day 2

- [x] Create GameObject pattern
- [x] Refactor

<details>
  <summary>Create GameObject pattern</summary></br>

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
</details>

<details>
  <summary>Refactor</summary></br>

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
</details>

### Day 3

- [x] Create Image Utility
- [x] Create Overworld Maps
- [x] Define Map Configs
- [x] Create Game Loop

<details>
  <summary>Create Image Utility</summary></br>

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
</details>

<details>
  <summary>Create Overworld Maps</summary></br>

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
</details>

<details>
  <summary>Define Map Configs</summary></br>

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
</details>

<details>
  <summary>Create Game Loop</summary></br>

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
</details>

### Day 4

- [x] Fix Jaggedy Movement
- [x] Adding Sprite Updater
- [x] Grid Based Movement
- [x] Keyboard Events
- [x] Player Controlled Flag

<details>
  <summary>Fix Jaggedy Movement</summary></br>

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
</details>

<details>
  <summary>Adding Sprite Updater</summary></br>

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
</details>

<details>
  <summary>Grid Based Movement</summary></br>

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
</details>

<details>
  <summary>Keyboard Events</summary></br>

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
</details>

<details>
  <summary>Player Controlled Flag</summary></br>

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
</details>

### Day 5

- [x] Character Animations

<details>
  <summary>Character Animations</summary></br>

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
</details>

### Day 6

- [x] Creating a Camera

<details>
  <summary>Creating a Camera</summary></br>

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
</details>

### Day 7

- [x] Creating a Collision System
- [x] NPC Puppeting and Refactoring
- [x] Mounting Game Objects and Moving Walls

<details>
  <summary>Creating a Collision System</summary></br>

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
</details>

<details>
  <summary>NPC Puppeting and Refactoring</summary></br>

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
</details>

<details>
  <summary>Mounting Game Objects and Moving Walls</summary></br>

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
</details>

### Day 8

- [x] Behavior Loop System
- [x] Signal Pattern
- [x] Retry Behavior
- [x] Drawing Order
- [x] Cutscene System

<details>
  <summary>Behavior Loop System</summary></br>

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
</details>

<details>
  <summary>Signal Pattern</summary></br>

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
</details>

<details>
  <summary>Retry Behavior</summary></br>

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
</details>

<details>
  <summary>Drawing Order</summary></br>

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
</details>

<details>
  <summary>Cutscene System</summary></br>

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
</details>

### Day 9

- [x] Restarting Idle Behaviors
- [x] Multiplying SetTimeouts
- [x] Message Event
- [x] Talking to NPCs
- [x] Cutscene Spaces
- [x] ChangeMap Event

<details>
  <summary>Restarting Idle Behaviors</summary></br>

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
</details>

<details>
  <summary>Multiplying SetTimeouts</summary></br>

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
</details>

<details>
  <summary>Message Event</summary></br>

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
        text: this.event.text,
        onComplete: () => resolve(),
      });

      messageInstance.init(getElement<HTMLDivElement>('.game'));
  }
  ```

  This method will create a new `Message` instance with textLines from the event, and call the `init()` method to append it to the game container.

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
</details>

<details>
  <summary>Talking to NPCs</summary></br>

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
</details>

<details>
  <summary>Cutscene Spaces</summary></br>

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
</details>

<details>
  <summary>ChangeMap Event</summary></br>

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
</details>

### Day 10

- [x] Typewriter Effect
- [x] Scene Transitions

<details>
  <summary>Typewriter Effect</summary></br>

  Now, we are going to add a typewriter effect to our messages. First, we need to change the structure of our `message` event.

  ```ts
  {
    type: 'message',
    textLines: [
      { speed: SPEEDS.Slow, string: 'Oh, hello!' },
      { speed: SPEEDS.Pause, string: '', pause: true },
      { speed: SPEEDS.Normal, string: 'Have you seen my pet' },
      { speed: SPEEDS.Fast, string: 'frog', classes: ['green'] },
      { speed: SPEEDS.Normal, string: 'around here?' },
    ],
  }
  ```

  Notice that we now have an array of `textLines` instead of a single `text` property. Each `textLine` has a `speed` property, which is the speed of the typewriter effect, a `string` property, which is the text to display, and a `classes` property, which is an array of classes to apply to the text.

  This is much more modular and allows us to make our speech more dynamic. 
  
  With classes like `green` or `red`, we can make a specific word stand out. 
  
  With the `pause` property, we can pause the typewriter effect for a moment to imitate a pause in speech.

  Now, let's update our `message()` method in `OverworldEvent` and the `Message` class to handle this new structure.

  ```ts
  type MessageConfig = {
    textLines: Text[];
    onComplete: () => void;
  };
  
  export class Message {
    textLines: Text[];

    // ... rest of class
  }
  ```

  ```ts
  message(resolve: () => void) {
		if (this.event.faceHero) {
			const hero = this.map.gameObjects.hero;
			const obj = this.map.gameObjects[this.event.faceHero];

			obj.direction = oppositeDirection(hero.direction);
		}

		const messageInstance = new Message({
			textLines: this.event.textLines as Text[],
			onComplete: () => resolve(),
		});

		messageInstance.init(getElement<HTMLDivElement>('.game'));
	}
  ```

  Notice the update in our types. We now have an array of `Text` objects instead of a single `string`. The types will look as follows:

  ```ts
  export enum SPEEDS {
    Pause = 500,
	  Slow = 90,
	  Normal = 60,
	  Fast = 30,
	  SuperFast = 10,
  }

  export type Text = {
    speed: SPEEDS;
    string: string;
    pause?: boolean;
    classes?: string[];
  };
  ```

  We are going to be creating `span` elements for each character and revealing them with `setTimeout`, so the bigger the number, the slower the typewriter effect.

  We'll use the following CSS to initially hide the `span` elements and reveal them when needed.

  ```css
  .message span {
    opacity: 0;
  }

  .message span.revealed {
    opacity: 1;
  }

  .message span.green {
    color: var(--clr-green);
  }

  .message span.red {
    color: var(--clr-red);
      text-transform: uppercase;
  }
  ```

  From here, we can create a new class called `RevealingText` that will handle the typewriter effect.

  ```ts
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
  ```

  This class splits the text into individual characters and creates a `span` element for each one. It then adds the `revealed` class to each `span` element one by one to reveal the text using `setTimeout`. Notice that we also add a space between each text line for readability.

  Also, since we have a slide in animation for our message, we need to wait for that to finish before we start revealing the text. We do this by adding an event listener to the parent element of our message.

  We also have an `isDone` flag that we can use to check when the typewriter effect is done. This is essential for our `Message` class because we need the `Enter` key to have two functions. If the text is still revealing, the `Enter` key should skip the typewriter effect and reveal the text immediately. If the text is done revealing, the `Enter` key should close the message.

  Let's add this functionality to our `Message` class, as well as an instance of `RevealingText`.

  ```ts
  export class Message {
    textLines: Text[];
    onComplete: () => void;
    element: HTMLDivElement | null;
    actionListener?: KeyPressListener;
    revealingText?: RevealingText;

    constructor({ textLines, onComplete }: MessageConfig) {
      // ... constructor code
    }

    createElement() {
      // ... creating the element and innerHTML

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
  }
  ```

  First, we make sure we leave our message blank in the innerHTML. Then we create an instance of `RevealingText` and pass in the `textLines` array and the element we want to add the spans to, our `p` tag in this case.

  Also, notice that our `done()` method now checks if the text is done revealing. If it isn't, we call the `warpToDone()` method on our `RevealingText` instance. This will immediately reveal the text and add the appropriate classes to the `span` elements. If the text is done revealing, we close the message as per usual.
</details>

<details>
  <summary>Scene Transitions</summary></br>

  To create scene transitions when we change maps or when we enter a battle, we'll create a new class called `SceneTransition`.

  But first, let's make our CSS:

  ```css
  .transition {
    position: absolute;
    inset: 0;
    background-color: var(--clr-primary);
    opacity: 0;
    animation: fadeIn var(--mapTransitionSpeed) forwards;
  }

  .transition.fade-out {
    animation: fadeOut var(--mapTransitionSpeed) forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }
  ```

  This will create a black overlay that fades in and out. We'll use this to transition between scenes.

  Now, let's create our `SceneTransition` class:

  ```ts
  export class SceneTransition {
    element: HTMLDivElement | null;

    constructor() {
      this.element = null;
    }

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('transition');
    }

    fadeOut() {
      this.element?.classList.add('fade-out');

      this.element?.addEventListener('animationend', () => {
          this.element?.remove();
      }, { once: true })
    }

    init(container: HTMLDivElement, callback: () => void) {
      this.createElement();
      container.appendChild(this.element as HTMLDivElement);

      this.element?.addEventListener('animationend', () => {
          callback();
      }, { once: true })
    }
  }
  ```

  All we do here is create a `div` for the transition to live, add the animation class to it, and call a callback function when the animation is done.

  Let's add this to our `changeMap()` method in `OverworldEvent`:

  ```ts
  changeMap(resolve: () => void) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			this.map.overworld?.startMap(window.OverworldMaps[this.event.map as string]);
			resolve();

			sceneTransition.fadeOut();
		});
	}
  ```

  Notice that our passed in callback will actually change the map because we want the order of events to be:

  1. Fade in
  2. Change map
  3. Fade out

  After we change the map, we call `fadeOut()` on our `SceneTransition` instance to fade out the transition, which will then remove itself from the DOM.
</details>

### Day 11

- [x] Battle UI

<details>
  <summary>Battle UI</summary>

  We are going to start by creating 4 new classes:

  - `Battle`
  - `Combatant`
  - `Team`
  - `SubmissionMenu`

  Let's start with creating the `battle` event.

  ```ts
  { type: 'battle' }
  ```

  We'll be adding more to this later, but for now, let's create the `battle()` method in `OverworldEvent`:

  ```ts
  battle(resolve: () => void) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			const battle = new Battle({
				onComplete: () => {
					resolve();
				},
			});

			battle.init(getElement<HTMLDivElement>('.game'));

			// After battle is over
			sceneTransition.fadeOut();
		});
	}
  ```

  Notice how we're reusing our `SceneTransition` class to fade in and out of the battle. We also pass in a callback to the `Battle` class that will resolve the promise when the battle is over.

  Now, before we create the `Battle` class, let's create our Pizzadex (a Pokedex for our different pizzas). We'll do so by appending an object to the `window` object:

  ```ts
    window.PizzaTypes = {
    normal: 'normal',
    spicy: 'spicy',
    veggie: 'veggie',
    fungi: 'fungi',
    chill: 'chill',
  };

  window.Pizzas = {
    s001: {
      name: 'Slice Samurai',
      type: window.PizzaTypes.normal,
      src: getSrc('../assets/images/characters/pizzas/s001.png'),
      icon: getSrc('../assets/images/icons/spicy.png'),
    },
    v001: {
      name: 'Call Me Kale',
      type: window.PizzaTypes.veggie,
      src: getSrc('../assets/images/characters/pizzas/v001.png'),
      icon: getSrc('../assets/images/icons/veggie.png'),
    },
    f001: {
      name: 'Portobello Express',
      type: window.PizzaTypes.fungi,
      src: getSrc('../assets/images/characters/pizzas/f001.png'),
      icon: getSrc('../assets/images/icons/fungi.png'),
    },
  };
  ```

  From here, let's create our `Battle` class. Initially, a lot of the data will be hard coded, but we'll be able to refactor it later.

  ```ts
  export class Battle {
    element!: HTMLDivElement;
    onComplete: () => void;

    combatants: Combatants;
    activeCombatants: ActiveCombatants;

    constructor({ onComplete }: BattleConfig) {
      this.onComplete = onComplete;

      this.combatants = {
        player1: new Combatant(
          {
            ...window.Pizzas.s001,
            team: 'player',
            hp: 30,
            maxHp: 50,
            xp: 75,
            maxXp: 100,
            level: 1,
            status: {
              type: 'clumsy',
              expiresIn: 3,
            },
          },
          this
        ),
        enemy1: new Combatant(
          {
            ...window.Pizzas.v001,
            team: 'enemy',
            hp: 20,
            maxHp: 50,
            xp: 20,
            maxXp: 100,
            level: 1,
          },
          this
        ),
        enemy2: new Combatant(
          {
            ...window.Pizzas.f001,
            team: 'enemy',
            hp: 25,
            maxHp: 50,
            xp: 30,
            maxXp: 100,
            level: 1,
          },
          this
        ),
      };

      this.activeCombatants = {
        player: 'player1',
        enemy: 'enemy1',
      };
    }

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('battle');

      const heroSrc = getSrc('../assets/images/characters/people/hero.png');
      const enemySrc = getSrc('../assets/images/characters/people/npc3.png');

      this.element.innerHTML = `
              <div class='battle__hero'>
                  <img src='${heroSrc}' alt='Hero' />
              </div>
              <div class='battle__enemy'>
                  <img src='${enemySrc}' alt='Enemy' />
              </div>
          `;
    }

    init(container: HTMLDivElement) {
      this.createElement();
      container.appendChild(this.element as HTMLDivElement);

      Object.keys(this.combatants).forEach(key => {
        const combatant = this.combatants[key];

        combatant.id = key;
        combatant.init(this.element);
      });
    }
  }
  ```

  Pretty simple here. `combatants` is an object that contains all of the combatants in the battle. `activeCombatants` is an object that contains the active combatants for each team. We'll use this to determine who to show in the battle.

  From there, we dynamically create a DOM element as per usual, and we also dynamically give an `id` to each combatant which we'll use in the `Combatant` class.

  Notice that the `Combatant` class takes many configuration properties as well as a reference to the `Battle` class.

  Finally, let's create the `Combatant` class:

  ```ts
  export class Combatant {
    id!: string;
    name: string;
    type: PizzaType;
    src: string;
    icon: string;
    team: TeamType;
    hp: number;
    maxHp: number;
    xp: number;
    maxXp: number;
    level: number;
    status?: {
      type: string;
      expiresIn: number;
    };

    battle: Battle;

    hudElement!: HTMLDivElement;
    pizzaElement!: HTMLImageElement;
    hpFills!: NodeListOf<SVGRectElement>;
    xpFills!: NodeListOf<SVGRectElement>;

    constructor(config: CombatantConfig, battle: Battle) {
      // config is HP, maxHP, XP, name, actions, etc.
      this.id = config.id;
      this.name = config.name;
      this.type = config.type;
      this.src = config.src;
      this.icon = config.icon;
      this.team = config.team;
      this.hp = config.hp;
      this.maxHp = config.maxHp;
      this.xp = config.xp;
      this.maxXp = config.maxXp;
      this.level = config.level;
      this.status = config.status;

      this.battle = battle;
    }

    get hpPercentage() {
      return Math.max(0, Math.min(100, (this.hp / this.maxHp) * 100));
    }

    get xpPercentage() {
      return (this.xp / this.maxXp) * 100;
    }

    get isActive() {
      return this.battle.activeCombatants[this.team] === this.id;
    }

    private setProperty<T extends keyof CombatantConfig>(
      property: T,
      value: CombatantConfig[T]
    ) {
      (this as CombatantProperty)[property] = value;
    }

    createElement() {
      this.hudElement = document.createElement('div');
      this.hudElement.classList.add('combatant');
      this.hudElement.setAttribute('data-combatant', this.id);
      this.hudElement.setAttribute('data-team', this.team);

      this.hudElement.innerHTML = `
        <p class='combatant__name'>${this.name}</p>
        <p class='combatant__level'></p>
        <div class='combatant__wrapper'>
          <img class='combatant__image' src='${this.src}' alt='${this.name}' />
        </div>
        <img class='combatant__type' src='${this.icon}' alt='${this.type}' />
        <svg viewBox='0 0 26 3' class='combatant__life-container'>
          <rect x=0 y=0 width='0%' height=1 fill='#82ff71' />
          <rect x=0 y=1 width='0%' height=2 fill='#3ef126' />
        </svg>
        <svg viewBox='0 0 26 2' class='combatant__xp-container'>
          <rect x=0 y=0 width='0%' height=1 fill='#ffd76a' />
          <rect x=0 y=1 width='0%' height=1 fill='#ffc934' />
        </svg>
        <p class='combatant__status'></p>
      `;

      this.pizzaElement = document.createElement('img');
      this.pizzaElement.classList.add('pizza');
      this.pizzaElement.setAttribute('src', getSrc(this.src));
      this.pizzaElement.setAttribute('alt', this.name);
      this.pizzaElement.setAttribute('data-team', this.team);

      this.hpFills = this.hudElement.querySelectorAll(
        '.combatant__life-container > rect'
      );

      this.xpFills = this.hudElement.querySelectorAll(
        '.combatant__xp-container > rect'
      );
    }

    update(changes: Partial<CombatantConfig> = {}) {
      Object.keys(changes).forEach((key: string) => {
        const propertyKey = key as keyof CombatantConfig;

        this.setProperty(propertyKey, changes[propertyKey]);
      });

      // Update active state
      this.hudElement.setAttribute('data-active', `${this.isActive}`);
      this.pizzaElement.setAttribute('data-active', `${this.isActive}`);

      // Update the HP
      this.hpFills.forEach(rect => {
        rect.style.width = `${this.hpPercentage}%`;
      });

      // Update the XP
      this.xpFills.forEach(rect => {
        rect.style.width = `${this.xpPercentage}%`;
      });

      // Update the Level
      getElement('.combatant__level', this.hudElement).innerText = `${this.level}`;
    }

    init(container: HTMLDivElement) {
      this.createElement();
      container.append(this.hudElement);
      container.append(this.pizzaElement);
      this.update();
    }
  }
  ```

  A rather long class, but let's break it down.

  The constructor is just a bunch of grunt work to set up the properties of the combatant. We also pass in a reference to the `Battle` class so that we can use it later.

  `hpPercentage()` and `xpPercentage()` are just getters that calculate the percentage of HP and XP remaining so we can set the `width` of the SVG elements.

  `isActive()` is a getter that checks if the combatant is the active combatant for their team so we can show the pizza on the screen using CSS.

  `setProperty()` is a helper method that uses generics so we can dynamically update properties on the class in the `update` method.

  `createElement()` just creates the DOM elements as usual. Notice that we have multiple elements this time, one for the HUD itself, and one for the pizza. The HUD will include SVG elements for the HP and XP bars.

  We also create references to the HP and XP bars so we can update them later.

  `update()` is where the magic happens. We pass in an object of changes that we want to make to the combatant. We then loop through each key in the object and use the `setProperty()` method to update the property on the class for any incoming changes.

  We then update the active state of the combatant, the HP and XP bars, and the level.

  Finally, we have the `init()` method which creates the DOM elements, appends them to the container, and calls `update()` to set the initial state.
</details>

### Day 12

- [x] Turn System

<details>
  <summary>Turn System</summary>

  This is the big one, definitely the most complicated part of the game, but we'll try to simplify it as much as possible.

  The turn system in the game will be a queue of BattleEvents that are awaited one after another. Once all the battle events for a player has been resolved, it will go to the enemy, then back to the player, and so on until the battle is over.

  We'll start by pre-instantiating a `TurnCycle` class in the `Battle` class. It's probably the easiest way to grasp what's going on.

  ```ts
  init(container: HTMLDivElement) {
    this.createElement();
    container.appendChild(this.element as HTMLDivElement);

    Object.keys(this.combatants).forEach(key => {
      const combatant = this.combatants[key];

      combatant.id = key;
      combatant.init(this.element);
    });

    this.turnCycle = new TurnCycle({
      battle: this,
      onNewEvent: (event: BattleEventType) => {
        return new Promise<void | Submission>(resolve => {
          const battleEvent = new BattleEvent(event, this);
          battleEvent.init(resolve);
        });
      },
    });

    this.turnCycle.init();
  }
  ```

  Notice that we instantiate a `TurnCycle` after the battle starts, which takes a reference to the `Battle` class and a function called `onNewEvent`. This function takes a `BattleEvent` and returns a `Promise` that is to be awaited. That promise will either return `void` or a `Submission` object, which we'll get to later.

  Now, let's look at the `TurnCycle` class.

  ```ts
  type TurnCycleConfig = {
    battle: Battle;
    onNewEvent: (event: BattleEventType) => Promise<void | Submission>;
  };

  export class TurnCycle {
    battle: Battle;
    onNewEvent: (event: BattleEventType) => Promise<void | Submission>;
    currentTeam: 'player' | 'enemy';

    constructor({ battle, onNewEvent }: TurnCycleConfig) {
      this.battle = battle;
      this.onNewEvent = onNewEvent;
      this.currentTeam = 'player';
    }

    async turn() {
      // Get the caster
      const casterId = this.battle.activeCombatants[this.currentTeam];
      const caster = this.battle.combatants[casterId];

      // Get the enemy
      const oppositeTeam = caster.team === 'player' ? 'enemy' : 'player';
      const enemyId = this.battle.activeCombatants[oppositeTeam];
      const enemy = this.battle.combatants[enemyId];

      const submission = await this.onNewEvent({
        type: 'submissionMenu',
        caster,
        enemy,
      });

      const resultingEvents = (submission?.action.success || []) as BattleEventType[];

      for (const event of resultingEvents) {
        const newEvent = {
          ...event,
          action: submission?.action,
          caster,
          target: submission?.target,
        };

        if (submission) newEvent.submission = submission;

        await this.onNewEvent(newEvent);
      }

      // Change the current team and go to the next turn
      this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
      this.turn();
    }

    async init() {
      await this.onNewEvent({
        type: 'message',
        textLines: [
          { speed: SPEEDS.Normal, string: 'The battle is' },
          { speed: SPEEDS.Fast, string: 'starting!', classes: ['green'] },
        ],
      });

      this.turn();
    }
  }
  ```

  Notice that we also create a `currentTeam` property that keeps track of whose turn it currently is (player or enemy).

  We start the battle with a message that says `The battle is starting!`, that is also a `BattleEvent` but is just like an `OverworldEvent` except you see it in the battle scene.

  Then we call `turn()` which is an async function that will loop forever until the battle is over.

  Inside the `turn()` function, we get references to the caster `Combatant` and the enemy `Combatant` using properties from the `Battle` class.

  We then pass these references to the a new `BattleEvent` called `submissionMenu` which is the menu that the player uses to select their action.
  
  Remember that all `onNewEvent` does is create a new `BattleEvent`, initialize it, and return a `Promise` that is to be awaited.

  Let's pause on the `turn()` method for a moment and look at the `BattleEvent` class. For now, we are just going to look at the `submissionMenu()` method.

  ```ts
  submissionMenu(resolve: SubmissionResolve) {
		if (!this.event.caster || !this.event.enemy) return resolve();

		const menu = new SubmissionMenu({
			caster: this.event.caster,
			enemy: this.event.enemy,
			onComplete: submission => {
				// submission { what move to use, who to use it on }
				resolve(submission);
			},
		});

		menu.init(this.battle.element);
	}
  ```

  All we do here is pass the `caster` and `enemy` references we got in `turn()` and pass them to a new `SubmissionMenu` class. We also pass a callback function called `onComplete` that will be called when the player selects an action.

  But notice this callback isn't one we usually see. It includes a parameter called `submission` which is an object that contains the `action` and the `target`. This is because the player can select an action, then select a target, then select another action, then select another target, and so on. So we need to keep track of the action and target as the player is selecting them.

  It's important to understand the concept here. This `submission` object so to speak will be returned by the resolver, which we'll use in the `turn()` method.

  Now let's quickly look at the `SubmissionMenu` class.

  ```ts
  type SubmissionMenuConfig = {
    caster: Combatant;
    enemy: Combatant;
    onComplete: (submission: Submission) => void;
  };

  export class SubmissionMenu {
    caster: Combatant;
    enemy: Combatant;
    onComplete: (submission: Submission) => void;

    constructor({ caster, enemy, onComplete }: SubmissionMenuConfig) {
      this.caster = caster;
      this.enemy = enemy;
      this.onComplete = onComplete;
    }

    decide() {
      this.onComplete({
        action: window.Actions[this.caster.actions[0]],
        target: this.enemy,
      });
    }

    init(container: HTMLDivElement) {
      this.decide();
    }
  }
  ```

  For now, this class doesn't do a lot. We are hardcoding the same action (which is a move called `Fling`, i.e. `this.caster.actions[0]`) and the same target (the enemy `Combatant`) every time. But this is where we would create a UI that allows the player to select an action and a target.

  But what exactly are these `Actions`? Let's quickly look at our window objects.

  ```ts
  window.PizzaTypes = {
    normal: 'normal',
    spicy: 'spicy',
    veggie: 'veggie',
    fungi: 'fungi',
    chill: 'chill',
  };

  window.Pizzas = {
    s001: {
      name: 'Slice Samurai',
      type: window.PizzaTypes.normal,
      src: getSrc('../assets/images/characters/pizzas/s001.png'),
      icon: getSrc('../assets/images/icons/spicy.png'),
      actions: ['damage1'],
    },
    v001: {
      name: 'Call Me Kale',
      type: window.PizzaTypes.veggie,
      src: getSrc('../assets/images/characters/pizzas/v001.png'),
      icon: getSrc('../assets/images/icons/veggie.png'),
      actions: ['damage1'],
    },
    f001: {
      name: 'Portobello Express',
      type: window.PizzaTypes.fungi,
      src: getSrc('../assets/images/characters/pizzas/f001.png'),
      icon: getSrc('../assets/images/icons/fungi.png'),
      actions: ['damage1'],
    },
  };
  ```

  REMEMBER that these pizza properties are spread into the configuration objects for each `Combatant` in the `Battle Class`, assigned in the `Combatant` class.

  Long story short, each `Combatant` has these `actions` which are an array of strings with names of moves that they can use. But what actually is `damage1`? It's a key in the `Actions` window object. Let's look at that.

  ```ts
  window.Actions = {
    damage1: {
      name: 'Fling',
      success: [
        {
          type: 'message',
          textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
        },
        { type: 'animation', animation: 'spin' },
        { type: 'stateChange', damage: 10 },
      ],
    },
  };
  ```

  Each `Action` has a `name` for the move to be shown in the `message` event, and a `success` array of `BattleEvent` objects that will be executed when the move is successful.

  Later on, we'll have properties like `failure`, etc. for things to happen when the move fails, but for now, we just have `success`.

  Now there's two more tidbits to notice here. 
  
  First, notice that the `textLines` property of the `message` event has `{CASTER}` and `{ACTION}` in it. These are special strings that will be replaced with the `name` of the `caster` and the `name` of the `action` dynamically.

  Let's see where that happens back in our `BattleEvent` class.

  ```ts
  message(resolve: VoidResolve) {
		const textLines =
			this.event.textLines?.map(line => {
				return {
					...line,
					string: line.string
						.replace('{CASTER}', this.event.caster?.name || '')
						.replace('{TARGET}', this.event.target?.name || '')
						.replace('{ACTION}', this.event.action?.name || ''),
				};
			}) || [];

		const message = new Message({
			textLines,
			onComplete: () => {
				resolve();
			},
		});

		message.init(this.battle.element);
	}
  ```

  Notice that before we actually instantiate a new `Message`, we are replacing those special strings with the `name` of the `caster`, `target`, and `action`.

  Finally, we have two more `BattleEvent`s to look at. The `animation` and `stateChange` events. Luckily, these are pretty simple.

  ```ts
  async stateChange(resolve: VoidResolve) {
		const { caster, target, damage } = this.event;

		if (damage) {
			// Modify the target to have less HP
			target?.update({
				hp: target.hp - damage,
			});

			// Start blinking the Pizza
			target?.pizzaElement.classList.add('blinking');
		}

		// Wait a little bit
		await wait(600);

		// Stop blinking the Pizza
		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}
  ```

  `stateChange()` basically does five things.

  1. Update the `hp` of the `target` (decrease it by the incoming damage)
  2. Add a blinking CSS effect to the attacked Pizza
  3. Wait a little bit (so that the player can see the blinking)
  4. Remove the blinking CSS effect
  5. Resolve the promise

  Notice that we use the `update()` method of the `Combatant` class that we defined a while back, which will incorporate UI changes in real time.

  Also, `wait()` is just a trivial utility function that uses a `setTimeout()` to wait a given amount of time before continuing code execution.

  ```ts
  export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  ```

  Finally, we have the `animation` event. Before we look at this, let's look at another added window object which holds battle animations we create.

  ```ts
  window.BattleAnimations = {
    async spin(event: BattleEventType, onComplete: () => void) {
      const element = event.caster?.pizzaElement;
      const animationClass =
        event.caster?.team === 'player' ? 'spin-right' : 'spin-left';

      element?.classList.add(animationClass);

      // Remove the animation when it's done
      element?.addEventListener(
        'animationend',
        () => {
          element.classList.remove(animationClass);
        },
        { once: true }
      );

      // Continue turn cycle right around when Pizzas collide
      await wait(100);
      onComplete();
    },
  };
  ```

  For now, we only have one animation called `spin`. Remember that each `Combatant` has a `pizzaElement` property that we can use here. We apply the appropriate direction for the spin animation based on whose attack it is, and remove it when the animation is done.

  We also wait 100ms before continuing the turn cycle, so that the Pizzas can collide before the next turn starts.

  That's pretty much everything! Now let's finish off with the rest of the `turn()` method in the `Battle` class.

  ```ts
  async turn() {
		// Get the caster
		const casterId = this.battle.activeCombatants[this.currentTeam];
		const caster = this.battle.combatants[casterId];

		// Get the enemy
		const oppositeTeam = caster.team === 'player' ? 'enemy' : 'player';
		const enemyId = this.battle.activeCombatants[oppositeTeam];
		const enemy = this.battle.combatants[enemyId];

		const submission = await this.onNewEvent({
			type: 'submissionMenu',
			caster,
			enemy,
		});

		const resultingEvents = (submission?.action.success || []) as BattleEventType[];

		for (const event of resultingEvents) {
			const newEvent = {
				...event,
				action: submission?.action,
				caster,
				target: submission?.target,
			};

			if (submission) newEvent.submission = submission;

			await this.onNewEvent(newEvent);
		}

		// Change the current team and go to the next turn
		this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
		this.turn();
	}
  ```

  So as we saw, if the `BattleEvent` is a `submissionMenu`, we'll get back a `submission` object that has the `action` and `target` that the player chose.

  In the `action` object, we have the `success` array of `BattleEvent`s that we want to execute. So we loop through those and execute them one by one by using `await`.

  Notice how we append references to the `action` and `target` to the `newEvent` object. This is so that we can use them in the `message()` method of the `BattleEvent` class if needed.

  Finally, we change the `currentTeam` and call `turn()` again to start the next turn.

  Notice that right now, we don't have any way to end the battle. We'll add that in the next section.
</details>

### Day 13

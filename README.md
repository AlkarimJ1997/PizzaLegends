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

- [x] Adding Status Effects

<details>
  <summary>Adding Status Effects</summary></br>

  Now that our turn system is working, we can add status effects to the game. We'll focus on `saucy` which restores HP every turn, and `clumsy` which makes the Pizza have a chance to miss their attack.

  Let's start by showing our active status on the UI. Let's add the following lines to the `update()` method of the `Combatant` class.

  ```ts
  update(changes: Partial<CombatantConfig> = {}) {
		// ... rest of code

		// Update the Status
		const statusElement = getElement('.combatant__status', this.hudElement);

		if (this.status) {
			statusElement.innerText = this.status.type;
			statusElement.style.display = 'block';
			return;
		}

		statusElement.innerText = '';
		statusElement.style.display = 'none';
	}
  ```

  Here, if there's an active status, we'll show it on the UI. Otherwise, we'll hide it.

  Now, we need to add events that take place after normal `BattleEvent`s. We'll call these `postEvents`. Let's consume these in the `turn()` method of the `TurnCycle` class.

  We'll do so right after `await`ing all the resulting events.

  ```ts
  const postEvents = caster.getPostEvents() as BattleEventType[];

  for (const event of postEvents) {
    const newEvent = {
      ...event,
      action: submission?.action,
      caster,
      target: submission?.target,
    };

    if (submission) newEvent.submission = submission;

    await this.onNewEvent(newEvent);
  }
  ```

  Notice the similarity to the `resultingEvents` loop. We'll also need to add a `getPostEvents()` method to the `Combatant` class.

  ```ts
  getPostEvents() {
		if (this.status?.type === 'saucy') {
			return [
				{
					type: 'message',
					textLines: [
						{ speed: SPEEDS.Fast, string: "Feelin'" },
						{ speed: SPEEDS.Fast, string: 'saucy!', classes: ['orange', 'dance'] },
					],
				},
				{ type: 'stateChange', recover: 5, onCaster: true },
			];
		}

		return [];
	}
  ```

  Now, if the `Combatant` has the `saucy` status, we'll return a `message` event that says "Feelin' saucy!" and a `stateChange` event that restores 5 HP to the `Combatant`.

  But we actually have to handle these new parameters in the `stateChange()` method of the `BattleEvent` class.

  ```ts
  async stateChange(resolve: VoidResolve) {
		const { caster, target, damage, recover, status } = this.event;
		const who = this.event.onCaster ? caster : target;

		if (damage) {
			if (target && target.status?.type !== 'protected') {
				target.update({ hp: target.hp - damage });
				target.pizzaElement.classList.add('blinking');
			}
		}

		if (recover) {
			if (who) {
				const newHp = Math.min(who.hp + recover, who.maxHp);
				who.update({ hp: newHp });
			}
		}

		// Wait a little bit, then stop blinking the Pizza
		await wait(600);
		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}
  ```

  Now, if the `BattleEvent` has a `recover` property, we'll restore that much HP to the `Combatant`. But if the HP would go over the `maxHp`, we'll just set it to the `maxHp`.

  Now, we have to actually handle decrementing the status effect every turn. Remember it has an `expiresIn` property that we have to decrement every turn.

  Let's create a new `decrementStatus()` method in the `Combatant` class.

  ```ts
  decrementStatus() {
		if (!this.status) return null;

		if (this.status.expiresIn > 0) {
			this.status.expiresIn -= 1;

			if (this.status.expiresIn !== 0) return null;

			const { type } = this.status;
			this.update({ status: null });

			return {
				type: 'message',
				textLines: [
					{
						speed: SPEEDS.Fast,
						string: `${this.name} is no longer ${type}!`,
					},
				],
			};
		}
	}
  ```

  Pretty simple here. We decrement the status effect if we have one, and once it reaches 0, we remove it from the `Combatant` and return a `message` event that says that the status effect has ended.

  Let's call this in our turn cycle now.

  ```ts
  const expiredEvent = caster.decrementStatus();

  if (expiredEvent) await this.onNewEvent(expiredEvent);

  // Change the current team and go to the next turn
  this.currentTeam = this.currentTeam === 'player' ? 'enemy' : 'player';
  this.turn();
  ```

  But how do we actually get these status effects applied in the first place? Let's add a new action that will do so.

  ```ts
  saucyStatus: {
		name: 'Tomato Squeeze',
		description: 'Squeeze tomato sauce for an HP boost',
		icon: '🍅',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
			},
			{
				type: 'stateChange',
				status: {
					type: 'saucy',
					expiresIn: 3,
				},
			},
		],
	},
	clumsyStatus: {
		name: 'Olive Oil',
		description: 'Spray olive oil to make your opponent slip',
		icon: '🫒',
		success: [
			{
				type: 'message',
				textLines: [{ speed: SPEEDS.Fast, string: '{CASTER} uses {ACTION}!' }],
			},
			{ type: 'animation', animation: 'glob', color: 'var(--clr-olive-oil)' },
			{ type: 'animation', animation: 'slip' },
			{
				type: 'stateChange',
				status: {
					type: 'clumsy',
					expiresIn: 3,
				},
			},
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{TARGET} is slipping all around!' },
				],
			},
		],
	},
  ```

  Notice that these actions pass an actual `status` property to the `stateChange` event. We'll need to handle this in the `stateChange()` method of the `BattleEvent` class.

  We also have a `targetType` property on the action. This will be used to determine which `Combatant` to apply the status effect to.

  ```ts
  async stateChange(resolve: VoidResolve) {
		const { caster, target, damage, recover, status } = this.event;
		const who = this.event.onCaster ? caster : target;

		if (damage) {
			if (target && target.status?.type !== 'protected') {
				target.update({ hp: target.hp - damage });
				target.pizzaElement.classList.add('blinking');
			}
		}

		if (recover) {
			if (who) {
				const newHp = Math.min(who.hp + recover, who.maxHp);
				who.update({ hp: newHp });
			}
		}

		if (status) {
			who?.update({
				status: { ...status },
			});
		}

		if (status === null) {
			who?.update({
				status: null,
			});
		}

		// Wait a little bit, then stop blinking the Pizza
		await wait(600);
		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}
  ```

  Pretty simple here. If the `BattleEvent` has a `status` property, we'll apply it to the `Combatant`. If it's `null`, we'll remove the status effect from the `Combatant`.

  But we also have to handle the status effect in terms of our event queue. For example, if a `Combatant` has the `clumsy` status effect, we want to make sure that they have a chance to slip and fall instead of attacking. Right now, we only have success events. Let's fix that.

  ```ts
  const resultingEvents = caster.getReplacedEvents(
    submission?.action.success || []
  );

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
  ```

  Notice the changes in the `turn()` method. We're calling a new `getReplacedEvents()` method on the `Combatant` class. Let's add that now.

  ```ts
  getReplacedEvents(originalEvents: BattleEventType[]) {
		const randomChance = [true, false, false];

		if (this.status?.type === 'clumsy' && randomFromArray(randomChance)) {
			return [
				{
					type: 'message',
					textLines: [
						{ speed: SPEEDS.Fast, string: `${this.name} flops over!` },
					],
				},
			];
		}

		return originalEvents;
	}
  ```

  Now, we are piping the success events through this function. There's a chance that nothing happens and we just return the original events. But if the `Combatant` has the `clumsy` status effect, there's a 1/3 chance that they'll slip and fall instead of performing the action.

  Think of it like a pass through filter.
</details>

### Day 14

- [x] Battle Menu UI

<details>
  <summary>Battle Menu UI</summary></br>

  Up till now, our Battle System just chooses a random action for the player and enemy. Let's add a UI so that the player can choose their own action.

  First, let's add a flag to our first `Combatant` in the `Battle` class called `isPlayerControlled`. This will be used to determine if we should show the menu or not.

  ```ts
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
        isPlayerControlled: true,
      },
      this
    ),
    // ... rest of the combatants
  };
  ```

  Now we can change the `init()` method of the `SubmissionMenu` class to check for this flag.

  ```ts
  init(container: HTMLDivElement) {
		if (this.caster.isPlayerControlled) {
			this.showMenu(container);
			return;
		}

		this.decide();
	}
  ```

  So now, if the caster is a player, we'll show the menu. Otherwise, we'll just call the `decide()` method, which will choose a random action for the enemy.

  We are going to create a menu that is reusable. To do this, we need to pipe the pages that we want the menu to show. Let's create a `getPages()` method in the `SubmissionMenu` class.

  ```ts
  getPages() {
		const backOption = {
			label: 'Go Back',
			description: 'Return to previous page',
			handler: () => {
				this.keyboardMenu.setOptions(this.getPages().root);
			},
            right: () => {
                return '🔙';
            }
		};

		return {
			root: [
				{
					label: 'Attack',
					description: 'Choose an attack',
					handler: () => {
						this.keyboardMenu.setOptions(this.getPages().attacks);
					},
					right: () => {
						return '💥';
					},
				},
				{
					label: 'Items',
					description: 'Use an item',
					handler: () => {
						this.keyboardMenu.setOptions(this.getPages().items);
					},
					right: () => {
						return '🎒';
					},
				},
				{
					label: 'Swap',
					description: 'Swap out your current pizza',
					handler: () => {
						// Do something when chosen
					},
          right: () => {
              return '🔄';
          }
				},
			],
			attacks: [
				...this.caster.actions.map(attackName => {
					const action = window.Actions[attackName];

					return {
						label: action.name,
						description: action.description,
						handler: () => {
							this.menuSubmit(action);
						},
            right: () => {
                return action.icon;
            }
					};
				}),
				backOption,
			],
			items: [
				// Items go here...
				backOption,
			],
		};
	}
  ```

  Little bit of a long method but it's simple. We have a `root` page that has the main menu options (Attack, Items, Swap). 
  
  Then we have an `attacks` page that has all of the attacks that the player can choose from (dynamically added). We also have an `items` page that will have all of the items that the player can choose from (more on that later).

  We also have a property called `right` that is a function that returns a string, which we are going to use as an emoji icon for the menu option.

  We also have a universal `backOption` so that the player can go back to the previous page.

  Notice that each `handler()` method calls `this.keyboardMenu.setOptions()` with a different page. This is how we are going to change the menu options when the player chooses an option.

  Now, let's create the `showMenu()` method.

  ```ts
  showMenu(container: HTMLDivElement) {
		this.keyboardMenu = new KeyboardMenu();
		this.keyboardMenu.init(container);
		this.keyboardMenu.setOptions(this.getPages().root);
	}
  ```

  Here, we just create a new `KeyboardMenu` class, append it to the container to show it on screen and set the options to the `root` page.

  Let's create the `KeyboardMenu` class now.

  ```ts
  export class KeyboardMenu {
    options: Page[];
    up: KeyPressListener | null;
    down: KeyPressListener | null;
    prevFocus: HTMLButtonElement | null;

    element!: HTMLDivElement;
    descriptionElement!: HTMLDivElement;
    descriptionElementText!: HTMLParagraphElement;

    constructor() {
      this.options = [];
      this.up = null;
      this.down = null;
      this.prevFocus = null;
    }

    setOptions(options: Page[]) {
      this.options = options;

      const optionHTML = this.options.map((option, index) => {
        const disabled = option.disabled ? 'disabled' : '';

        return `
          <div class='option'>
              <button
                  ${disabled} 
                  data-button='${index}' 
                  data-description='${option.description}'>
                  ${option.label}
              </button>
              <span class='right'>
                  ${option.right ? option.right() : ''}
              </span>
          </div>
        `;
      });

      this.element.innerHTML = optionHTML.join('');

      this.element.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', () => {
          const index = button.getAttribute('data-button');

          if (index) {
            const option = this.options[parseInt(index)];
            option.handler();
          }
        });

        button.addEventListener('mouseenter', () => button.focus());

        button.addEventListener('focus', () => {
          this.prevFocus = button;
          this.descriptionElementText.innerText =
            button.dataset.description || '';
        });
      });

      setTimeout(() => {
        getElement('button[data-button]:not([disabled])', this.element)?.focus();
      }, 10);
    }

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('keyboard-menu');

      // Description Box
      this.descriptionElement = document.createElement('div');
      this.descriptionElement.classList.add('description');
      this.descriptionElement.innerHTML = `<p>I will provide information</p>`;
      this.descriptionElementText = getElement('p', this.descriptionElement);
    }

    end() {
      this.element.remove();
      this.descriptionElement.remove();

      this.up?.unbind();
      this.down?.unbind();
    }

    init(container: HTMLDivElement) {
      this.createElement();
      container.appendChild(this.descriptionElement);
      container.appendChild(this.element);

      // Keyboard Navigation
      this.up = new KeyPressListener('ArrowUp', () => {
        const current = Number(this.prevFocus?.getAttribute('data-button'));
        const buttonArr = getElements<HTMLButtonElement>('button', this.element);
        const prevButton = buttonArr.reverse().find(button => {
          if (!button.dataset.button) return;

          const buttonNumber = Number(button.dataset.button);

          return buttonNumber < current && !button.disabled;
        });

        prevButton?.focus();
      });

      this.down = new KeyPressListener('ArrowDown', () => {
        const current = Number(this.prevFocus?.getAttribute('data-button'));
        const buttonArr = getElements<HTMLButtonElement>('button', this.element);
        const nextButton = buttonArr.find(button => {
          if (!button.dataset.button) return;

          const buttonNumber = Number(button.dataset.button);

          return buttonNumber > current && !button.disabled;
        });

        nextButton?.focus();
      });
    }
  }
  ```

  Let's break this down.

  We have a `setOptions()` method that takes in an array of `Page` objects and creates the HTML for the menu. We also have a `createElement()` method that creates the HTML for the menu.

  We also have a `end()` method that removes the menu from the DOM and unbinds the keyboard listeners.

  We also have an `init()` method that appends the menu to the container and binds the keyboard listeners.

  The loops in the `init()` method are slightly complex, but they basically make it so that if we press the up arrow key, it will focus on the previous button that isn't disabled. And if we press the down arrow key, it will focus on the next button that isn't disabled.

  We have to use `reverse()` on the button array when going up because otherwise our condition will be true for button 1, 2, etc. but we want button 4 to be focused on if we are on button 5.

  Also the following line is just a complex selector for focusing on the first button that isn't disabled.

  ```ts
  setTimeout(() => {
    getElement('button[data-button]:not([disabled])', this.element)?.focus();
  }, 10);
  ```

  Finally, let's look at the `menuSubmit()` method in the `SubmissionMenu` class.

  This is what gets called if the player presses an attack option.

  ```ts
  menuSubmit(action: Action, instanceId: number | null = null) {
		this.keyboardMenu?.end();

		this.onComplete({
			action,
			target: action.targetType === 'friendly' ? this.caster : this.enemy,
		});
	}
  ```

  The `end()` method on the `KeyboardMenu` class removes the menu from the DOM and unbinds the keyboard listeners.

  Then, we call the `onComplete()` method to actually run the action.
</details>

### Day 15

- [x] Item System

<details>
  <summary>Item System</summary></br>

  Now, we're going to add actual items that the player or enemy can use. Luckily for us, these are just actions. So let's go add a few.

  ```ts
  item_recoverStatus: {
		name: 'Heating Lamp',
		description: 'Feeling fresh and warm',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{CASTER} used a {ACTION}!' },
				],
			},
			{ type: 'stateChange', status: null },
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{TARGET} is feeling' },
					{ speed: SPEEDS.Fast, string: 'fresh!', classes: ['blue'] },
				],
			},
		],
	},
	item_recoverHp: {
		name: 'Parmesan',
		description: 'Recover some HP',
		targetType: 'friendly',
		success: [
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{CASTER} sprinkled some {ACTION}!' },
				],
			},
			{ type: 'stateChange', recover: 10 },
			{
				type: 'message',
				textLines: [
					{ speed: SPEEDS.Fast, string: '{TARGET} recovered' },
					{ speed: SPEEDS.Fast, string: '10 HP!', classes: ['green'] },
				],
			},
		],
	},
  ```

  Here, we add two items. One that recovers status and one that recovers HP.

  We need to have a reference to the available items in the battle, so let's go add a `items` property to the `Battle` class.

  ```ts
  this.items = [
    { actionId: 'item_recoverStatus', instanceId: 'p1', team: 'player' },
    { actionId: 'item_recoverStatus', instanceId: 'p2', team: 'player' },
    { actionId: 'item_recoverStatus', instanceId: 'p3', team: 'enemy' },
    { actionId: 'item_recoverHp', instanceId: 'p4', team: 'player' },
  ];
  ```

  Notice that each item has a unique `instanceId` so we can remove it once it's used.

  Now, let's pass it into our `SubmissionMenu` class.

  First, we pass it into the `submissionMenu()` method in `BattleEvent`.

  ```ts
  submissionMenu(resolve: SubmissionResolve) {
		if (!this.event.caster || !this.event.enemy) return resolve();

		const menu = new SubmissionMenu({
			caster: this.event.caster,
			enemy: this.event.enemy,
			items: this.battle.items,
			onComplete: submission => {
				// submission { what move to use, who to use it on }
				resolve(submission);
			},
		});

		menu.init(this.battle.element);
	}
  ```

  Now, in our constructor in `SubmissionMenu`, we are going to map each item. We do this so that we can add a quantity for multiple items.

  ```ts
  constructor({ caster, enemy, onComplete, items }: SubmissionMenuConfig) {
		this.caster = caster;
		this.enemy = enemy;
		this.onComplete = onComplete;

		const quantityMap: QuantityMap = {};

		items.forEach(item => {
			if (item.team !== caster.team) return;

			const existing = quantityMap[item.actionId];

			if (existing) {
				existing.quantity += 1;
			} else {
				quantityMap[item.actionId] = {
					actionId: item.actionId,
					instanceId: item.instanceId,
					quantity: 1,
				};
			}
		}, {});

		this.items = Object.values(quantityMap);
	}
  ```

  Now, we'll dynamically add the items to the Items page in the `getPages()` method.

  ```ts
  items: [
    ...this.items.map(item => {
      const action = window.Actions[item.actionId];

      return {
        label: action.name,
        description: action.description,
        handler: () => {
          this.menuSubmit(action, item.instanceId);
        },
        right: () => {
          return `x${item.quantity}`;
        },
      };
    }),
    backOption,
  ],
  ```

  We use our `right()` method to show the quantity of each item.

  Now in our `menuSubmit()` method, we need to actually pass the `instanceId` to the `onComplete()` method.

  ```ts
  menuSubmit(action: Action, instanceId?: string) {
		this.keyboardMenu?.end();

		this.onComplete({
			action,
			target: action.targetType === 'friendly' ? this.caster : this.enemy,
			instanceId,
		});
	}
  ```

  Finally, in the `turn()` method of `TurnCycle`, we want to deplete the quantity of the item after we receive our `submission`.

  ```ts
  const submission = await this.onNewEvent({
    type: 'submissionMenu',
    caster,
    enemy,
  });

  // Check for items
  if (submission?.instanceId) {
    this.battle.items = this.battle.items.filter(item => {
      return item.instanceId !== submission.instanceId;
    });
  }
  ```

  Notice that we can use the filter method here, because we are removing one item at a time. So in the `Battle` class, that item will be removed from the array, and therefore, the mapping in `SubmissionMenu` will be updated.
</details>

### Day 16

- [x] Pizza Lineups

<details>
  <summary>Pizza Lineups</summary></br>

  Now, we are going to finally implement the `Swap` action. This will allow us to switch out to other Pizzas in our lineup.

  First, let's add the action in the `turn()` method of `TurnCycle`.

  ```ts
  async turn() {
    // ... other code

    const submission = await this.onNewEvent({
      type: 'submissionMenu',
      caster,
      enemy,
    });

		// Stop here if we are replacing this Pizza
		if (submission && 'replacement' in submission) {
			await this.onNewEvent({
				type: 'replace',
				replacement: submission.replacement,
			});

			await this.onNewEvent({
				type: 'message',
				textLines: [
					{
						speed: SPEEDS.Normal,
						string: `Go get 'em, ${submission?.replacement?.name}!`,
					},
				],
			});

			// Change the current team and go to the next turn
			this.nextTurn();
			return;
		}

    // ... other code
  }
  ```

  Here, after we receive the submission, we check if the `replacement` property is in the submission. If it is, we send a `replace` event and pass the chosen replacement which will be a `Combatant`, and then a `message` event. 
  
  Then, we change the current team and go to the next turn.

  But to actually be able to send this `replacement` property, we need to add it to the `SubmissionMenu` class.

  ```ts
  constructor({ caster, enemy, replacements, onComplete, items }) {
    this.replacements = replacements;
    // ... other code
  }
  ```

  After adding it to the constructor, we need to pass it into the `submissionMenu()` method in `BattleEvent`.

  ```ts
  submissionMenu(resolve: SubmissionResolve) {
		const { caster, enemy } = this.event;
		const { items, combatants } = this.battle;
		const possibleCombatants = Object.values(combatants) as Combatant[];

		if (!caster || !enemy) return resolve();

		const menu = new SubmissionMenu({
			caster,
			enemy,
			items,
			replacements: possibleCombatants.filter(c => {
				const sameTeam = c.team === caster.team;
				const notCaster = c.id !== caster.id;
				const alive = c.hp > 0;

				return sameTeam && notCaster && alive;
			}),
			onComplete: submission => {
				resolve(submission as Submission);
			},
		});

		menu.init(this.battle.element);
	}
  ```

  Here, we filter the `combatants` from the `Battle` class to only include the ones that are on the same team as the `caster`, are not the `caster`, and are alive.

  Now, in our `getPages()` method in `SubmissionMenu`, we need to dynamically add the `replacements`.

  ```ts
  replacements: [
    ...this.replacements.map(replacement => {
      return {
        label: replacement.name,
        description: replacement.description,
        handler: () => {
          this.menuSubmitReplacement(replacement);
        },
        right: () => {
          const iconImg = document.createElement('img');

          iconImg.src = replacement.icon;
          iconImg.alt = replacement.type;

          return iconImg.outerHTML;
        },
      };
    }),
    backOption,
  ],
  ```

  Nothing we haven't seen before here, except for the `menuSubmitReplacement()` method. Let's look at that now.

  ```ts
  menuSubmitReplacement(replacement: Combatant) {
		this.keyboardMenu?.end();
		this.onComplete({ replacement });
	}
  ```

  Very similar to the `menuSubmit()` method, except we are passing the `replacement` property only which will be a `Combatant`.

  Now, we need to add the `replace` event to the `BattleEvent` class.

  ```ts
  async replace(resolve: VoidResolve) {
		const { replacement } = this.event;
		const prevCombatantId = this.battle.activeCombatants[replacement?.team];
		const prevCombatant = this.battle.combatants[prevCombatantId];

		// Clear out the old combatant and update the DOM
		this.battle.activeCombatants[replacement?.team] = null;
		prevCombatant?.update();

		// Wait a little bit so the player can see it
		await wait(400);

		// Add the new combatant and update the DOM
		this.battle.activeCombatants[replacement?.team] = replacement?.id;
		replacement?.update();

		// Wait a little bit so the player can see it, then resolve
		await wait(400);
		resolve();
	}
  ```

  All we do here is change the `activeCombatants` property of the `Battle` class to the new `replacement` and then update the DOM. Then, we wait a little bit and resolve.

  Okay, now, we want to actually handle the situation in which a Pizza faints and we need to replace it. Let's start in the `turn()` method of `TurnCycle`.

  We need to do/check three things here.

  1. Did the target faint?
  2. Do we have a winning team?
  3. If not, send out the next Pizza

  Also, **_make sure to do this right after `resultingEvents` but before `postEvents`_**.

  As this will be when the attack has just finished landing.

  ```ts
  const targetDead = submission && submission.target.hp <= 0;

  if (targetDead) {
    await this.onNewEvent({
      type: 'message',
      textLines: [
        { speed: SPEEDS.Normal, string: `${submission.target.name} has` },
        { speed: SPEEDS.Fast, string: 'fainted!', classes: ['red'] },
      ],
    });
  }
  ```

  Pretty simple so far. We check if the `target` has fainted and if it has, we send a `message` event.

  Now, we need to check if the team has won. Let's create a method in `TurnCycle` to do this.

  ```ts
  getWinningTeam() {
		const aliveTeams: AliveTeams = {};
		const combatants = Object.values(this.battle.combatants) as Combatant[];

		combatants.forEach(c => {
			if (c.hp > 0) aliveTeams[c.team] = true;
		});

		if (!aliveTeams.player) return 'enemy';
		if (!aliveTeams.enemy) return 'player';

		return null;
	}
  ```

  Here, we add the `team` property of each `Combatant` to the `aliveTeams` object if it is alive. Then, we check if the `player` or `enemy` team is not alive. If it isn't, we return the opposite team. If both are alive, we return `null`.

  Now, let's use this method in the `turn()` method.

  ```ts
  // Do we have a winning team?
  const winner = this.getWinningTeam();

  if (winner) {
    await this.onNewEvent({
      type: 'message',
      textLines: [
        { speed: SPEEDS.Normal, string: 'The battle is' },
        { speed: SPEEDS.Fast, string: 'over!', classes: ['green'] },
      ],
    });

    return;
  }
  ```

  Simple here as well. If we have a winner, we send a `message` event and return meaning end the battle (for now).

  Now, this next code will only execute if we don't have a winner, meaning we have a replacement to send out.

  ```ts
  // If not, bring in a replacement
  if (targetDead) {
    const replacement = (await this.onNewEvent({
      type: 'replacementMenu',
      team: submission.target.team,
    })) as unknown as Combatant;

    await this.onNewEvent({
      type: 'replace',
      replacement,
    });

    await this.onNewEvent({
      type: 'message',
      textLines: [
        {
          speed: SPEEDS.Normal,
          string: `Go get 'em, ${replacement.name}!`,
        },
      ],
    });
  }
  ```

  Here, we create a new `replacementMenu` event and wait for the player to select a `replacement`. Then, we send a `replace` event with the `replacement` and then send a `message` event.

  Now, let's add the `replacementMenu` event to the `BattleEvent` class.

  ```ts
  replacementMenu(resolve: ReplacementResolve) {
		const replacements = Object.values(this.battle.combatants) as Combatant[];

		const menu = new ReplacementMenu({
			replacements: replacements.filter(c => {
				return c.team === this.event.team && c.hp > 0;
			}),
			onComplete: replacement => {
				resolve(replacement as Combatant);
			},
		});

		menu.init(this.battle.element);
	}
  ```

  Very similar to the `submissionMenu()` method. We create a new `ReplacementMenu` and pass it the `replacements` that are on the same `team` as the `target` and are alive. Then, we pass it an `onComplete` callback that will resolve the `replacement` that the player selects.

  Let's create the `ReplacementMenu` class now.

  ```ts
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
  ```

  Very similar to the `SubmissionMenu` class. We have a `replacements` property that is an array of `Combatants` and an `onComplete` callback that will resolve the `replacement` that the player selects.

  We reuse our `KeyboardMenu` class here. We create a new `KeyboardMenu` and set the options of the `KeyboardMenu` to the `replacements` that we have.

  Then, we have the `init()` method. If the first `replacement` is player controlled, we show the menu. Otherwise, we call the `decide()` method.
</details>

### Day 17

- [x] Team UI

<details>
  <summary>Team UI</summary></br>

  Not a lot to do here, we just need to add a `Team` component to the `Battle` component.

  Let's start by creating the `Team` class.

  ```ts
  export class Team {
    team: TeamType;
    name: string;
    combatants: Combatant[];
    element!: HTMLDivElement;

    constructor(team: TeamType, name: string) {
      this.team = team;
      this.name = name;
      this.combatants = [];
    }

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('team');
      this.element.setAttribute('data-team', this.team);

      this.combatants.forEach(c => {
        const icon = document.createElement('div');

        icon.setAttribute('data-combatant', c.id || '');
        icon.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" viewBox="0 -0.5 7 10" shape-rendering="crispEdges">
                      <path stroke="#3a160d" d="M2 0h3M1 1h1M5 1h1M0 2h1M6 2h1M0 3h1M6 3h1M0 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
                      <path stroke="#e2b051" d="M2 1h1M4 1h1M1 2h1M5 2h1M1 4h1M5 4h1M2 5h1M4 5h1" />
                      <path stroke="#ffd986" d="M3 1h1M2 2h3M1 3h5M2 4h3M3 5h1" />
                  
                      <!-- Active indicator appears when needed with CSS -->
                      <path class="active-pizza-indicator" stroke="#3a160d" d="M3 8h1M2 9h3" />
                  
                      <!-- Dead paths appear when needed with CSS -->
                      <path class="dead-pizza" stroke="#3a160d" d="M2 0h3M1 1h1M5 1h1M0 2h1M2 2h1M4 2h1M6 2h1M0 3h1M3 3h1M6 3h1M0 4h1M2 4h1M4 4h1M6 4h1M1 5h1M5 5h1M2 6h3" />
                      <path class="dead-pizza" stroke="#9b917f" d="M2 1h3M1 2h1M5 2h1" />
                      <path class="dead-pizza" stroke="#c4bdae" d="M3 2h1M1 3h2M4 3h2M1 4h1M3 4h1M5 4h1M2 5h3" />
                  </svg> 
              `;

        this.element?.appendChild(icon);
      });
    }

    update() {
      this.combatants.forEach(c => {
        const icon = getElement(`[data-combatant="${c.id}"]`, this.element);

        icon?.setAttribute('data-dead', `${c.hp <= 0}`);
        icon?.setAttribute('data-active', `${c.isActive}`);
      });
    }

    init(container: HTMLDivElement) {
      this.createElement();
      this.update();
      container.appendChild(this.element);
    }
  }
  ```

  Very simple stuff here, we have a `team` property that is either `player` or `enemy`, a `name` property that is the name of the NPC, and an array of `combatants` that are on the team.

  We create some UI for the team and update the data attributes for when a `combatant` is dead or currently active.

  Let's add the `Team`s to the `init()` method of the `Battle` class.

  ```ts
  init(container: HTMLDivElement) {
		this.createElement();
		container.appendChild(this.element as HTMLDivElement);

		// Team Icons
		this.playerTeam = new Team('player', 'hero');
		this.enemyTeam = new Team('enemy', 'Bully');

		Object.keys(this.combatants).forEach(key => {
			const combatant = this.combatants[key];

			combatant.id = key;
			combatant.init(this.element);

			// Add to team
			if (combatant.team === 'player') {
				this.playerTeam.combatants.push(combatant);
			} else if (combatant.team === 'enemy') {
				this.enemyTeam.combatants.push(combatant);
			}
		});

		// Initialize Team Elements
		this.playerTeam.init(this.element);
		this.enemyTeam.init(this.element);

		// ... rest of the code
	}
  ```

  Here, we just create the two teams and add each `combatant` in the battle to the appropriate team.

  Then, we initialize the team elements.

  Now we need to just make sure we call the `update()` method of the `Team`s whenever it's possible for a `combatant` to die or become active.

  This is in two events: `stateChange` and `replace` in `BattleEvent`.

  ```ts
  async stateChange(resolve: VoidResolve) {
		// ... rest of the code

		// Wait a little bit, update teams, then stop blinking the Pizza
		await wait(600);

    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

		target?.pizzaElement.classList.remove('blinking');

		resolve();
	}
  ```

  ```ts
  async replace(resolve: VoidResolve) {
		// ... rest of the code

		// Wait a little bit so the player can see it, then resolve
		await wait(400);

    this.battle.playerTeam.update();
    this.battle.enemyTeam.update();

		resolve();
	}
  ```

  And that's it! We now have a UI for the teams.
</details>

### Day 18

- [x] Giving XP to Pizzas
- [x] Dynamic Enemies and Player State
- [x] Ending the Battle 


<details>
  <summary>Giving XP to Pizzas</summary></br>

  We are going to use a new `BattleEvent` called `giveXp` to give XP to the pizzas.

  Let's first call it in the `turn()` method of `TurnCycle`.

  ```ts
  if (targetDead) {
    await this.onNewEvent({
      type: 'message',
      textLines: [
        { speed: SPEEDS.Normal, string: `${submission.target.name} has` },
        { speed: SPEEDS.Fast, string: 'fainted!', classes: ['red'] },
      ],
    });

    if (submission.target.team === 'enemy') {
      const playerActiveId = this.battle.activeCombatants.player;
      const activePizza = this.battle.combatants[playerActiveId];
      const xp = submission.target.givesXp;

      await this.onNewEvent({
        type: 'message',
        textLines: [
          { speed: SPEEDS.Normal, string: `${activePizza.name} gained` },
          { speed: SPEEDS.Fast, string: `${xp} XP!`, classes: ['green'] },
        ],
      });

      await this.onNewEvent({
        type: 'giveXp',
        xp,
        combatant: activePizza,
      });
    }
  }
  ```

  Here, if the player was the one that attacked, we give their active pizza the XP.

  Notice we are using a getter method on the `Combatant` called `givesXp`. This is just a simple getter that returns the XP the pizza gives when defeated.

  ```ts
  get givesXp() {
		return this.level * 20;
	}
  ```

  Now, let's add the `giveXp` event to the `BattleEvent` class.

  ```ts
  giveXp(resolve: VoidResolve) {
		let amount = this.event.xp;
		const { combatant } = this.event;

		const step = () => {
			if (!amount || !combatant) return resolve();

			if (amount > 0) {
				amount -= 1;
				combatant.xp += 1;

				// Check if we leveled up
				if (combatant.xp === combatant.maxXp) {
					combatant.xp = 0;
					combatant.maxXp = 100;
					combatant.level += 1;
				}

				combatant.update();
				requestAnimationFrame(step);
				return;
			}

			resolve();
		};

		requestAnimationFrame(step);
	}
  ```

  Here, notice the difference in approach. We use `requestAnimationFrame` to animate the XP gain. This is because we want complete control on when the Pizza hits the level up point.

  With this, we can now level up our pizzas!
</details>

<details>
  <summary>Dynamic Enemies and Player State</summary></br>

  Now, let's work on adding dynamic enemies and a player state to the battle. Currently, our battle is very static. Also, nothing persists after the battle is over.

  Let's create a class called `PlayerState` that will hold the player's state.

  ```ts
  export class PlayerState {
    pizzas: { [key: string]: Partial<CombatantConfig> };
    lineup: string[];
    items: Item[];

    constructor() {
      this.pizzas = {
        p1: {
          pizzaId: 's001',
          hp: 30,
          maxHp: 50,
          xp: 90,
          maxXp: 100,
          level: 1,
          status: { type: 'saucy', expiresIn: 1 },
        },
        p2: {
          pizzaId: 'v001',
          hp: 50,
          maxHp: 50,
          xp: 75,
          maxXp: 100,
          level: 1,
          status: null,
        },
      };

      this.lineup = ['p1', 'p2'];
      this.items = [
        { actionId: 'item_recoverHp', instanceId: 'item1' },
        { actionId: 'item_recoverHp', instanceId: 'item2' },
        { actionId: 'item_recoverHp', instanceId: 'item3' },
      ];
    }
  }
  ```

  Here, we store the player's pizzas, lineup order, and items.

  Now, let's define our enemies on the `window` object.

  ```ts
  window.Enemies = {
    erio: {
      name: 'Erio',
      src: '../assets/images/characters/people/erio.png',
      pizzas: {
        a: {
          pizzaId: 's001',
          maxHp: 50,
          level: 1,
        },
        b: {
          pizzaId: 's002',
          maxHp: 50,
          level: 1,
        },
      },
    },
    beth: {
      name: 'Beth',
      src: '../assets/images/characters/people/npc1.png',
      pizzas: {
        a: {
          pizzaId: 's001',
          hp: 1,
          maxHp: 50,
          level: 1,
        },
      },
    },
  };

  window.playerState = new PlayerState();
  ```

  Here, we define the `Battle` enemies. We also instantiate the `PlayerState` class and store it on the `window` object.

  Now, in our `battle` OverworldEvent, we can specify the enemy we want to battle.

  ```ts
  { type: 'battle', enemyId: 'beth' }
  ```

  Let's handle this in the `battle()` method of `OverworldEvent`.

  ```ts
  battle(resolve: () => void) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			const battle = new Battle({
        enemy: window.Enemies[this.event.enemyId as string],
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

  We now pass the entire enemy object we configured to the `Battle` class.

  Let's handle this in the `Battle` class.

  ```ts
  constructor({ enemy, onComplete }: BattleConfig) {
		this.enemy = enemy;
		this.onComplete = onComplete;

		this.activeCombatants = {
			player: null,
			enemy: null,
		};

		window.playerState.lineup.forEach((id: string) => {
			this.addCombatant(id, 'player', window.playerState.pizzas[id]);
		});

		Object.keys(this.enemy.pizzas).forEach((key: string) => {
			this.addCombatant(`e_${key}`, 'enemy', this.enemy.pizzas[key]);
		});

		window.playerState.items.forEach((item: Item) => {
			this.items.push({
				...item,
				team: 'player',
			});
		});

		this.usedInstanceIds = {};
	}
  ```

  Lots of changes here. First, we don't define the IDs for our `activeCombatants` immediately, as they will now depend. Then, we take the lineup from the `PlayerState` and add the pizzas to the battle. We also add the enemy pizzas. We also add the items from the `PlayerState` to the battle.

  Let's look at the `addCombatant()` method.

  ```ts
  addCombatant(id: string, team: TeamType, config: EnemyPizza) {
		this.combatants[id] = new Combatant(
			{
				...window.Pizzas[config.pizzaId as string],
				...config,
				team,
				isPlayerControlled: team === 'player',
			},
			this
		);

		// Populate first active combatant
		this.activeCombatants[team] = this.activeCombatants[team] || id;
	}
  ```

  Pretty simple here, we spread all the configuration objects and create a new `Combatant` instance. We also set the first active combatant for each team.

  For the new enemy sprite to actually appear in the battle, make sure to set it based on the enemy's `src` property in the `createElement()` method of `Battle`.

  ```ts
  createElement() {
		this.element = document.createElement('div');
		this.element.classList.add('battle');

		const heroSrc = getSrc('../assets/images/characters/people/hero.png');
		const enemySrc = getSrc(this.enemy.src);

		// ... rest of code
	}
  ```
</details>

<details>
  <summary>Ending the Battle</summary></br>

  Now, let's actually end the battle when we have a winner. We are going to do so with a callback function called `onWinner`. Let's call it in the `turn()` method of `TurnCycle`.

  ```ts
  // Do we have a winning team?
  const winner = this.getWinningTeam();

  if (winner) {
    await this.onNewEvent({
      type: 'message',
      textLines: [
        { speed: SPEEDS.Normal, string: 'The battle is' },
        { speed: SPEEDS.Fast, string: 'over!', classes: ['green'] },
      ],
    });

    this.onWinner(winner);
    return;
  }
  ```

  Now, let's actually pass it into the `TurnCycle` class when we create it in the `init()` method of the `Battle` class.

  ```ts
  init(container: HTMLDivElement) {
		// ... rest of code

		this.turnCycle = new TurnCycle({
			battle: this,
			onNewEvent: (event: BattleEventType) => {
				return new Promise<void | SubmissionReturn>(resolve => {
					const battleEvent = new BattleEvent(event, this);
					battleEvent.init(resolve);
				});
			},
			onWinner: winner => {
				if (winner === 'player') {
					const playerState = window.playerState;

					// Update player state
					Object.keys(playerState.pizzas).forEach(id => {
						const playerPizza = playerState.pizzas[id];
						const combatant = this.combatants[id];

						if (combatant) {
							playerPizza.hp = combatant.hp;
							playerPizza.xp = combatant.xp;
							playerPizza.maxXp = combatant.maxXp;
							playerPizza.level = combatant.level;
						}
					});

					// Get rid of items player used
					playerState.items = playerState.items.filter((item: Item) => {
						return !this.usedInstanceIds[item.instanceId];
					});
				}

				this.element.remove();
				this.onComplete();
			},
		});

		this.turnCycle.init();
	}
  ```

  Here, if the winner is the player, we update the `PlayerState` with the new stats of the pizzas. We also remove the items that were used in the battle. Then, we remove the battle UI from the screen and call `onComplete` to resume the overworld.

  Notice we use a property called `usedInstanceIds` to keep track of which items were used in the battle. Let's add that to the `Battle` class.

  ```ts
  this.usedInstanceIds = {};
  ```

  Now, we can add to it in the `turn()` method of `TurnCycle` when we check for item usage.

  ```ts
  // Check for items
  if (submission?.instanceId) {
    // Add to list to persist to player state later
    this.battle.usedInstanceIds[submission.instanceId] = true;

    // Remove item from battle state
    this.battle.items = this.battle.items.filter(item => {
      return item.instanceId !== submission.instanceId;
    });
  }
  ```
</details>

### Day 19

- [x] Overworld HUD

<details>
  <summary>Overworld HUD</summary></br>

  Okay, let's quickly add a HUD to the Overworld. Luckily, we are going to reuse our HUD element from the `Combatant` class so it's pretty easy.

  First, let's create a new HUD right when our game launches in the `init()` method of `Overworld`.

  ```ts
  init() {
    this.hud = new Hud();
    this.hud.init(getElement('.game'));

		this.startMap(window.OverworldMaps.DemoRoom);

    // ... rest of code
	}
  ```

  Now, let's create the `Hud` class.

  ```ts
  export class Hud {
    scoreboards: Combatant[] = [];
    element!: HTMLDivElement;

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('hud');

      const { playerState, Pizzas } = window;

      playerState.lineup.forEach((key: string) => {
        const pizza = playerState.pizzas[key];
        const scoreboard = new Combatant(
          {
            id: key,
            ...Pizzas[pizza.pizzaId],
            ...pizza,
          },
          null
        );

        scoreboard.createElement();
        this.scoreboards.push(scoreboard);
        this.element.appendChild(scoreboard.hudElement);
      });
    }

    update() {
      this.scoreboards.forEach(scoreboard => {
        scoreboard.update(window.playerState.pizzas[scoreboard.id]);
      });
    }

    init(container: HTMLDivElement) {
      this.createElement();
      this.update();
      container.appendChild(this.element);

      // Listen for update signals
      document.addEventListener('PlayerStateUpdated', () => {
        this.update();
      });
    }
  }
  ```

  Very simple class here. We don't even need a constructor. We just create `Combatant` instances for each pizza in the player's lineup and append their HUD elements. We also listen for `PlayerStateUpdated` events to update the HUD when the player's state changes.

  By doing this, if a Pizza gets hurt in battle, the HUD will update to reflect that.

  Now, let's quickly fire this event when we change the player's state. Right now, we only do this after a battle in the `onWinner` callback.

  ```ts
  onWinner: winner => {
    if (winner === 'player') {
      // ... rest of code

      // Fire signal for Overworld HUD
      emitEvent('PlayerStateUpdated', {});
    }

    this.element.remove();
    this.onComplete();
  },
  ```

  And that's it! Now, we have a HUD in the Overworld that updates when the player's state changes.
</details>

### Day 20

- [x] Pause Menu

<details>
  <summary>Pause Menu</summary></br>

  Today, we built a pause menu for the player to use in the Overworld. Let's start by creating a new class called `PauseMenu`.

  ```ts
  export class PauseMenu {
    onComplete: () => void;

    element!: HTMLDivElement;
    keyboardMenu: KeyboardMenu | null = null;
    esc: KeyPressListener | null = null;

    constructor({ onComplete }: { onComplete: () => void }) {
      this.onComplete = onComplete;
    }

    getOptions(pageKey: string) {
      const { playerState, Pizzas } = window;

      // Case 1: Show options for the root page
      if (pageKey === 'root') {
        return [
          {
            label: 'Pizzas',
            description: 'Manage your pizzas',
            handler: () => {
              this.keyboardMenu?.setOptions(this.getOptions('pizzas'));
            },
            right: () => '🍕',
          },
          {
            label: 'Save',
            description: 'Save your progress',
            handler: () => {
              // We'll come back to this
            },
            right: () => '💾',
          },
          {
            label: 'Close',
            description: 'Close the pause menu',
            handler: () => this.close(),
            right: () => '❎',
          },
        ];
      }

      // Case 2: Show options for the Pizza page
      if (pageKey === 'pizzas') {
        const lineupPizzas = playerState.lineup.map((id: string) => {
          const { pizzaId } = playerState.pizzas[id];
          const base = Pizzas[pizzaId];

          return {
            label: base.name,
            description: base.description,
            handler: () => {
              this.keyboardMenu?.setOptions(this.getOptions(id));
            },
            right: () => {
              return `<img src='${base.icon}' alt='${base.name}' />`;
            },
          };
        });

        return [
          ...lineupPizzas,
          {
            label: 'Back',
            description: 'Go back to the previous menu',
            handler: () => {
              this.keyboardMenu?.setOptions(this.getOptions('root'));
            },
            right: () => '🔙',
          },
        ];
      }

      // Case 3: Show options for one Pizza (specific ID)
      const inactiveIds = Object.keys(playerState.pizzas).filter((id: string) => {
        return !playerState.lineup.includes(id);
      });

      const inactivePizzas = inactiveIds.map((id: string) => {
        const { pizzaId } = playerState.pizzas[id];
        const base = Pizzas[pizzaId];

        return {
          label: `Swap for ${base.name}`,
          description: base.description,
          handler: () => {
            playerState.swapLineup(pageKey, id);
            this.keyboardMenu?.setOptions(this.getOptions('root'));
          },
          right: () => {
            return `<img src='${base.icon}' alt='${base.name}' />`;
          },
        };
      });

      return [
        ...inactivePizzas,
        {
          label: 'Move to front',
          description: 'Move this pizza to the front of the line',
          handler: () => {
            playerState.moveToFront(pageKey);
            this.keyboardMenu?.setOptions(this.getOptions('root'));
          },
          right: () => '🔼',
        },
        {
          label: 'Back',
          description: 'Go back to the previous menu',
          handler: () => {
            this.keyboardMenu?.setOptions(this.getOptions('root'));
          },
          right: () => '🔙',
        },
      ];
    }

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('pause-menu');

      this.element.innerHTML = `
              <h2>Pause Menu</h2>
          `;
    }

    close() {
      this.esc?.unbind();
      this.keyboardMenu?.end();
      this.element.remove();
      this.onComplete();
    }

    async init(container: HTMLDivElement) {
      this.createElement();

      this.keyboardMenu = new KeyboardMenu({
        descriptionContainer: container,
      });
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions('root'));

      container.appendChild(this.element);

      // Close Pause Menu on Escape
      wait(200);
      this.esc = new KeyPressListener('Escape', () => {
        this.close();
      });
    }
  }
  ```

  A little bit of a long class, but the logic is very simple. We have a `getOptions` method that returns an array of options for the `KeyboardMenu` to display. We have three cases:

  1. The root page, which shows the main menu options
  2. The pizzas page, which shows the player's lineup
  3. A specific pizza page, which shows options for that pizza

  We gather our Pizzas dynamically from `playerState` and our Pizzadex. We also create two methods in `playerState` to help us manage the lineup: `swapLineup` and `moveToFront`. We'll come back to these later.

  We also have a `close` method that removes the menu from the DOM and calls the `onComplete` callback, which will 'unpause' the game.

  Notice we also have a `KeyPressListener` that listens for the Escape key. This will close the menu when the player presses Escape. But we also wait 200ms before we add this listener. This is because we don't want the Escape key to close the menu immediately after it opens (since Escape is also used to open the menu).

  But how do we actually pause the game? Let's go to the `Overworld` class and add a `pause` OverworldEvent whenever the player presses Escape.

  We'll do this in the `bindActionInput()` method from a while back, the one that listens for the player to press the Enter key to talk to NPCs.

  ```ts
  bindActionInput() {
		new KeyPressListener('Enter', () => {
			// Is there a person here to talk to?
			this.map.checkForActionCutscene();
		});

		new KeyPressListener('Escape', () => {
			if (!this.map.isCutscenePlaying) {
				this.map.startCutscene([{ type: 'pause' }]);
			}
		});
	}
  ```

  Notice that this is a global cutscene. Now, how do we actually stop the game loop from running? We can add a flag in the game loop that checks if the game is paused. If so, it won't keep running `requestAnimationFrame`.

  ```ts
  startGameLoop() {
		const targetFPS = 60;
		const targetDeltaTime = 1000 / targetFPS;
		let lastFrameTime = performance.now();
		let accumulator = 0;

		const step = (currentFrameTime: number) => {
			// ... rest of the game loop

      if (!this.map.isPaused) {
          this.currentAnimationFrame = requestAnimationFrame(step);
      }
		};

		this.currentAnimationFrame = requestAnimationFrame(step);
	}
  ```

  Now, we'll add this flag to the `OverworldMap` class.

  ```ts
  this.isPaused = false;
  ```

  From here, we can actually create the new `pause` event in `OverworldEvent`.

  ```ts
  pause(resolve: () => void) {
		this.map.isPaused = true;

		const menu = new PauseMenu({
			onComplete: () => {
				resolve();
				this.map.isPaused = false;
				this.map.overworld?.startGameLoop();
			},
		});

		menu.init(getElement<HTMLDivElement>('.game'));
	}
  ```

  Nothing crazy here. We set `isPaused` to true to stop the game loop, and create a new `PauseMenu` so that it shows up on screen. The `onComplete` function we pass will resolve the event, unpause the game, and restart the game loop.

  Now, let's look at the two methods we added to `PlayerState` to help us manage the lineup.

  ```ts
	swapLineup(oldId: string, incomingId: string) {
		const oldIndex = this.lineup.indexOf(oldId);
		this.lineup[oldIndex] = incomingId;

		emitEvent('LineupChanged', {});
	}

	moveToFront(incomingId: string) {
		this.lineup = this.lineup.filter(id => id !== incomingId);
		this.lineup.unshift(incomingId);

		emitEvent('LineupChanged', {});
	}
  ```

  Very simple methods here. `swapLineup` takes the ID of the pizza we want to swap out, and the ID of the pizza we want to swap in. It finds the index of the pizza we want to swap out, and replaces it with the pizza we want to swap in.

  `moveToFront` takes the ID of the pizza we want to move to the front of the lineup. It removes that pizza from the lineup, and adds it to the front, so that the length of the lineup stays the same.

  In either case, we fire a `LineupChanged` event so that the Overworld HUD can update the lineup. Let's look at that now.

  ```ts
  init(container: HTMLDivElement) {
		this.createElement();
		this.update();
		container.appendChild(this.element);

		// Listen for update signals
		document.addEventListener('PlayerStateUpdated', () => {
			this.update();
		});

		document.addEventListener('LineupChanged', () => {
			this.createElement();
      this.update();
			container.appendChild(this.element);
		});
	}
  ```

  When the lineup changes, we recreate the Overworld HUD and update it. Let's look at the `update` method. But by doing this, we need to handle any existing HUD elements.

  But this is easy. We just add the following lines to the start of the `createElement` method.

  ```ts
  createElement() {
		this.element?.remove();
		this.scoreboards = [];

    // ... rest of the method
	}
  ```
</details>

### Day 21

- [x] Story Flags

<details>
  <summary>Story Flags</summary></br>

  Remember way back when we talked about Story Flags? Time to implement them.

  First, let's add a `storyFlags` property to `PlayerState`.

  ```ts
  this.storyFlags = {};
  ```

  Now, remember our `talking` property in our map configurations and its complicated structure? Time to put it to use. I can do something like the following:

  ```ts
  talking: [
    {
      required: ['DEFEATED_BETH'],
      events: [
        {
          type: 'message',
          textLines: [
            { speed: SPEEDS.Fast, string: "What do you want now? I'm busy!" },
          ],
          faceHero: 'npcA',
        },
      ],
    },
    {
      events: [
        {
          type: 'message',
          textLines: [
            { speed: SPEEDS.Normal, string: "I'm going to crush you!" },
          ],
          faceHero: 'npcA',
        },
        { type: 'battle', enemyId: 'beth' },
        { type: 'addStoryFlag', flag: 'DEFEATED_BETH' },
        {
          type: 'message',
          textLines: [
            { speed: SPEEDS.Fast, string: 'You crushed me like weak pepper.' },
          ],
        },
      ],
    },
  ]
  ```

  Notice that we add an optional array of strings called `required`. This is an array of story flags that must be present in order for this `talking` configuration to be used. If the required flags are not set, this scenario will be skipped.

  Let's actually implement this. We need to configure our `checkForActionCutscene` method in `OverworldMap` to check for story flags.

  ```ts
  checkForActionCutscene() {
		const hero = this.gameObjects.hero;
		const nextCoords = nextPosition(hero.x, hero.y, hero.direction);
		const match = Object.values(this.gameObjects).find(obj => {
			return `${obj.x},${obj.y}` === `${nextCoords.x},${nextCoords.y}`;
		});

		if (!this.isCutscenePlaying && match && match.talking.length) {
			const relevantScenario = match.talking.find(scenario => {
				return (scenario.required || []).every(sFlag => {
					return window.playerState.storyFlags[sFlag];
				});
			});

			relevantScenario && this.startCutscene(relevantScenario.events);
		}
	}
  ```

  Now, it will loop through the `talking` array and find the first scenario that has all of its required story flags set. If it finds one, it will start the cutscene.

  But now, we need to actually add the story flag when we defeat Beth. We'll do it using a new OverworldEvent called `addStoryFlag`. Let's create the method in `OverworldEvent`.

  ```ts
  addStoryFlag(resolve: () => void) {
		window.playerState.storyFlags[this.event.flag] = true;
		resolve();
	}
  ```

  Extremely simple method. We add the story flag to the player state, and resolve the event.

  Now, there's one more issue. What about conditional story flags? For example, if we don't defeat Beth, we don't want to add the `DEFEATED_BETH` flag or execute any events that happen after the battle period.

  Let's modify `OverworldEvent` and `Battle` to actually return a value when they resolve.

  First, we'll do `Battle`.

  ```ts
  onWinner: winner => {
    if (winner === 'player') {
      // ... rest of the method
    }

    this.element.remove();
    this.onComplete(winner === 'player');
  },
  ```

  Now, we pass a boolean to `onComplete` that indicates whether the player won or not.

  Let's absorb that in `OverworldEvent`.

  ```ts
  battle(resolve: BattleResolve<'WON_BATTLE' | 'LOST_BATTLE'>) {
		const sceneTransition = new SceneTransition();

		sceneTransition.init(getElement<HTMLDivElement>('.game'), () => {
			const battle = new Battle({
				enemy: window.Enemies[this.event.enemyId as string],
				onComplete: didWin => {
					resolve(didWin ? 'WON_BATTLE' : 'LOST_BATTLE');
				},
			});

			battle.init(getElement<HTMLDivElement>('.game'));

			// After battle is over
			sceneTransition.fadeOut();
		});
	}
  ```

  Now, if the player won, we resolve the event with a `Promise<string>` that resolves to `'WON_BATTLE'`. If the player lost, we resolve with `'LOST_BATTLE'`.

  Let's capture this in our looping of OverworldEvents. This happens in `OverworldMap` in the `startCutscene` method.

  ```ts
  async startCutscene(events: BehaviorLoopEvent[]) {
		this.isCutscenePlaying = true;

		// Start a loop of async events, awaiting each one
		for (const event of events) {
			const eventHandler = new OverworldEvent({
				event,
				map: this,
			});

			const result = await eventHandler.init();

      if (result === 'LOST_BATTLE') break;
		}

		this.isCutscenePlaying = false;

		// Reset NPCs to do their idle behavior
		Object.values(this.gameObjects).forEach(gameObject => {
			gameObject.doBehaviorEvent(this);
		});
	}
  ```

  Now, if we lose the battle, we break out of the loop and stop any further events from happening.

  And that's it! We can now have conditional story flags and conditional events based on those flags.
</details>

### Day 22

- [x] Pizza Stone

<details>
  <summary>Pizza Stone</summary></br>

  Now, let's add a Pizza Stone to our game. This will be an interactable `GameObject` that will allow us to make pizzas.

  First, let's create a new `PizzaStone` class that extends `GameObject`.

  ```ts
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

      this.storyFlag = config.storyFlag;
      this.pizzas = config.pizzas;

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
  ```

  Let's break it down. Like any subclass, we call `super` with the config. We create a `Sprite` for the stone, and set its animations. The animation will be `'used-down'` if the player has already used the stone, and `'unused-down'` if they haven't, which is updated in the `update` method (remember that `update` is called every frame).

  From there, we have a `storyFlag` that we pass in that will determine whether the player has already used the stone. We also have a `pizzas` array that we pass in that will determine what pizzas the player can make.

  By doing this, different pizza stones can craft different pizzas. For example, we can have a pizza stone in the forest that can only craft the `Forest Pizza`, and a pizza stone in the desert that can only craft the `Desert Pizza`.

  Finally, we have a `talking` array that will determine what happens when the player interacts with the stone. If the story flag is already present, the stone won't be interactable. If it isn't, the player will be able to interact with it, i.e. craft a new pizza.

  We can add the `PizzaStone` to our map like so:

  ```ts
  		gameObjects: {
			hero: new Person({
				// ...
			}),
			npcA: new Person({
				// ...
			}),
			npcB: new Person({
				// ...
			}),
			pizzaStone: new PizzaStone({
				x: withGrid(2),
				y: withGrid(7),
				storyFlag: 'USED_PIZZA_STONE',
				pizzas: ['v001', 'f001'],
			}),
		},
  ```

  Notice that the strings in the `pizzas` array are the IDs of the pizzas in the Pizzadex.

  Now, let's actually create the new `craftingMenu` event in `OverworldEvent`.

  ```ts
  craftingMenu(resolve: () => void) {
		const menu = new CraftingMenu({
			pizzas: this.event.pizzas as string[],
			onComplete: () => {
				resolve();
			},
		});

		menu.init(getElement<HTMLDivElement>('.game'));
	}
  ```

  A pattern we've seen many times. We create a new `CraftingMenu` with the pizzas we passed in, and when the player is done, we resolve the event.

  Now, let's add the `CraftingMenu` class.

  ```ts
  export class CraftingMenu {
    pizzas: string[];
    onComplete: () => void;
    element!: HTMLDivElement;
    keyboardMenu: KeyboardMenu | null = null;

    constructor({ pizzas, onComplete }: CraftingMenuConfig) {
      this.pizzas = pizzas;
      this.onComplete = onComplete;
    }

    getOptions() {
      return this.pizzas.map((id: string) => {
        const base = window.Pizzas[id];

        return {
          label: base.name,
          description: base.description,
          handler: () => {
            window.playerState.addPizza(id);
            this.close();
          },
          right: () => {
            return `<img src='${base.icon}' alt='${base.name}' />`;
          },
        };
      });
    }

    createElement() {
      this.element = document.createElement('div');
      this.element.classList.add('overlay-menu');
      this.element.classList.add('crafting-menu');

      this.element.innerHTML = `
              <h2>Create a Pizza</h2>
          `;
    }

    close() {
      this.keyboardMenu?.end();
      this.element.remove();
      this.onComplete();
    }

    init(container: HTMLDivElement) {
      this.createElement();

      this.keyboardMenu = new KeyboardMenu({
        descriptionContainer: container,
      });
      this.keyboardMenu.init(this.element);
      this.keyboardMenu.setOptions(this.getOptions());

      container.appendChild(this.element);
    }
  }
  ```

  Pretty much nothing new here. It's pattern is exactly that of other menus we've created.

  However, the `handler()` method is a bit different. We need to dynamically add a new Pizza to the player's lineup or pizzas. We do this by creating a new method in `PlayerState` called `addPizza`.

  ```ts
  addPizza(pizzaId: string) {
		const newId = `p${Date.now()}` + Math.floor(Math.random() * 99999);

		this.pizzas[newId] = {
			pizzaId,
			hp: 50,
			maxHp: 50,
			xp: 0,
			maxXp: 100,
			level: 1,
			status: null,
		};

		if (this.lineup.length < 3) this.lineup.push(newId);

		emitEvent('LineupChanged', {});
	}
  ```

  Not too complicated here. We create a unique ID for the pizza, and add it to the player's `pizzas` object. We also add it to the player's lineup if there's room.

  Finally, we emit a `LineupChanged` event, which will update the Overworld HUD.

  It's important to point out that the stats for the Pizza are all hard coded. If we are very progressed in the game, we'd need to add a way to dynamically calculate the stats of the pizza based on the player's level (because a level 1 pizza is going to be useless to the player).
</details>

### Day 23

- [x] Saving Story Progress

<details>
  <summary>Saving Story Progress</summary></br>

  We are at the point where we have a lot of features and concepts to create a full-fledged game. However, we are missing one key feature: saving the player's progress. Let's add that now.

  
</details>
/**
 * Defines the engine used to render scenes (aka [[GameScreen]]s).
 * A project that use the zepr.ts framework must define exactly one instance of [[Engine]]
 */

/**
 * 
 */

import { Point, Vector, Rectangle } from './geometry'
import { GameScreen, ClickListener, ZoomListener, DragListener } from './screen';
import { Sprite } from './sprite';
import { ResourcesLoader, LoaderScreen, DefaultLoaderScreen } from './loader';

/**
 * A simple state transition class
 */
class State {
    /** Current state */
    public current: number;
    /** Next state */
    public next: number;
}

/**
 * Defines the engine used to render scenes (aka Screens).
 */
export class Engine {

    /** Default background color used when nothing is specified for a Screen */
    public static readonly DEFAULT_BACKGROUND_COLOR = '#000000';
    /** Zoom ratio used for mouse scroll wheel */
    public static readonly ZOOM_RATIO: number = 1.1;

    /** Main canvas */
    private canvas: HTMLCanvasElement;
    /** Main Canvas rendering context */
    private ctx: CanvasRenderingContext2D;
    /** Canvas used for off-screen rendering (double buffering) */
    private offCanvas: HTMLCanvasElement;
    /** off-screen Canvas rendering context */
    private offCtx: CanvasRenderingContext2D;
    /* Canvas integration : coords */
    private coords: Rectangle;

    /** Current background */
    private background: HTMLImageElement | HTMLCanvasElement;
    /** Alternative background color if no image background is set */
    private backgroundColor: string;

    /** Object cache */
    private cache: Map<string, any>;
    /** Screen cache */
    private screenCache: Map<string, GameScreen>;

    /** Current screen */
    private screen: GameScreen;
    /** Next screen */
    private nextScreen: GameScreen;
    /** Sprites defined in current screen */
    private spriteList: Array<Sprite>;
    /** Check for modification of Sprites list in current frame */
    private modifiedSpriteList: boolean;

    /** Mouse control enabled */
    private mouseEnabled: boolean;
    /** Mouse control enabled with sprites */
    private clickedSpritesEnabled: boolean;
    /** Zoom (scroll / touch) */
    private zoomEnabled: boolean;

    /** Last mouse event */
    private mouseEvent: Point;
    /** Mouse movement control enabled */
    private mouseMoveEnabled: boolean;
    /** Current mouse movement */
    private mouseMovement: Vector;
    /** Previous position */
    private mousePrevious: Point;
    /** Whether drag is complete */
    private endDrag: boolean = false;

    /** Current zoom state */
    private zoomState: State;
    /** Current touch zoom state */
    private touchZoomState: State;

    /** Minimum zoom value */
    private minZoom: number;
    /** Maximum zoom value */
    private maxZoom: number; 
    /** Is touch currently used to zoom  */
    private isTouchZoom: boolean;

    /** Resources loader */
    private resourcesLoader: ResourcesLoader;
    /** Loader screen */
    private loaderScreen: LoaderScreen;
    /** If loader is initialised */
    private initLoader: boolean;

    /**
     * Defines an Engine. The scene is always maximized and centered on screen with preservation of its aspect ratio (Adds borders when needed)
     * @param _width Scene width
     * @param _height Scene height
     */
    public constructor(private _width: number, private _height: number, _loader?: LoaderScreen) {

        // Always create a new canvas
        this.canvas = document.createElement<'canvas'>('canvas');
        document.body.appendChild(this.canvas);
        // Force style of main canvas
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0px';
        this.canvas.style.left = '0px';

        // Init resources
        this.ctx = this.canvas.getContext('2d');
        this.coords = new Rectangle();

        this.offCanvas = document.createElement<'canvas'>('canvas');
        this.offCanvas.width = _width;
        this.offCanvas.height = _height;
        this.offCtx = this.offCanvas.getContext('2d');

        // Caches
        this.cache = new Map<string, any>();
        this.screenCache = new Map<string, GameScreen>();

        // Resources preloading
        this.resourcesLoader = new ResourcesLoader(this.cache);
        if (_loader == null) {
            this.loaderScreen = new DefaultLoaderScreen();
        } else {
            this.loaderScreen = _loader;
        }

        // Set default values
        this.reset();

        // Manage resize
        window.addEventListener<'resize'>('resize', this.resize);
        window.addEventListener<'orientationchange'>('orientationchange', this.resize);
        this.resize();

        // Initialise main loop
        window.requestAnimationFrame(this.run);
    }

    /**
     * Adapts view to a new screen size
     * @param event Resize event
     */
    protected resize = (event?: UIEvent): void => {
        const ratio: number = this._width / this._height;
        
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

        const newRatio: number = this.canvas.width / this.canvas.height;
        let scale: number;        

		if (newRatio > ratio) {
            let realWidth = this.canvas.height * ratio;
            this.coords.moveTo((this.canvas.width - realWidth) / 2, 0);
			scale = this.canvas.height / this._height;
		} else {
            var realHeight = this.canvas.width / ratio;
            this.coords.moveTo(0, (this.canvas.height - realHeight) / 2);
			scale = this.canvas.width / this._width;
		}

        this.coords.resize(this._width * scale, this._height * scale);
    }

    /**
     * Refreshes scene. Renders background and sprites on offest canvas
     */
    protected repaint = (): void => {
        if (this.background) {
            this.offCtx.drawImage(this.background, 0, 0);
        } else {
            this.offCtx.fillStyle = this.backgroundColor;
            this.offCtx.fillRect(0, 0, this._width, this._height);
        }

        // Draw sprites
        this.spriteList.forEach((sprite: Sprite): void => {
            sprite.render(this.offCtx);
        });

        // Paint off-screen canvas on visible canvas
        this.ctx.drawImage(this.offCanvas, this.coords.x, this.coords.y, this.coords.width, this.coords.height);
    }

    /**
     * Main loop
     * - Redraws main frame
     * - Evaluates captured events 
     * - Executes current [[GameScreen]] run method
     * - Renders sprites for next frame
     */
    protected run = (): void => {
        this.repaint();

        // Check for screen switch
        if (this.nextScreen) {
            if (this.screen) {
                this.reset();
                this.screen = null;
            }

            // Manage resources preloader
            if (this.resourcesLoader.complete()) {
                // Switch to next screen
                this.screen = this.nextScreen;
                this.nextScreen = null;

                this.screen.init(this);
            } else {
                // Init loader
                if (!this.initLoader) {
                    this.loaderScreen.init(this);
                    this.initLoader = true;
                }

                // Update loader
                this.loaderScreen.run(this, this.resourcesLoader.update());
                if (this.resourcesLoader.complete()) {
                    this.reset();
                }
            }
        }

        if (this.screen) {
            this.manageMouseEvents();
            this.screen.run(this);            

            // Sort sprites according to their index
            if (this.modifiedSpriteList) { // Only if something changed
                this.spriteList.sort((first: Sprite, second: Sprite): number => {
                    return first.getIndex() - second.getIndex();
                });

                this.modifiedSpriteList = false;
            }            
        }

        window.requestAnimationFrame(this.run);
    }


    /** Screen width */
    get width(): number {
        return this._width;
    }

    /** Screen height */
    get height(): number {
        return this._height;
    }
    

    /** 
     * Resets screen settings. Internally used for screen switch
     */
    protected reset = (): void => {

        // Background
        this.background = null;
        this.backgroundColor = Engine.DEFAULT_BACKGROUND_COLOR;

        // Sprites
        if (this.spriteList) {
            this.spriteList.length = 0;
        } else {
            this.spriteList = new Array<Sprite>();
        }
        this.modifiedSpriteList = true;
    
        // Mouse
        this.mouseEvent = null;
        this.mouseMovement = new Vector(0, 0);
        
        // Zoom
        this.zoomState = new State();
        this.zoomState.current = 1;
        this.touchZoomState = new State();
        this.touchZoomState.current = 0;
        this.isTouchZoom = false;      
        
        // Loader
        this.initLoader = false;
    }


    /**
     * Loads an image, adds it to the cache (If not already done)
     * @param url Absolute or relative path to the image
     * 
     * @returns An image or null if not found
     */
    protected addImage = (url: string): HTMLImageElement => {
		let img: HTMLImageElement = <HTMLImageElement>this.cache.get(url);
		if (!img) {
            img = document.createElement<'img'>('img');
			img.src = url;
			
			this.cache.set(url, img);
		}
        
        return img;
    }

    /**
     * Loads an image. Equivalent to [[addImage]]
     * @param url Absolute or relative path to the image
     * 
     * @returns An image or null if not found
     */
    public getImage = (url: string): HTMLImageElement => {
        return this.addImage(url);
    }


    /**
     * Caches a new [[GameScreen]] instance
     * @param name Key associated to the screen
     * @param newScreen New screen to reference
     * 
     * @returns current engine (to chain screen definitions)
     */
    public addScreen = (name: string, newScreen: GameScreen): Engine => {
        this.resourcesLoader.addResources(newScreen);
        this.screenCache.set(name, newScreen);
        return this;
    }


    /**
     * Changes displayed [[GameScreen]]. Use key when possible. See also [[addScreen]].
     * @param newScreen Key of referenced screen or new instance of screen
     */
    public start = (newScreen: string | GameScreen): void => {
        if (typeof newScreen === 'string') {
            this.nextScreen = this.screenCache.get(newScreen);
        } else {
            this.nextScreen = newScreen;
        }
    }

    /**
     * Forces update of sprites hierarchy. Should be used when index of sprites is updated.
     */
    public forceHierarchyUpdate = (): void => {
        this.modifiedSpriteList = true;
    }


    /**
     * Defines new zoom value. Ignored without [[enableZoomControl]]
     * @param newZoom New zoom value, within the minZoom - maxZoom limits
     */
    public setZoom = (newZoom: number): void => {
        this.zoomState.next = newZoom;
    }


    /* MOUSE CONTROL */
    /* START */

    /**
     * Manages everything related to mouse and touch events
     */
    private manageMouseEvents = (): void => {
        let uncasted = <any>this.screen;

        if (this.mouseEnabled && this.mouseEvent) {
            // Check if current screen supports mouse events
            if (uncasted.onClick !== undefined) {
                let mouseScreen: ClickListener = <ClickListener>uncasted;
                let clickedSprites: Array<Sprite> = null;

                if (this.clickedSpritesEnabled) {
                    clickedSprites = new Array<Sprite>();
                    this.spriteList.forEach((sprite: Sprite): void => {
                        if (sprite.contains(this.mouseEvent)) {
                            clickedSprites.push(sprite);
                        }
                    });
                }

                mouseScreen.onClick(this, this.mouseEvent.clone(), clickedSprites);
            }

            this.mouseEvent = null;
        }

        if (this.zoomEnabled && this.touchZoomState.next != 0 && this.touchZoomState.current != this.touchZoomState.next) {
            if (this.touchZoomState.current != 0) {
                this.zoomState.next *= this.touchZoomState.next / this.touchZoomState.current;
            }
            this.touchZoomState.current = this.touchZoomState.next;
        }

        if (this.zoomState.next < this.minZoom) { this.zoomState.next = this.minZoom };
        if (this.zoomState.next > this.maxZoom) { this.zoomState.next = this.maxZoom };

        if (this.zoomEnabled && this.zoomState.current != this.zoomState.next) {
            if (uncasted.onZoom !== undefined) {
                let zoomScreen: ZoomListener = <ZoomListener>uncasted;
                zoomScreen.onZoom(this, this.zoomState.next);
            }

            this.zoomState.current = this.zoomState.next;
        }

        if (this.mouseEnabled && !this.isTouchZoom
            && uncasted.onDrag !== undefined && !this.mouseMovement.isZeroLength()) {

            let dragScreen: DragListener = <DragListener>uncasted;
            dragScreen.onDrag(this, this.mouseMovement);
            this.mouseMovement.set(0, 0);
        }

        // End drag
        if (this.endDrag) {
            this.endDrag = false;
            if (uncasted.onDrop !== undefined) {
                (<DragListener>uncasted).onDrop(this);
            }
        }    
    }

    /**
     * Enables mouse and touch click events. Current Screen must implement ClickListener interface
     * @param withSprites If the event should return clicked sprites
     */
    public enableMouseControl = (withSprites: boolean = false): void => {
        if (!this.mouseEnabled) {
            window.addEventListener<'mousedown'>('mousedown', this.onDown);
            window.addEventListener<'touchstart'>('touchstart', this.onDown, { passive: false });

            this.mouseEnabled = true;
        }

        this.clickedSpritesEnabled = withSprites;
    }

    /**
     * Disables mouse and touch click events. 
     */
    public disableMouseControl = (): void => {
        if (this.mouseEnabled) {
            window.removeEventListener<'mousedown'>('mousedown', this.onDown);
            window.removeEventListener<'touchstart'>('touchstart', this.onDown);

            this.mouseEnabled = false;
        }
    }

    /**
     * Enables mouse and touch drag events. Current Screen must implement DragListener interface.
     */
    public enableMouseDrag = (): void => {
        this.enableMouseControl(this.clickedSpritesEnabled); // Mandatory
        this.mouseMoveEnabled = true;
    }

    /**
     * Disables mouse and touch drag events.
     */
    public disableMouseDrag = (): void => {
        this.mouseMoveEnabled = false; // TODO : Voir effet de bord si desactivation en cours de cycle
    }

    /**
     * Enables mouse wheel and touch pinch events. Current Screen must implement ZoomListener interface.
     */
    public enableZoomControl = (minZoom: number = 0.1, maxZoom: number = 10): void => {

        this.minZoom = minZoom;
        this.maxZoom = maxZoom;

        if (!this.zoomEnabled) {
            this.touchZoomState.next = this.touchZoomState.current;
            this.zoomState.next = this.zoomState.current;

            if (!this.mouseEnabled) {
                // this.mouseEnabled not updated
                window.addEventListener<'touchstart'>('touchstart', this.onDown, { passive: false });
            }

            window.addEventListener<'wheel'>('wheel', this.onZoom);
            window.addEventListener<'touchmove'>('touchmove', this.onZoom, { passive: false });
            window.addEventListener<'touchend'>('touchend', this.onEndZoom, { passive: false });

            this.zoomEnabled = true;
        }
    }

    /**
     * Disables mouse wheel and touch pinch events.
     */
    public disableZoomControl = (): void => {
        if (this.zoomEnabled) {
            if (!this.mouseEnabled) {
                // this.mouseEnabled not updated
                window.removeEventListener<'touchstart'>('touchstart', this.onDown);
            }
            window.removeEventListener<'wheel'>('wheel', this.onZoom);
            window.removeEventListener<'touchmove'>('touchmove', this.onZoom);
            window.removeEventListener<'touchend'>('touchend', this.onEndZoom);

            this.zoomEnabled = false;
        }
    }

    /**
     * Listens zoom events
     * @param event Source event
     */
    protected onZoom = (event: WheelEvent | TouchEvent): void => {

        event.preventDefault();

        if (event instanceof WheelEvent) {
            if (event.deltaY > 0) {
                this.zoomState.next /= Engine.ZOOM_RATIO;
            } else {
                this.zoomState.next *= Engine.ZOOM_RATIO;
            }

        } else { // TouchEvent
            if (event.touches.length > 1) {
                this.isTouchZoom = true;
                this.touchZoomState.next = new Vector(
                    event.touches.item(0).pageX - event.touches.item(1).pageX,
                    event.touches.item(0).pageY - event.touches.item(1).pageY
                ).getLength();
            }
        }
    }

    /**
     * Reset state when zoom touch ends
     * @param event Source event
     */
    protected onEndZoom = (event: TouchEvent): void => {
        this.touchZoomState.current = 0;
        this.touchZoomState.next = 0;
        if (event.touches.length == 0) {
            this.isTouchZoom = false;
        }    
    }

    /**
     * Converts screen coords of event to Screen coords
     * @param event Source event
     * 
     * @returns The screen coordinates of the event
     */
    private getEventPosition = (event: MouseEvent | TouchEvent): Point => {
        let x: number = -1, y: number = -1;

        if (event instanceof MouseEvent) {
            x = event.pageX;
            y = event.pageY;   
        } else { // TouchEvent
            if (event.touches.length > 0) {
                let touch = event.touches.item(0);
                x = touch.pageX;
                y = touch.pageY;
            }
        }

        x -= this.coords.x;
        x /= this.coords.width;

        y -= this.coords.y;
        y /= this.coords.height;

        let position: Point = null;
        if (x > 0 && x < 1 && y > 0 && y < 1) {
            position = new Point(x * this.width, y * this.height);
        }

        return position;
    }

    /**
     * Listens mouse down events to manage both click and drag events
     * @param event Source event
     */
    protected onDown = (event: MouseEvent | TouchEvent): void => {
    
        event.preventDefault();

        let position: Point = this.getEventPosition(event);

        if (this.zoomEnabled && window.ontouchstart 
            && event instanceof TouchEvent && event.touches.length > 1) {
            
            this.isTouchZoom = true;
            this.touchZoomState.current = new Vector(
                event.touches.item(0).pageX - event.touches.item(1).pageX,
                event.touches.item(0).pageY - event.touches.item(1).pageY
            ).getLength();
            this.touchZoomState.next = 0;
            position = null;
        }

        if (position != null) {
            this.mouseEvent = position;

            if (this.mouseMoveEnabled) {
                this.mouseMovement.set(0, 0);
                this.mousePrevious = this.mouseEvent.clone();
    
                window.addEventListener<'mousemove'>('mousemove', this.onMove);
                window.addEventListener<'touchmove'>('touchmove', this.onMove, { passive: false });
    
                window.addEventListener<'mouseup'>('mouseup', this.onUp);
                window.addEventListener<'touchend'>('touchend', this.onUp, { passive: false });
            }    
        }
    }

    /**
     * Listens move events to manage drag events
     * @param event Source event
     */
    protected onMove = (event: MouseEvent | TouchEvent): void => {
        event.preventDefault();

        if (this.mouseMoveEnabled) {
            let newPosition: Point = this.getEventPosition(event);
            if (newPosition != null) {
                this.mouseMovement.add(newPosition.x - this.mousePrevious.x, newPosition.y - this.mousePrevious.y);
                this.mousePrevious = newPosition;
            }
        }
    }

    /**
     * Listens mouse up events to manage both click and drag events
     * @param event Source event
     */
    protected onUp = (event: MouseEvent | TouchEvent): boolean => {
        event.preventDefault();

        if (this.mouseMoveEnabled && !this.isTouchZoom) {
            let newPosition: Point = this.getEventPosition(event);
            if (newPosition != null) {
                this.mouseMovement.add(newPosition.x - this.mousePrevious.x, newPosition.y - this.mousePrevious.y);
                this.mousePrevious = newPosition;
            }
        } else {
            this.mouseMovement.set(0, 0);    
        }

        window.removeEventListener<'mousemove'>('mousemove', this.onMove);
        window.removeEventListener<'touchmove'>('touchmove', this.onMove);
        window.removeEventListener<'mouseup'>('mouseup', this.onUp);
        window.removeEventListener<'touchend'>('touchend', this.onUp);

        this.endDrag = true;

        return false;
    }


    /* END */
    /* MOUSE CONTROL */


    /* CONTEXT AREA */
    /* START */

    /**
     * Adds sprite to screen. A sprite is inserted only once in a Screen
     * @param sprite Sprite to add
     * 
     * @returns true if the Sprite is added (false if already present)
     */
    public addSprite = (sprite: Sprite): boolean => {
        let index: number = this.spriteList.indexOf(sprite);

        if (index == -1) {
            this.spriteList.push(sprite);
            this.modifiedSpriteList = true;

            return true;
        }

        return false;
    }

    /**
     * Removes instance of sprite
     * @param sprite Sprite to remove
     * 
     * @returns true if the sprite is really removed (false if not present)
     */
    public removeSprite = (sprite: Sprite): boolean => {
        let index: number = this.spriteList.indexOf(sprite);

        if (index >= 0) {
            this.spriteList.splice(index, 1);
            this.modifiedSpriteList = true;

            return true;
        }

        return false;
    }
    
    /**
     * Defines current background image. The image is not distorted to fit the screen. 
     * @param bgImage The new background image. May be either an image, its relative or absolute url or a canvas
     */
    public setBackground = (bgImage: HTMLImageElement | HTMLCanvasElement | string): void => {
        if (bgImage instanceof HTMLImageElement) {
            this.background = <HTMLImageElement>bgImage;
        } else if (bgImage instanceof HTMLCanvasElement) {
            this.background = <HTMLCanvasElement>bgImage;
        } else { // string
            this.background = this.getImage(bgImage);
        }
    }

    /**
     * Defines current background color. Has no effect if a background image is already defined for the current screen. See also [[setBackground]].
     * @param color The new background color
     */
    public setBackgroundColor = (color: string): void => {
        this.backgroundColor = color;
    }

    /* END */
    /* CONTEXT AREA */

     
}


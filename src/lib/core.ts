import { Point, Rectangle } from './geometry'
import { GameScreen } from './screen';
import { Sprite } from './sprite';
import { ResourcesLoader, LoaderScreen, DefaultLoaderScreen } from './loader';

/**
 * Defines how the core engine should manage background image
 */
export enum BackgroundType {
    /** Background image is aligned on its top-left corner */
    TOP_LEFT,
    /** Background image is centered on screen, limited by `Engine` dimensions */
    CENTERED,
    /** Background image is centered on screen and fills screen (overflows `Engine` dimensions) */
    OVERFLOW
};    


/**
 * Defines the core engine used to render scenes (aka [[GameScreen]]s).
 * A project that use the zepr.ts framework must define exactly one instance of [[Core]] or derived classes
 */
export class Core {

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
    protected coords: Rectangle;

    /** Current background */
    private background: HTMLImageElement | HTMLCanvasElement;
    /** Alternative background color if no image background is set */
    private backgroundColor: string;
    /** How background image should be displayed */
    private backgroundType: BackgroundType;
    /** Background position */
    private backgroundPosition: Point;

    /** Scene scale in user view */
    private scale: number;

    /** Object cache */
    private cache: Map<string, any>;

    /** Current screen */
    protected screen: GameScreen;
    /** Next screen */
    private nextScreen: GameScreen;
    /** Sprites defined in current screen */
    protected spriteList: Array<Sprite<any>>;
    /** Check for modification of Sprites list in current frame */
    private modifiedSpriteList: boolean;

    /** Resources loader */
    private resourcesLoader: ResourcesLoader;
    /** Loader screen */
    private loaderScreen: LoaderScreen;
    /** If loader is initialised */
    private initLoader: boolean;

    /** Screen overflow */
    private overflow: boolean;
    /** Screen overflow center */
    private overflowCenter: Point;
    /** If overflow is horizontal */
    private horizontalOverflow: boolean;

    /** Last render time */
    private lastTime: number;

    /**
     * Defines a core Engine. The scene is always maximized and centered on screen with preservation of its aspect ratio (Adds borders when needed)
     * @param _width Scene width
     * @param _height Scene height
     * @param _loader Optional custom screen loader
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

        // Cache
        this.cache = new Map<string, any>();

        // Resources preloading
        this.resourcesLoader = new ResourcesLoader(this.cache);
        if (_loader == null) {
            this.loaderScreen = new DefaultLoaderScreen();
        } else {
            this.loaderScreen = _loader;
        }

        // Manage resize
        window.addEventListener<'resize'>('resize', this.resize.bind(this));
        window.addEventListener<'orientationchange'>('orientationchange', this.resize.bind(this));

        // Set default values
        this.reset();

        // Initialise main loop
        window.requestAnimationFrame(this.run.bind(this));
    }

    /**
     * Adapts view to a new screen size
     * @param event Resize event
     */
    protected resize(event?: UIEvent): void {
        const ratio: number = this._width / this._height;
        
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

        const newRatio: number = this.canvas.width / this.canvas.height;

        if ((newRatio > ratio) != this.overflow) {
            let realWidth: number = this.canvas.height * ratio;
            this.coords.moveTo((this.canvas.width - realWidth) / 2, 0);
            this.scale = this.canvas.height / this._height;
            this.horizontalOverflow = true;
        } else {
            let realHeight: number = this.canvas.width / ratio;
            this.coords.moveTo(0, (this.canvas.height - realHeight) / 2);
            this.scale = this.canvas.width / this._width;
            this.horizontalOverflow = false;
        }

        this.coords.resize(this._width * this.scale, this._height * this.scale);

        // Set center position when set in overflow
        if (this.overflow && this.overflowCenter != null) {
            this.setCenter(this.overflowCenter);
        }
    }

    /**
     * Refreshes scene. Renders background and sprites on offest canvas
     */
    protected repaint(): void {
        if (this.background) {
            if (this.backgroundPosition) {
                this.offCtx.drawImage(this.background, this.backgroundPosition.x, this.backgroundPosition.y);
            } else {
                this.offCtx.drawImage(this.background, 0, 0);
            }
        } else {
            this.offCtx.fillStyle = this.backgroundColor;
            this.offCtx.fillRect(0, 0, this._width, this._height);
        }

        // Draw sprites
        this.spriteList.forEach((sprite: Sprite<any>): void => {
            sprite.render(this.offCtx);
        });

        // Manage background overflow
        if (this.background && this.backgroundType == BackgroundType.OVERFLOW) {
            let backWidth: number = this.background.width * this.scale;
            let backHeight: number = this.background.height * this.scale;
            this.ctx.drawImage(this.background, 
                (window.innerWidth - backWidth) / 2, (window.innerHeight - backHeight) / 2, 
                backWidth, backHeight);
        }

        // Paint off-screen canvas on visible canvas
        this.ctx.drawImage(this.offCanvas, this.coords.x, this.coords.y, this.coords.width, this.coords.height);
    }

    /**
     * Main loop
     * - Redraws main frame
     * - Executes current [[GameScreen]] run method
     * - Renders sprites for next frame
     * @param time Delai d'appel
     */
    protected run(time: number): void {
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
            this.screen.run(this, this.lastTime ? time - this.lastTime : time);
            this.lastTime = time;

            // Sort sprites according to their index
            if (this.modifiedSpriteList) { // Only if something changed
                this.spriteList.sort((first: Sprite<any>, second: Sprite<any>): number => {
                    return first.getIndex() - second.getIndex();
                });

                this.modifiedSpriteList = false;
            }            
        }

        window.requestAnimationFrame(this.run.bind(this));
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
    protected reset(): void {

        // Background
        this.background = null;
        this.backgroundPosition = null;
        this.backgroundColor = Core.DEFAULT_BACKGROUND_COLOR;

        // Sprites
        if (this.spriteList) {
            this.spriteList.length = 0;
        } else {
            this.spriteList = new Array<Sprite<any>>();
        }
        this.modifiedSpriteList = true;
        
        // Loader
        this.initLoader = false;

        // Overflow
        this.overflowCenter = null;
        this.setOverflow(false);
    }


    /**
     * Changes overflow state
     * @param _overflow New overflow state
     */
    public setOverflow(_overflow: boolean): void {
        if (this.overflow != _overflow) {
            this.overflow = _overflow;
            this.resize();
        }
    }

    /**
     * Centers scene. This setting has no effect if there's no overflow
     * @param position New centered position. Use null to set center in the middle of the scene
     */
    public setCenter(position: Point): void {
        this.overflowCenter = position;

        if (!this.overflow) return;

        let scale: number;
        if (this.horizontalOverflow) {
            scale = this.canvas.height / this._height;   
            this.coords.moveTo(Math.max(this.canvas.width - this.coords.width, Math.min(0, (this.canvas.width / 2) - this.overflowCenter.x * scale)), 0);
        } else {
            scale = this.canvas.width / this._width;
            this.coords.moveTo(0, Math.max(this.canvas.height - this.coords.height, Math.min(0, (this.canvas.height / 2) - this.overflowCenter.y * scale)));
        }
    }


    /**
     * Loads object from cache
     * @param key id of the object to load
     */
    public getData(key: string): any {
        return this.cache.get('custom.' + key);
    }

    /**
     * Stores object to cache
     * @param key id of the object to store
     * @param value object to store
     */
    public setData(key: string, value: any): void {
        this.cache.set('custom.' + key, value);
    }


    /**
     * Loads an image, adds it to the cache (If not already done)
     * @param url Absolute or relative path to the image
     * 
     * @returns An image or null if not found
     */
    protected addImage(url: string): HTMLImageElement {
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
    public getImage(url: string): HTMLImageElement {
        return this.addImage(url);
    }


    /**
     * Caches a new [[GameScreen]] instance
     * @param name Key associated to the screen
     * @param newScreen New screen to reference
     * 
     * @returns current engine core (to chain screen definitions)
     */
    public addScreen(name: string, newScreen: GameScreen): Core {
        this.resourcesLoader.addResources(newScreen);
        this.cache.set('screen.' + name, newScreen);
        return this;
    }


    /**
     * Changes displayed [[GameScreen]]. Use key when possible. See also [[addScreen]].
     * @param newScreen Key of referenced screen or new instance of screen
     */
    public start(newScreen: string | GameScreen): void {
        if (typeof newScreen === 'string') {
            this.nextScreen = <GameScreen>this.cache.get('screen.' + newScreen);
        } else {
            this.nextScreen = newScreen;
        }
    }

    /**
     * Forces update of sprites hierarchy. Should be used when index of sprites is updated.
     */
    public forceHierarchyUpdate(): void {
        this.modifiedSpriteList = true;
    }

    /**
     * Adds sprite to screen. A sprite is inserted only once in a Screen
     * @param sprite Sprite to add
     * 
     * @returns true if the Sprite is added (false if already present)
     */
    public addSprite(sprite: Sprite<any>): boolean {
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
    public removeSprite (sprite: Sprite<any>): boolean {
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
     * @param backgroundType How background should be displayed
     */
    public setBackground(bgImage: HTMLImageElement | HTMLCanvasElement | string, backgroundType: number = BackgroundType.TOP_LEFT): void {

        if (bgImage == null) {
            // Removes background
            this.background = null;
        } else if (bgImage instanceof HTMLImageElement) {
            this.background = <HTMLImageElement>bgImage;
        } else if (bgImage instanceof HTMLCanvasElement) {
            this.background = <HTMLCanvasElement>bgImage;
        } else { // string
            this.background = this.getImage(bgImage);
        }

        this.backgroundType = backgroundType;

        if (backgroundType != BackgroundType.TOP_LEFT && this.background && this.background.width > 0 ) {
            this.backgroundPosition = new Point((this.width - this.background.width) / 2, (this.height - this.background.height) /2);
        } else {
            this.backgroundPosition = null; // Background set at origin
        }
    }

    /**
     * Defines current background color. Has no effect if a background image is already defined for the current screen. See also [[setBackground]].
     * @param color The new background color
     */
    public setBackgroundColor(color: string): void {
        this.backgroundColor = color;
    }     
}


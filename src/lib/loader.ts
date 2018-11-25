/**
 * Resources loader
 */

/**
 * 
 */

import { Engine } from './engine';
import { GameScreen } from './screen';
import { Sound } from './sound';
import { Sprite, RawSprite } from './sprite';
import { Point, Rectangle } from './geometry';
import { TextAlign, Font, Text } from './text';

/**
 * Used by Engine to preload resources at startup.
 */
export class ResourcesLoader {
    
    static readonly CONCURRENT_LOAD: number = 4;

    /** Images to load */
    private imagesToLoad: Array<string>;
    /** Sounds to load */
    private soundsToLoad: Array<string>;
    /** Load statistics */
    private stats: LoaderStats;
    /** Resources currently loading */
    private loading: Array<string>;


    /**
     * Constructs a simple loader for images and sounds
     * @param cache cache used to store loaded resources
     */
    public constructor(private cache: Map<string, any>) {
        this.imagesToLoad = new Array<string>();
        this.soundsToLoad = new Array<string>();
        
        this.loading = new Array<string>();
        this.stats = new LoaderStats();
    }   
    
    /**
     * Adds resources declared by a `GameScreen`
     * @param screen The screen whose resources should be preloaded
     */
    addResources(screen: GameScreen): void {
        // Images
        if (screen.images && screen.images.length > 0) {
            screen.images.forEach((url: string): void => {
                if (!this.cache.has(url) && this.imagesToLoad.indexOf(url) == -1) {
                    this.imagesToLoad.push(url);
                    this.stats.total++;
                }
            });
        }

        // Sounds
        if (screen.sounds && screen.sounds.length > 0) {
            screen.sounds.forEach((url: string): void => {
                if (!this.cache.has(url) && this.soundsToLoad.indexOf(url) == -1) {
                    this.soundsToLoad.push(url);
                    this.stats.total++;
                }
            });
        }
    }

    /**
     * Updates loading process
     * 
     * @returns updated statistics. Always returns the same object
     */
    update(): LoaderStats {
        // Check for completed resources
        let resource: any = null;
        let typeFound: boolean;
        let complete: boolean;

        this.loading.forEach((url: string, index: number):void => {
            resource = this.cache.get(url);
            typeFound = false;
            complete = false;

            if (resource instanceof HTMLImageElement) { 
                typeFound = true;
                complete = (<HTMLImageElement>resource).complete;
            } else if (resource instanceof Sound) {
                typeFound = true;
                complete = (<Sound>resource).complete;
            } 
            
            if (!typeFound) {
                // Unknown type, completeness is not manageable
                // Remove from loading list
                complete = true;
            }

            if (complete) {
                // Remove item from list
                this.loading.splice(index, 1);
                // Update stats
                this.stats.loaded++;
            }
        });

        // Load images
        while (this.loading.length < ResourcesLoader.CONCURRENT_LOAD && this.imagesToLoad.length > 0) {
            let src: string = this.imagesToLoad.pop();
            let img: HTMLImageElement = document.createElement<'img'>('img');
            img.src = src;

            this.cache.set(src, img);
            this.loading.push(src);
        }

        // Load sounds (after images)
        while (this.loading.length < ResourcesLoader.CONCURRENT_LOAD && this.soundsToLoad.length > 0) {
            let src: string = this.soundsToLoad.pop();
            let snd: Sound = new Sound(src);

            this.cache.set(src, snd);
            this.loading.push(src);
        }

        // Update stats for next resource
        if (this.loading.length > 0) {
            this.stats.nextLoad = this.loading[0];
        } else {
            this.stats.nextLoad = null;
        }

        return this.stats;
    }

    /**
     * Used to reset instance between loads. May be called after a screen switch
     */
    reset(): void {
        this.imagesToLoad.length = 0;
        this.soundsToLoad.length = 0;
        this.loading.length = 0;

        this.stats.loaded = 0;
        this.stats.total = 0;
        this.stats.nextLoad = null;
    }

    /**
     * Checks if all managed resources are fully loaded
     */
    complete(): boolean {
        return this.stats.loaded == this.stats.total;
    }
}


export class LoaderStats {
    /** Number of resources completely loaded */
    loaded: number = 0;
    /** Total number of resources to load */
    total: number = 0; 
    /** Next resource that should be completed (first in loading list) */
    nextLoad: string;
}


/**
 * Loader behavior. Basically a specialized `GameScreen` used to present loading progress.
 * Its implementations should use as few resources as possible, as they are loaded concurrently to the game resources.
 */
export interface LoaderScreen {
    /** 
     * Initialises scene. This method is called each time the loader is called. 
     * If all screens are defined before the first call to `Engine.start()`, 
     * this method is only called once.
     * @param engine A reference to the active engine
     */
    init(engine: Engine): void;

    /** 
     * Main method. Called on each frame
     * @param engine A reference to the active engine
     * @param stats Current loader stats
     */
    run(engine: Engine, stats: LoaderStats): void;
}


/**
 * Basic implementation of a loader screen, used as default loader
 */
export class DefaultLoaderScreen implements LoaderScreen {
    
    static readonly VERTICAL_POSITION_RATIO: number = .6;
    static readonly HORIZONTAL_MARGIN: number = 40;
    static readonly PROGRESSBAR_HEIGHT: number = 26;

    progressBar: ProgressBar;    
    
    init(engine: Engine): void {
        let rect: Rectangle = new Rectangle(
            DefaultLoaderScreen.HORIZONTAL_MARGIN,
            Math.floor(engine.height * .6),
            engine.width - DefaultLoaderScreen.HORIZONTAL_MARGIN * 2,
            DefaultLoaderScreen.PROGRESSBAR_HEIGHT
        );

        this.progressBar = new ProgressBar(rect);

        engine.setBackgroundColor('#FFFFFF');
        engine.addSprite(this.progressBar);
    }    
    
    run(engine: Engine, stats: LoaderStats): void {
        this.progressBar.update(stats);
    }
}

/**
 * A minimalist progress bar
 */
export class ProgressBar extends RawSprite<Rectangle> {

    /** Name of last loaded resource */
    private resource: string;
    /** Ratio of loaded resources */
    private progress: number;
    /** Percentage of loaded resources */
    private percent: string;
    /** Text of percentage of loaded resources */
    private percentText: Text;

    /** Canvas representing resources already loaded */
    protected loadedCanvas: HTMLCanvasElement;
    /** Canvas representing resources not y loaded */
    protected waitingCanvas: HTMLCanvasElement;
    

    public constructor(position: Rectangle, index: number = 1, private withPercent: boolean = true) {
        super(position, index);
        this.progress = 0;
        this.percent = null;

        // Init bars
        this.loadedCanvas = document.createElement<'canvas'>('canvas');
        this.loadedCanvas.width = position.width;
        this.loadedCanvas.height = position.height;
        this.draw(this.loadedCanvas, null, 'black', 'white');

        this.waitingCanvas = document.createElement<'canvas'>('canvas');
        this.waitingCanvas.width = position.width;
        this.waitingCanvas.height = position.height;
        this.draw(this.waitingCanvas, null, 'white', 'black');
    }

    update(stats: LoaderStats): void {

        if (stats.total > 0) {
            this.progress = stats.loaded / stats.total;
        } else {
            this.progress = 1;
        }

        let newPercent: string = '' + (Math.round(100 * this.progress)) + '%';
        if (this.withPercent && this.percent != newPercent) {
            this.percent = newPercent;
            this.percentText = new Text(
                this.percent, new Point(0, this.shape.y - 100), this.shape.width, 
                new Font('arial', 48, '#000000'), TextAlign.CENTER
            );
        }

        if (this.resource != stats.nextLoad) {
            this.resource = stats.nextLoad;
            this.draw(this.loadedCanvas, this.resource, 'black', 'white');
            this.draw(this.waitingCanvas, this.resource, 'white', 'black');
        }
    }

    private draw(canvas: HTMLCanvasElement, text: string, backgroundStyle: string, textStyle: string): void {
        let context: CanvasRenderingContext2D = canvas.getContext('2d');
        context.fillStyle = backgroundStyle;
        context.fillRect(0, 0, canvas.width, canvas.height);

        if (text) {
            context.font = '' + (canvas.height - 2) + 'px Arial';
            context.fillStyle = textStyle;
            context.fillText(text, 20, canvas.height - 4);
        }
    }

    render(context: CanvasRenderingContext2D): void {
        context.drawImage(this.waitingCanvas, this.shape.x, this.shape.y);
        let width: number = this.shape.width * this.progress;
        if (width > 0) {
            context.save();

            context.beginPath();
            context.rect(this.shape.x, this.shape.y, width, this.shape.height);
            context.clip();
            context.drawImage(this.loadedCanvas, this.shape.x, this.shape.y);
            
            context.restore();
        }

        if (this.withPercent && this.percentText) {
            this.percentText.render(context);
        }
    }
}
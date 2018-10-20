/**
 * Exposes sprite-related classes
 */

/**
 * 
 */
import { Point, Rectangle } from './geometry';
import { Text, TextAlign, Font } from './text'

/**
 * Set of positions, clockwise from noon
 */
export enum Direction { Up, UpRight, Right, DownRight, Down, DownLeft, Left, UpLeft };

/**
 * Mandatory class for sprites
 */
export abstract class Sprite {

    /** Area covered by the sprite */
    protected rect: Rectangle;

    /**
     * @param position Position of the sprite
     * @param index Order for sprite rendering 
     */
    public constructor(position: Rectangle | Point, protected index: number = 1) {
        if (position instanceof Rectangle) {
            this.rect = <Rectangle>position;
        } else { // Point
            this.rect = new Rectangle(position.x, position.y);
        }
    }

    /**
     * moves sprite to relative position
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     */
    public move = (newX: number, newY: number): void => {
        this.rect.move(newX, newY);
    }

    /**
     * Moves sprite to absolute position
     * @param newX New abscissa
     * @param newY New ordinate
     */
    public moveTo = (newX: number, newY: number): void => {
        this.rect.moveTo(newX, newY);
    }

    /**
     * Gets abscissa of sprite
     * 
     * @returns Upper-left corner abscissa of sprite
     */
    public getX = (): number => {
        return this.rect.x;
    }

    /**
     * Gets ordinate of sprite
     * 
     * @returns upper-left corner ordinate of sprite
     */
    public getY = (): number => {
        return this.rect.y;
    }

    /**
     * Gets current index
     * 
     * @returns index of sprite
     */
    public getIndex = (): number => {
        return this.index;
    }

    /**
     * Set new index value. Whenever this method is called, engine must be informed
     * ```javascript
     * engine.forceHierarchyUpdate()
     * ```
     * @param newIndex new index value.
     */
    public setIndex = (newIndex: number): void => {
        this.index = newIndex;
    }

    /**
     * Gets reference to sprite Rectangle
     * 
     * @returns underlying Rectangle. May be modified directly
     */
    public getRect = (): Rectangle => {
        return this.rect;
    }

    /**
     * Checks if a point is within the bounds (inclusive) of a Sprite
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Sprite area
     */
    public contains = (p: Point): boolean => {
        return this.rect.contains(p);
    }

    /**
     * Checks if Sprite collides a specified Rectangle
     * @param r Rectangle to check
     * 
     * @returns true only if provided Rectangle collides the Sprite
     */
    public collide = (r: Rectangle): boolean => {
        return this.rect.collide(r);
    }

    /**
     * Renders the sprite. Called each frame for each sprite, in the index order
     * @param context Rendering context
     */
    abstract render(context: CanvasRenderingContext2D): void;
}


/**
 * [[Sprite]] implementation that manage a simple image
 */
export class ImageSprite extends Sprite {

    /** Managed image */
    protected spriteImage: HTMLImageElement;

    /**
     * @param image Reference to managed image. May be an image or a canvas
     * @param position Position of the sprite
     * @param index Order for sprite rendering 
     */
    public constructor(
        image: HTMLImageElement | HTMLCanvasElement,
        position: Point | Rectangle, index: number = 1) {

        super(position, index);
        this.setImage(image);
    }

    /**
     * Change referenced image. May be an image or a canvas. Internally converted to an image :
     * Canvas may be modified and reused without inteference with current object.
     * @param newImage Reference to managed image
     */
    public setImage = (newImage: HTMLImageElement | HTMLCanvasElement): void => {
        if (newImage instanceof HTMLImageElement) {
            this.spriteImage = <HTMLImageElement>newImage;
        } else { // HTMLCanvasElement
            this.spriteImage = document.createElement<'img'>('img');
            this.spriteImage.src = (<HTMLCanvasElement>newImage).toDataURL();
        }
    }

    /**
     * Gets referenced image
     * 
     * @returns The Image object managed by this sprite
     */
    public getImage = (): HTMLImageElement => {
        return this.spriteImage;
    }

    /**
     * Gets reference to sprite Rectangle
     * 
     * @returns underlying [[Rectangle]]. May be modified directly
     */
    public getRect = (): Rectangle => {
        if (this.rect.width == 0 && this.spriteImage.complete) {
            this.rect.resize(this.spriteImage.width, this.spriteImage.height);
        }

        return this.rect;
    }

    /**
     * Render image sprite
     * @param context Rendering context
     */
    public render(context: CanvasRenderingContext2D): void {
        if (this.spriteImage.complete) {
            context.drawImage(this.spriteImage, this.rect.x, this.rect.y);
        }
    }
}

/**
 * Extension of the [[ImageSprite]] to manage multi-frames (tiled) images
 */
export class TiledSprite extends ImageSprite {

    /** Current frame index */
    private currentFrame: number = 0;
    /** Direction */
    private indexDirection: number = 0;

    /**
     * @param image Tiled image. All frames must have the same size
     * @param frames Number of frames for each direction
     * @param directions The list of available directions, vertically aligned from top to bottom
     * @param position A rectangle representing both the position of the Sprite and the dimension of a frame
     * @param index Order for sprite rendering 
     */
    public constructor(
        image: HTMLImageElement | HTMLCanvasElement,
        protected frames: number,
        protected directions: Array<Direction>,
        position: Rectangle, index: number = 1) {
        
        super(image, position);
    }

    /**
     * Searches for nearest available direction
     * @param direction The normal direction
     */
    public setDirection = (direction: Direction): void => {
        // Search for nearest direction
        let newDistance: number, newDistanceRight;
        let distance: number = 8;
        let newIndexDirection: number;

        let idx = 0;
        this.directions.forEach((dir: number): void => {
            newDistance = direction - dir;
            if (newDistance < 0) { newDistance += 8; };
            newDistanceRight = dir - direction;
            if (newDistanceRight < 0) { newDistanceRight += 8; };
            newDistance = Math.min(newDistance, newDistanceRight);

            if (newDistance < distance) {
                distance = newDistance;
                newIndexDirection = idx;
            }
            idx++;
        });

        this.indexDirection = newIndexDirection;
    }

    /**
     * Defines new orientation for sprite
     * @param orientationDegree New orientation in degrees
     */
    public setOrientation = (orientationDegree: number): void => {
        if (Number.isNaN(orientationDegree)) orientationDegree = 0;
        let newDir = Math.floor(((orientationDegree % 360) + 22.5) / 45);
        if (newDir < 0) { newDir += 8; };

        this.setDirection(newDir);
    }

    /**
     * Cycles to next frame
     */
    public nextFrame = (): void => {
        this.currentFrame = (this.currentFrame + 1) % this.frames;        
    }

    /**
     * Render frame
     * @param context Rendering context
     */
    public render(context: CanvasRenderingContext2D): void {
        if (this.spriteImage.complete) {
            // Find position of frame in source
            let dx: number = this.rect.width * this.currentFrame;
            let dy: number = this.rect.height * this.indexDirection;

            context.save();

            context.beginPath();
            context.rect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
            context.clip();
            context.drawImage(this.spriteImage, this.rect.x - dx, this.rect.y - dy);
            
            context.restore();
        }
    }    
}

/**
 * Simple sprite wrapper for Text
 */
export class TextSprite extends Sprite {

    /** Canvas used for off-screen rendering (double buffering) */
    private offCanvas: HTMLCanvasElement;
    /** off-screen Canvas rendering context */
    private offCtx: CanvasRenderingContext2D;
    
    /** Text content */
    private text: string;

    public constructor(text: string, position: Rectangle, private font: Font, private align: TextAlign, index?: number) {
        super(position, index);

        this.offCanvas = document.createElement<'canvas'>('canvas');
        this.offCanvas.width = position.width;
        this.offCanvas.height = position.height;
        this.offCtx = this.offCanvas.getContext('2d');

        if (text != null) {
            this.setText(text);
        }
    }

    /**
     * Defines new content for text sprite
     * @param text Text to display
     */
    public setText(text: string) {
        this.text = text;
        this.offCtx.clearRect(0, 0, this.rect.width, this.rect.height);
        if (text == null) return;
        new Text(text, new Point(10, 0), this.rect.width - 20, this.font, this.align).render(this.offCtx);
    }

    /**
     * Returns current text
     */
    public getText(): string {
        return this.text;
    }

    public render(context: CanvasRenderingContext2D): void {
        context.drawImage(this.offCanvas, this.rect.x, this.rect.y);
    }

}


/**
 * Exposes sprite-related classes
 */

/**
 * 
 */
import { Point, Rectangle, Vector, Shape, Circle } from './geometry';
import { Text, TextAlign, Font } from './text'

/**
 * Set of positions, clockwise from noon
 */
export enum Direction { Up, UpRight, Right, DownRight, Down, DownLeft, Left, UpLeft };

/**
 * Mandatory interface for sprites
 */
export interface Sprite<T extends Shape<T>> {

    /**
     * Returns the shape used to define this sprite
     * 
     * @returns underlying shape
     */
    getShape(): T;

    /**
     * Gets abscissa of sprite
     * 
     * @returns Upper-left corner abscissa of sprite
     */
    getX(): number;
    /**
     * Gets ordinate of sprite
     * 
     * @returns upper-left corner ordinate of sprite
     */
    getY(): number;

    /**
     * Gets current index
     * 
     * @returns index of sprite
     */
    getIndex(): number;
    /**
     * Set new index value. Whenever this method is called, engine must be informed
     * ```javascript
     * engine.forceHierarchyUpdate()
     * ```
     * @param newIndex new index value.
     */
    setIndex(newIndex: number): void;



    /**
     * moves sprite to relative position
     * @param moveX Added to current abscissa
     * @param moveY Added to current ordinate
     */
    move(moveX: number, moveY: number);
    /**
     * moves sprite to relative position
     * @param vect Added to current position
     */
    move(vect: Vector);


    /**
     * Moves sprite to absolute position
     * @param coordX New abscissa
     * @param coordY New ordinate
     */
    moveTo(coordX: number, coordY: number): void;
    /**
     * Moves sprite to absolute position
     * @param point New position
     */
    moveTo(point: Point): void;



    /**
     * Checks if a point is within the bounds (inclusive) of a Sprite
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Sprite area
     */
    contains(p: Point): boolean;
    /**
     * Checks if a point is within the bounds (inclusive) of a Sprite
     * @param coordX Abscissa
     * @param coordY Ordinate
     * 
     * @returns true only if Point is inside current Sprite area
     */
    contains(coordX: number, coordY: number): boolean;

    /**
     * Checks if Sprite collides a specified Shape
     * @param s Shape to check
     * 
     * @returns true only if provided Rectangle collides the Sprite
     */
    collides(s: Shape<any>): boolean;



    /**
     * Renders the sprite. Called each frame for each sprite, in the index order
     * @param context Rendering context
     */
    render(context: CanvasRenderingContext2D): void;
}


/**
 * A simple abstract Sprite
 */
export abstract class RawSprite<T extends Shape<T>> implements Sprite<T> {

    /**
     * @param position Position of the sprite
     * @param index Order for sprite rendering 
     */
    public constructor(protected shape: T, protected index: number = 1) {
    }

    public move(moveX: number, moveY: number): void;
    public move(vect: Vector): void;
    public move(moveXOrVect: number | Vector, moveY?: number): void {
        if (typeof(moveXOrVect) === 'number') {
            this.shape.move(moveXOrVect, moveY);
        } else {
            this.shape.move(moveXOrVect);
        }
    }


    public moveTo(coordX: number, coordY: number): void;
    public moveTo(point: Point);
    public moveTo(coordXOrPoint: number | Point, coordY?: number): void {
        if (typeof(coordXOrPoint) === 'number') {
            this.shape.moveTo(coordXOrPoint, coordY);
        } else {
            this.shape.moveTo(coordXOrPoint);
        }
    }

    public getX(): number {
        return this.shape.x;
    }
    public getY(): number {
        return this.shape.y;
    }

    public getIndex(): number {
        return this.index;
    }
    public setIndex(newIndex: number): void {
        this.index = newIndex;
    }

    public getShape(): T {
        return this.shape;
    }

    public contains(p: Point): boolean;
    public contains(coordX: number, coordY: number): boolean;
    public contains(coordXOrPoint: number | Point, coordY?: number): boolean {
        if (typeof(coordXOrPoint) === 'number') {
            return this.shape.contains(coordXOrPoint, coordY);
        } else {
            return this.shape.contains(coordXOrPoint);
        }
    }

    /**
     * Checks if Sprite collides a specified Rectangle
     * @param r Rectangle to check
     * 
     * @returns true only if provided Rectangle collides the Sprite
     */
    public collides(r: Rectangle): boolean {
        return this.shape.collides(r);
    }

    abstract render(context: CanvasRenderingContext2D): void;
}


/**
 * [[Sprite]] implementation that manage a simple image
 */
export class ImageSprite extends RawSprite<Circle | Rectangle> {

    /** Managed image */
    protected spriteImage: HTMLImageElement;

    /**
     * @param image Reference to managed image. May be an image or a canvas
     * @param position Position of the sprite
     * @param index Order for sprite rendering 
     */
    public constructor(
        image: HTMLImageElement | HTMLCanvasElement,
        position: Circle | Rectangle, index: number = 1) {

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
     * Set new rotation angle 
     * @param degrees Rotation angle in degrees (from original image)
     */
    public setRotation(degrees: number): void {
        this.shape.rotate(degrees);
    }

    /**
     * Adds angle to current rotation
     * @param degrees Rotation angle in degrees (delta)
     */
    public addRotation(degrees: number): void {
        this.shape.rotateRad(this.shape.angle + degrees * Math.PI / 180);
    }

    /**
     * Get current rotation angle
     * 
     * @returns rotation angle in degrees
     */
    public getRotation(): number {
        return this.shape.angle * 180 / Math.PI;
    }


    /**
     * Render image sprite
     * @param context Rendering context
     */
    public render(context: CanvasRenderingContext2D): void {
        if (this.spriteImage.complete) {
            if (this.shape.angle == 0) {
                context.drawImage(this.spriteImage, this.shape.x - this.spriteImage.width / 2, this.shape.y - this.spriteImage.height / 2);
            } else {
                context.save();
                context.translate(this.shape.x, this.shape.y);
                context.rotate(this.shape.angle);
                context.drawImage(this.spriteImage, -this.spriteImage.width / 2, -this.spriteImage.height / 2);
                context.restore();
            }
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
     * @param frameCount Number of frames for each direction
     * @param directions The list of available directions, vertically aligned from top to bottom
     * @param frame A rectangle representing both the position of the Sprite and the dimension of a frame
     * @param index Order for sprite rendering 
     */
    public constructor(
        image: HTMLImageElement | HTMLCanvasElement,
        protected frameCount: number,
        protected directions: Array<Direction>,
        frame: Rectangle, index: number = 1) {
        
        super(image, frame);
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
        this.currentFrame = (this.currentFrame + 1) % this.frameCount;        
    }

    /**
     * Render frame
     * @param context Rendering context
     */
    public render(context: CanvasRenderingContext2D): void {
        if (this.spriteImage.complete) {
            let halfWidth: number = (<Rectangle>this.shape).width / 2;
            let halfHeight: number = (<Rectangle>this.shape).height / 2;

            let dx: number = -(<Rectangle>this.shape).width * this.currentFrame;
            let dy: number = -(<Rectangle>this.shape).height * this.indexDirection;

            context.save();
            context.translate(this.shape.x, this.shape.y);
            context.rotate(this.shape.angle);

            context.beginPath();
            context.fillStyle = 'red';
            context.rect(-halfWidth, -halfHeight, (<Rectangle>this.shape).width, (<Rectangle>this.shape).height);
            context.clip();

            context.drawImage(this.spriteImage, dx - halfWidth, dy - halfHeight);
            context.restore();
        }
    }    
}

/**
 * Simple sprite wrapper for Text
 */
export class TextSprite extends RawSprite<Rectangle> {

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
        this.offCtx.clearRect(0, 0, this.shape.width, this.shape.height);
        if (text == null) return;
        new Text(text, new Point(10, 0), this.shape.width - 20, this.font, this.align).render(this.offCtx);
    }

    /**
     * Returns current text
     */
    public getText(): string {
        return this.text;
    }

    /**
     * Set new rotation angle 
     * @param degrees Rotation angle in degrees (from original image)
     */
    public setRotation(degrees: number): void {
        this.shape.rotate(degrees);
    }

    /**
     * Adds angle to current rotation
     * @param degrees Rotation angle in degrees (delta)
     */
    public addRotation(degrees: number): void {
        this.shape.rotateRad(this.shape.angle + degrees * Math.PI / 180);
    }

    /**
     * Get current rotation angle
     * 
     * @returns rotation angle in degrees
     */
    public getRotation(): number {
        return this.shape.angle * 180 / Math.PI;
    }


    public render(context: CanvasRenderingContext2D): void {
        if (this.shape.angle == 0) {
            context.drawImage(this.offCanvas, this.shape.x - this.shape.width / 2, this.shape.y - this.shape.height / 2);
        } else {
            context.save();
            context.translate(this.shape.x, this.shape.y);
            context.rotate(this.shape.angle);
            context.drawImage(this.offCanvas, -this.shape.width / 2, -this.shape.height / 2);
            context.restore();
        }
    }
}


import { Engine } from './engine';
import { Point, Rectangle } from './geometry';


export enum Direction { Up, UpRight, Right, DownRight, Down, DownLeft, Left, UpLeft };

export abstract class Sprite {

    protected rect: Rectangle;

    public constructor(position: Rectangle | Point, protected index: number = 1) {
        if (position instanceof Rectangle) {
            this.rect = <Rectangle>position;
        } else { // Point
            this.rect = new Rectangle(position.x, position.y);
        }
    }

    public move = (newX: number, newY: number): void => {
        this.rect.move(newX, newY);
    }

    public moveTo = (newX: number, newY: number): void => {
        this.rect.moveTo(newX, newY);
    }

    public getX = (): number => {
        return this.rect.x;
    }

    public getY = (): number => {
        return this.rect.y;
    }

    public getIndex = (): number => {
        return this.index;
    }

    public setIndex = (newIndex: number): void => {
        this.index = newIndex;
    }

    public getRect = (): Rectangle => {
        return this.rect;
    }

    public contains = (p: Point): boolean => {
        return this.rect.contains(p);
    }

    public collide = (r: Rectangle): boolean => {
        return this.rect.collide(r);
    }

    abstract render(context: CanvasRenderingContext2D): void;
}


export class ImageSprite extends Sprite {

    protected spriteImage: HTMLImageElement;

    public constructor(
        image: HTMLImageElement | HTMLCanvasElement,
        position: Point | Rectangle, index: number = 1) {

        super(position, index);
        this.setImage(image);
    }

    public setImage = (newImage: HTMLImageElement | HTMLCanvasElement): void => {
        if (newImage instanceof HTMLImageElement) {
            this.spriteImage = <HTMLImageElement>newImage;
        } else { // HTMLCanvasElement
            this.spriteImage = document.createElement<'img'>('img');
            this.spriteImage.src = (<HTMLCanvasElement>newImage).toDataURL();
        }
    }

    public getImage = (): HTMLImageElement => {
        return this.spriteImage;
    }


    public getRect = (): Rectangle => {
        if (this.rect.width == 0 && this.spriteImage.complete) {
            this.rect.resize(this.spriteImage.width, this.spriteImage.height);
        }

        return this.rect;
    }

    public render(context: CanvasRenderingContext2D): void {
        if (this.spriteImage.complete) {
            context.drawImage(this.spriteImage, this.rect.x, this.rect.y);
        }
    }

}

export class TiledSprite extends ImageSprite {

    private currentFrame: number = 0;
    private currentDirection: Direction;
    private indexDirection: number = 0;

    public constructor(
        image: HTMLImageElement | HTMLCanvasElement,
        protected frames: number,
        protected directions: Array<Direction>,
        name: string, position: Rectangle, index: number = 1) {
        
        super(image, position);
        this.currentDirection = directions[this.indexDirection];
    }

    public setDirection = (direction: Direction): void => {
        // Search for nearest direction
        let newDirection: Direction;
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
                newDirection = dir;
                distance = newDistance;
                newIndexDirection = idx;
            }
            idx++;
        });

        this.currentDirection = direction;
        this.indexDirection = newIndexDirection;
    }

    public setOrientation = (orientationDegree: number): void => {
        let newDir = Math.floor(((orientationDegree % 360) + 22.5) / 45);
        if (newDir < 0) { newDir += 8; };

        this.setDirection(newDir);
    }

    public nextFrame = (): void => {
        this.currentFrame = (this.currentFrame + 1) % this.frames;        
    }

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

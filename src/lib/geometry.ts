export class Point
{
    constructor(private _x: number = 0.0, private _y: number = 0.0) {
    }
 
    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    public addPoint = (toAdd: Point): Point => {
        this._x += toAdd._x;
        this._y += toAdd._y;

        return this;
    }

    public add = (newX: number, newY: number): Point => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    public set = (newX: number, newY: number): Point => {
        this._x = newX;
        this._y = newY;        
        
        return this;
    }

    public clone = (): Point => {
        return new Point(this._x, this._y);
    }
}


export class Vector {

    public static readonly RAD_TO_DEGREES: number = 180 / Math.PI;

    constructor(private _x: number = 0.0, private _y: number = 0.0) {
    }
 
    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    public addVector = (toAdd: Vector): Vector => {
        this._x += toAdd._x;
        this._y += toAdd._y;

        return this;
    }

    public add = (newX: number, newY: number): Vector => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    public set = (newX: number, newY: number): Vector => {
        this._x = newX;
        this._y = newY;        
        
        return this;
    }

    public isZeroLength = (): boolean => {
        return this._x == 0 && this._y == 0;
    }

    public getLength = (): number => {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    public getMagnitude = (): number => {
        return this.getLength();
    }

    public normalize = (): Vector => {
        let length = this.getLength();
        this._x /= length;
        this._y /= length;
        
        return this;
    }

    public getNormalVector = (): Vector => {
        let length = this.getLength();
        return new Vector(this._x / length, this._y / length);
    }

    public multiply = (value: number): Vector => {
        this._x *= value;
        this._y *= value;

        return this;
    }

    /**
     * In degrees, 0 = noon ([0; -1])
     */
    public getAngle = (): number => {

        let angle: number;

        if (this._x != 0) {
            if (this._x < 0) {
                angle = 270 - Math.atan(-this._y / this._x) * Vector.RAD_TO_DEGREES;
            } else {
                angle = 90 - Math.atan(-this._y / this._x) * Vector.RAD_TO_DEGREES;
            }
        } else if (this._y >= 0) {
            angle = 0;
        } else {
            angle = 180;
        }

        return angle;
    }
}


export class Rectangle {
    constructor(private _x: number = 0, private _y: number = 0, 
        private _width: number = 0, private _height: number = 0) {
    }
 
    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    public move = (newX: number, newY: number): Rectangle => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    public moveTo = (newX: number, newY: number): Rectangle => {
        this._x = newX;
        this._y = newY;

        return this;
    }

    public resize = (newWidth: number, newHeight: number): Rectangle => {
        this._width = newWidth;
        this._height = newHeight;

        return this;
    }

    public reset = (newX: number, newY: number, newWidth: number, newHeight: number): Rectangle => {
        this._x = newX;
        this._y = newY;
        this._width = newWidth;
        this._height = newHeight;

        return this;
    }

    public clone = (): Rectangle => {
        return new Rectangle(this._x, this._y, this._width, this.height);
    }

    public contains = (p: Point): boolean => {
        return p.x >= this._x && p.x <= this._x + this._width && p.y >= this._y && p.y <= this._y + this._height;
    }

    public collide = (r: Rectangle): boolean => {
        return this.x < r.x + r.width 
            && this.x + this.width > r.x 
            && this.y < r.y + r.height 
            && this.y + this.height > r.y;
    }
}
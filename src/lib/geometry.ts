/**
 * Exposes objects used to represent shapes and movement in space
 */


/**
 * Represents a 2D Point
 */
export class Point {

    constructor(private _x: number = 0.0, private _y: number = 0.0) {
    }
 
    /** Abscissa of the Point */
    get x(): number {
        return this._x;
    }

    /** Ordinate of the Point */
    get y(): number {
        return this._y;
    }

    /** 
     * Adds coordinates to current point
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     */
    public add = (newX: number, newY: number): Point => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    /** 
     * Replaces coordinates of current point
     * @param newX New abscissa
     * @param newY New ordinate
     * 
     * @returns Current Point
     */
    public set = (newX: number, newY: number): Point => {
        this._x = newX;
        this._y = newY;        
        
        return this;
    }

    /**
     * Clones current point
     * 
     * @returns A copy of current point
     */
    public clone = (): Point => {
        return new Point(this._x, this._y);
    }
}


/**
 * Represents a 2D Vector
 */
export class Vector {

    /** Ratio between Radians and degrees */
    public static readonly RAD_TO_DEGREES: number = 180 / Math.PI;

    constructor(private _x: number = 0.0, private _y: number = 0.0) {
    }
 
    /** Length of Vector on X-Axis */
    get x(): number {
        return this._x;
    }

    /** Length of Vector on Y-Axis */
    get y(): number {
        return this._y;
    }

    /**
     * Adds a Vector 
     * @param toAdd the new Vector to add
     * 
     * @returns Current Vector
     */
    public addVector = (toAdd: Vector): Vector => {
        this._x += toAdd._x;
        this._y += toAdd._y;

        return this;
    }

    /**
     * Adds coordinates of a Vector 
     * @param newX Addition on X-Axis
     * @param newY Addition on Y-Axis
     * 
     * @returns Current Vector
     */
    public add = (newX: number, newY: number): Vector => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    /**
     * Sets new values for Vector
     * @param newX New X-Axis value
     * @param newY New Y-Axis value
     * 
     * @returns Current Vector
     */
    public set = (newX: number, newY: number): Vector => {
        this._x = newX;
        this._y = newY;        
        
        return this;
    }

    /**
     * Checks if vector is a zero Vector
     * 
     * @returns true only if the length of the Vector is zero
     */
    public isZeroLength = (): boolean => {
        return this._x == 0 && this._y == 0;
    }

    /**
     * Returns length of Vector
     * 
     * @returns lenght (magnitude) of the Vector
     */
    public getLength = (): number => {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    /**
     * Returns length of Vector (synonym of [[getLength]])
     * 
     * @returns lenght (magnitude) of the Vector
     */
    public getMagnitude = (): number => {
        return this.getLength();
    }

    /**
     * Changes the length of the Vector to 1
     * 
     * @returns current Vector
     */
    public normalize = (): Vector => {
        let length = this.getLength();
        this._x /= length;
        this._y /= length;
        
        return this;
    }

    /**
     * Returns a normalized Vector
     * 
     * @returns A new collinear Vector of length 1
     */
    public getNormalVector = (): Vector => {
        let length = this.getLength();
        return new Vector(this._x / length, this._y / length);
    }

    /**
     * Multiplies the length of the Vector
     * @param value Multiplier
     * 
     * @returns Current Vector
     */
    public multiply = (value: number): Vector => {
        this._x *= value;
        this._y *= value;

        return this;
    }

    /**
     * Returns the direction of the Vector. A zero-le,ght Vector has an angle of 0
     * 
     * @returns The direction of the Vector in degrees relative to noon ([0; -1])
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


    /**
     * Clones current Vector
     * 
     * @returns A copy of current Vector
     */
    public clone = (): Vector => {
        return new Vector(this._x, this._y);
    }
}

/**
 * Represents a Rectangle
 */
export class Rectangle {
    constructor(private _x: number = 0, private _y: number = 0, 
        private _width: number = 0, private _height: number = 0) {
    }
 
    /** Abscissa of upper-left corner of the rectangle */
    get x(): number {
        return this._x;
    }

    /** Ordinate of upper-left corner of the rectangle */
    get y(): number {
        return this._y;
    }

    /** Width of the rectangle */
    get width(): number {
        return this._width;
    }

    /** Height of rectangle */
    get height(): number {
        return this._height;
    }

    /**
     * Translates current Rectangle to relative coordinates
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     * 
     * @returns Current Rectangle
     */
    public move = (newX: number, newY: number): Rectangle => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    /**
     * Translates current Rectangle to absolute coordinates
     * @param newX New abscissa
     * @param newY New ordinate
     *
     * @returns Current Rectangle
     */
    public moveTo = (newX: number, newY: number): Rectangle => {
        this._x = newX;
        this._y = newY;

        return this;
    }

    /**
     * Changes size of Rectangle
     * @param newWidth New width
     * @param newHeight New height
     * 
     * @returns Current Rectangle
     */
    public resize = (newWidth: number, newHeight: number): Rectangle => {
        this._width = newWidth;
        this._height = newHeight;

        return this;
    }

    /**
     * Scales rectangle
     * @param ratio Scale ratio
     * @param centered If the scale operation is applied to the center of the rectangle
     * 
     * @returns Current Rectangle
     */
    public scale = (ratio: number, centered: boolean = false): Rectangle => {

        let newWidth: number = this._width * ratio;
        let newHeight: number = this._height * ratio;
        if (centered) {
            this._x -= (newWidth - this._width) / 2;
            this._y -= (newHeight - this._height) / 2;
        }
        this._width = newWidth;
        this._height *= newHeight;

        return this;
    }

    /**
     * Resets Rectangle dimensions
     * @param newX New abscissa
     * @param newY New ordinate
     * @param newWidth New width
     * @param newHeight New height
     * 
     * @returns Current Rectangle
     */
    public reset = (newX: number, newY: number, newWidth: number, newHeight: number): Rectangle => {
        this._x = newX;
        this._y = newY;
        this._width = newWidth;
        this._height = newHeight;

        return this;
    }

    /**
     * Clones current Rectangle
     * 
     * @returns A copy of current Rectangle
     */
    public clone = (): Rectangle => {
        return new Rectangle(this._x, this._y, this._width, this.height);
    }

    /**
     * Checks if a point is within the bounds (inclusive) of a Rectangle
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Rectangle
     */
    public contains = (p: Point): boolean => {
        return p.x >= this._x && p.x <= this._x + this._width && p.y >= this._y && p.y <= this._y + this._height;
    }

    /**
     * Checks if Rectangle collides another one 
     * @param r Rectangle to check
     * 
     * @returns true only if provided Rectangle collides current Rectangle
     */
    public collide = (r: Rectangle): boolean => {
        return this.x < r.x + r.width 
            && this.x + this.width > r.x 
            && this.y < r.y + r.height 
            && this.y + this.height > r.y;
    }
}
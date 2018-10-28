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
     * @returns length (magnitude) of the Vector
     */
    public getLength = (): number => {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    /**
     * Returns length of Vector (synonym of [[getLength]])
     * 
     * @returns length (magnitude) of the Vector
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
     * Rotates Vector
     * @param degrees Rotation angle in degrees
     * 
     * @returns Current Vector
     */
    public rotate = (degrees: number): Vector => {
        return this.rotateRad(degrees * Math.PI / 180);
    }


    /**
     * Rotates Vector
     * @param rad Rotation angle in radians
     * 
     * @returns Current Vector
     */
    public rotateRad = (rad: number): Vector => {

        let cos: number = Math.cos(rad);
        let sin: number = Math.sin(rad);

        let newX: number = this._x * cos - this._y * sin;
        let newY: number = this._x * sin + this._y * cos;

        this._x = newX;
        this._y = newY;

        return this;
    }


    /**
     * Returns the direction of the Vector. A zero-length Vector has an angle of 0
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


export interface Shape<T> {
    move(newX: number, newY: number): T;
    moveTo(newX: number, newY: number): T;
    scale(ratio: number): T;
    clone(): T;
    contains(p: Point): boolean;
    collides(s: Shape<any>): boolean;
}


/**
 * Represents a Rectangle
 */
export class Rectangle implements Shape<Rectangle> {
    /**
     * Creates a new Rectangle
     * @param _x Abscissa of upper-left corner
     * @param _y Ordinate of upper-left corner
     * @param _width width of Rectangle
     * @param _height height of Rectangle
     */
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
     * Checks if Rectangle collides another shape
     * @param shape Shape to check
     * 
     * @returns true only if provided shape collides current Rectangle
     */
    public collides = (shape: Shape<any>): boolean => {

        if (shape instanceof Rectangle) {
            let r: Rectangle = <Rectangle>shape;

            return this.x < r.x + r.width 
                && this.x + this.width > r.x 
                && this.y < r.y + r.height 
                && this.y + this.height > r.y;
        } else if (shape instanceof Circle) {
            let c: Circle = <Circle>shape;

            let rcx: number = this.x + (this.width >> 1); // x coord of center of rect
            let rcy: number = this.y + (this.height >> 1); // y coord of center of rect

            let dx = Math.abs(c.x - rcx); // Delta x between rectangle and circle
            let dy = Math.abs(c.y - rcy); // Delta y between rectangle and circle

            // Check trivial cases
            if (dx > (this.width >> 1) + c.radius) return false;
            if (dy > (this.height >> 1) + c.radius) return false;
            if (dx <= (this.width >> 1)) return true;
            if (dy <= (this.height >> 1)) return true;

            // Check corner
            return (dx - (this.width >> 1)) * (dx - (this.width >> 1)) + (dy - (this.height >> 1)) * (dx - (this.height >> 1)) <= c.radius * c.radius;
        } else {
            // Call other side (Same as previous case with Rectangle)
            // Non trivial shapes implementations should take care of loops
            return shape.collides(this);
        }
    }
}


export class Circle implements Shape<Circle> {
    /**
     * Creates a new Circle
     * @param _x Abscissa of center
     * @param _y Ordinate of center
     * @param _radius Radius of circle
     */
    constructor(private _x: number = 0, private _y: number = 0, private _radius: number = 0) {
    }

    /** Abscissa of center */
    get x(): number {
        return this._x;
    }

    /** Ordinate of center */
    get y(): number {
        return this._y;
    }

    /** Radius of Circle */
    get radius(): number {
        return this._radius;
    }


    /**
     * Translates current Circle to relative coordinates
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     * 
     * @returns Current Circle
     */
    public move = (newX: number, newY: number): Circle => {
        this._x += newX;
        this._y += newY;

        return this;
    }

    /**
     * Translates current Circle to absolute coordinates
     * @param newX New center abscissa
     * @param newY New center ordinate
     *
     * @returns Current Circle
     */
    public moveTo = (newX: number, newY: number): Circle => {
        this._x = newX;
        this._y = newY;

        return this;
    }


    /**
     * Changes size of Circle
     * @param newRadius New radius
     * 
     * @returns Current Circle
     */
    public scale = (newRadius: number): Circle => {
        this._radius = newRadius;

        return this;
    }


    /**
     * Resets Circle dimensions
     * @param newX New abscissa of center
     * @param newY New ordinate of center
     * @param newWidth New radius
     * 
     * @returns Current Circle
     */
    public reset = (newX: number, newY: number, newRadius: number): Circle => {
        this._x = newX;
        this._y = newY;
        this._radius = newRadius;

        return this;
    }

    /**
     * Clones current Circle
     * 
     * @returns A copy of current Circle
     */
    public clone = (): Circle => {
        return new Circle(this._x, this._y, this._radius);
    }


    /**
     * Checks if a point is within the bounds (inclusive) of a Circle
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Circle
     */
    public contains = (p: Point): boolean => {
        return (p.x - this._x) * (p.x - this._x) + (p.y - this._y) * (p.y - this._y) <= this._radius * this._radius;
    }


    /**
     * Checks if Circle collides another shape
     * @param shape Shape to check
     * 
     * @returns true only if provided shape collides current Circle
     */
    public collides = (shape: Shape<any>): boolean => {
        if (shape instanceof Circle) {  // Circle
            let c: Circle = <Circle>shape;
            return (this.x - c.x) * (this.x - c.x) + (this.y - c.y) * (this.y - c.y) <= (this.radius + c.radius) * (this.radius + c.radius);
        } else if (shape instanceof Rectangle) {
            // Use rectangle collision check
            return shape.collides(this);
        } else { // Other shape
            // Call other side (Same as previous case with Rectangle)
            // Non trivial shapes implementations should take care of loops
            return shape.collides(this);
        }
    }
}
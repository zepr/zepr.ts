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
     * @param coordX Added to current abscissa
     * @param coordY Added to current ordinate
     * 
     * @Returns Current Point
     */
    public add(coordX: number, coordY: number): Point;
    /** 
     * Moves Point following Vector
     * @param vect Vector to follow
     * 
     * @Returns Current Point
     */
    public add(vect: Vector): Point;
    public add(coordXOrVect: number | Vector, coordY?: number): Point {
        if (typeof(coordXOrVect) === 'number') {
            this._x += coordXOrVect;
            this._y += coordY;    
        } else {
            this._x += coordXOrVect.x;
            this._y += coordXOrVect.y;    
        }

        return this;
    }

    /** 
     * Substracts coordinates to current point
     * @param newX Removed from current abscissa
     * @param coordX Removed from current ordinate
     * 
     * @Returns Current Point
     */
    public sub(coordX: number, coordY: number): Point;
    /** 
     * Substracts [[Vector]] to current point
     * @param vect Vector to substract
     * 
     * @Returns Current Point
     */
    public sub(vect: Vector): Point;
    public sub(coordXOrVect: number | Vector, coordY?: number): Point {
        if (typeof(coordXOrVect) === 'number') {
            this._x += coordXOrVect;
            this._y += coordY;    
        } else {
            this._x += coordXOrVect.x;
            this._y += coordXOrVect.y;    
        }

        return this;
    }


    /** 
     * Replaces coordinates of current point
     * @param newX New abscissa
     * @param newY New ordinate
     * 
     * @returns Current Point
     */
    public set(newX: number, newY: number): Point {
        this._x = newX;
        this._y = newY;        
        
        return this;
    }

    /**
     * Clones current point
     * 
     * @returns A copy of current point
     */
    public clone(): Point {
        return new Point(this._x, this._y);
    }
}


/**
 * Represents a 2D Vector
 */
export class Vector {

    _x: number;
    _y: number;

    /** Ratio between Radians and degrees */
    public static readonly RAD_TO_DEGREES: number = 180 / Math.PI;

    constructor();
    constructor(x: number, y: number);
    constructor(startPoint: Point, endPoint: Point);
    constructor(xCoordOrStartPoint?: number | Point, yCoordOrEndPoint?: number | Point) {

        if (xCoordOrStartPoint == null) {
            this._x = 0;
            this._y = 0;
        } else if (typeof(xCoordOrStartPoint) === 'number') {
            this._x = xCoordOrStartPoint;
            this._y = <number>yCoordOrEndPoint;
        } else {
            this._x = (<Point>yCoordOrEndPoint).x - xCoordOrStartPoint.x;
            this._y = (<Point>yCoordOrEndPoint).y - xCoordOrStartPoint.y;
        }
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
     * Adds coordinates of a Vector 
     * @param coordX Addition on X-Axis
     * @param coordY Addition on Y-Axis
     * 
     * @returns Current Vector
     */
    public add(coordX: number, coordY: number): Vector;
    /**
     * Adds coordinates of a Vector 
     * @param newVector Addition on X-Axis
     * 
     * @returns Current Vector
     */
    public add(newVector: Vector): Vector;
    public add(coordXOrVect: number | Vector, coordY?: number): Vector {
        if (typeof(coordXOrVect) === 'number') {
            this._x += coordXOrVect;
            this._y += coordY;
        } else {
            this._x += coordXOrVect.x;
            this._y += coordXOrVect.y;
        }

        return this;
    }


    /**
     * Substracts coordinates of a Vector 
     * @param coordX Substraction on X-Axis
     * @param coordY Substraction on Y-Axis
     * 
     * @returns Current Vector
     */
    public sub(coordX: number, coordY: number): Vector;
    /**
     * Substracts coordinates of a Vector 
     * @param newVector Addition on X-Axis    
     * 
     * @returns Current Vector
     */
    public sub(newVector: Vector): Vector;
    public sub(coordXOrVect: number | Vector, coordY?: number): Vector {
        if (typeof(coordXOrVect) === 'number') {
            this._x -= coordXOrVect;
            this._y -= coordY;
        } else {
            this._x -= coordXOrVect.x;
            this._y -= coordXOrVect.y;
        }
        return this;
    }


    /**
     * Sets new values for Vector
     * @param newX New X-Axis value
     * @param newY New Y-Axis value
     * 
     * @returns Current Vector
     */
    public set(newX: number, newY: number): Vector {
        this._x = newX;
        this._y = newY;        
        
        return this;
    }

    /**
     * Checks if vector is a zero Vector
     * 
     * @returns true only if the length of the Vector is zero
     */
    public isZeroLength(): boolean {
        return this._x == 0 && this._y == 0;
    }

    /**
     * Returns length of Vector
     * 
     * @returns length (magnitude) of the Vector
     */
    public getLength(): number {
        return Math.sqrt(this._x * this._x + this._y * this._y);
    }

    /**
     * Returns length of Vector (synonym of [[getLength]])
     * 
     * @returns length (magnitude) of the Vector
     */
    public getMagnitude(): number {
        return this.getLength();
    }

    /**
     * Changes the length of the Vector to 1
     * 
     * @returns current Vector
     */
    public normalize(): Vector {
        let length = this.getLength();
        this._x /= length;
        this._y /= length;
        
        return this;
    }

    /**
     * Limits the length of a Vector, trucates it if necessary
     * @param maxLength The maximum length (magnitude) allowed for the Vector
     * 
     * @returns current Vector
     */
    public truncate(maxLength: number): Vector {
        let length = this.getLength();
        if (maxLength < length) {
            this.multiply(maxLength / length);
        }

        return this;
    }

    /**
     * Multiplies the length of the Vector
     * @param value Multiplier
     * 
     * @returns Current Vector
     */
    public multiply(value: number): Vector {
        this._x *= value;
        this._y *= value;

        return this;
    }

    /**
     * Multiplies the length of the Vector (synonym of [[multiply]])
     * @param value Multiplier
     * 
     * @returns Current Vector
     */
    public scale(value: number): Vector {
        return this.multiply(value);
    }


    /**
     * Rotates Vector
     * @param degrees Rotation angle in degrees
     * 
     * @returns Current Vector
     */
    public rotate(degrees: number): Vector {
        return this.rotateRad(degrees * Math.PI / 180);
    }


    /**
     * Rotates Vector
     * @param rad Rotation angle in radians
     * 
     * @returns Current Vector
     */
    public rotateRad(rad: number): Vector {

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
     * @param v Relative to this vector
     * 
     * @returns The direction of the Vector in degrees
     */
    public getAngle(v?: Vector): number {
        return this.getAngleRad(v) * Vector.RAD_TO_DEGREES;
    }

    /**
     * Returns the direction of the Vector. A zero-length Vector has an angle of 0
     * @param v Relative to this vector
     * 
     * @returns The direction of the Vector in radians
     */
    public getAngleRad(v?: Vector): number {

        let res: number = - Math.atan2(this._y, this._x);
        if (v != null) {
            res += Math.atan2(v.x, v.x);
        }

        return res;
    }


    /**
     * Returns a normal Vector
     * 
     * @returns A new orthogonal Vector
     */
    public getNormal(): Vector {
        return new Vector(-this._y, this.x);
    }


    /**
     * Returns the dot product of vectors
     * @param v Second vector
     * 
     * @returns dot product
     */
    public getDotProduct(v: Vector): number {
        return this._x * v.x + this._y * v.y;
    }

    /**
     * Returns the orthogonal projection on provided vector
     * @param v Projection Vector. Resulting Vector is collinear to this one
     */
    public getProjection(v: Vector): Vector {

        if (v.x == 0) {
            return new Vector(0, this._y);
        }

        if (v.y == 0) {
            return new Vector(this._x, 0);
        }

        let dotProduct: number = this.getDotProduct(v);
        if (dotProduct == 0) {
            // Orthogonal vectors
            return new Vector(0, 0);
        }

        let coeff: number = dotProduct / (v.x * v.x + v.y * v.y);
        
        return new Vector(coeff * v.x, coeff * v.y);
    }


    /**
     * Clones current Vector
     * 
     * @returns A copy of current Vector
     */
    public clone(): Vector {
        return new Vector(this._x, this._y);
    }
}


export interface Shape<T> {

    x: number;
    y: number;
    /** Rotation of Shape in radians */
    angle: number;

    /**
     * Translates current Shape to relative coordinates
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     * 
     * @returns Current Shape
     */
    move(newX: number, newY: number): T;
    /**
     * Translates current Shape to relative coordinates
     * @param vect Vector to add
     * 
     * @returns Current Shape
     */
    move(vect: Vector): T;

    /**
     * Translates current Shape to absolute coordinates
     * @param newX New abscissa
     * @param newY New ordinate
     *
     * @returns Current Shape
     */
    moveTo(newX: number, newY: number): T;
    /**
     * Translates current Shape to absolute coordinates
     * @param point New origin for Rectangle
     *
     * @returns Current Shape
     */
    moveTo(point: Point): T;

    /**
     * Scales shape
     * @param ratio Scale ratio
     * 
     * @returns Current Shape
     */
    scale(ratio: number): T;

    /**
     * Rotates shape
     * @param angle new angle for shape in degrees
     * 
     * @returns Current Shape
     */
    rotate(angle: number): T;


    /**
     * Rotates shape
     * @param angle new angle for shape in radians
     * 
     * @returns Current Shape
     */
    rotateRad(angle: number): T;


    /**
     * Clones current Shape
     * 
     * @returns A copy of current Shape
     */
    clone(): T;

    /**
     * Checks if a point is within the bounds (inclusive) of a Shape
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Spahe
     */
    contains(p: Point): boolean;
    /**
     * Checks if a point is within the bounds (inclusive) of a Shape
     * @param coordX Abscissa to check
     * @param coordY Ordinate to check
     * 
     * @returns true only if Point is inside current Spahe
     */
    contains(coordX: number, coordY: number): boolean;

    /**
     * Checks if current Shape collides with another one
     * @param shape Shape to check
     * 
     * @returns true only if shapes collide
     */
    collides(s: Shape<any>): boolean;
}


/**
 * Represents a Rectangle
 */
export class Rectangle implements Shape<Rectangle> {

    protected halfWidth: number;
    protected halfHeight: number;


    /**
     * Creates a new Rectangle
     * @param _x Abscissa of center
     * @param _y Ordinate of center
     * @param _width width of Rectangle
     * @param _height height of Rectangle
     * @param _angle rotation
     */
    constructor(private _x: number = 0, private _y: number = 0, 
        private _width: number = 0, private _height: number = 0, 
        private _angle: number = 0) {

        this.halfWidth = _width / 2;
        this.halfHeight = _height / 2;
    }
 
    /**
     * Helper method to create a rectangle from its upper-left corner
     * @param x Abscissa of upper-left corner
     * @param y Ordinate of upper-left corner
     * @param width width of Rectangle
     * @param height height of Rectangle
     * 
     * @returns Corresponding Rectangle
     */
    static asRect(x: number, y: number, width: number, height): Rectangle {
        return new Rectangle(x + width / 2, y + height / 2, width, height);
    }


    /** Abscissa of the center of the rectangle */
    get x(): number {
        return this._x;
    }

    /** Ordinate of the center of the rectangle */
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

    get angle(): number {
        return this._angle;
    }

    /**
     * Translates current Rectangle to relative coordinates
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     * 
     * @returns Current Rectangle
     */
    public move(coordX: number, coordY: number): Rectangle;
    /**
     * Translates current Rectangle to relative coordinates
     * @param vect Vector to add
     * 
     * @returns Current Rectangle
     */
    public move(vect: Vector): Rectangle;
    public move(coordXOrVect: number | Vector, coordY?: number): Rectangle {
        if (typeof(coordXOrVect) === 'number') {
            this._x += coordXOrVect;
            this._y += coordY;
        } else {
            this._x += coordXOrVect.x;
            this._y += coordXOrVect.y;
        }

        return this;
    }

    /**
     * Translates current Rectangle to absolute coordinates
     * @param newX New abscissa
     * @param newY New ordinate
     *
     * @returns Current Rectangle
     */
    public moveTo(coordX: number, coordY: number): Rectangle;
    /**
     * Translates current Rectangle to absolute coordinates
     * @param point New origin for Rectangle
     *
     * @returns Current Rectangle
     */
    public moveTo(point: Point): Rectangle;
    public moveTo(coordXOrPoint: number | Point, coordY?: number): Rectangle {
        if (typeof(coordXOrPoint) === 'number') {
            this._x = coordXOrPoint;
            this._y = coordY;
        } else {
            this._x = coordXOrPoint.x;
            this._y = coordXOrPoint.y;
        }

        return this;
    }

    /**
     * Changes size of Rectangle
     * @param newWidth New width
     * @param newHeight New height
     * 
     * @returns Current Rectangle
     */
    public resize(newWidth: number, newHeight: number): Rectangle {
        this._width = newWidth;
        this._height = newHeight;

        this.halfWidth = newWidth / 2;
        this.halfHeight = newHeight / 2;

        return this;
    }

    /**
     * Scales rectangle
     * @param ratio Scale ratio
     * 
     * @returns Current Rectangle
     */
    public scale(ratio: number): Rectangle {

        let newWidth: number = this._width * ratio;
        let newHeight: number = this._height * ratio;

        this._width = newWidth;
        this._height = newHeight;

        this.halfWidth = newWidth / 2;
        this.halfHeight = newHeight / 2;

        return this;
    }


    /**
     * Rotates Rectangle
     * @param angle New rotation in degrees
     * 
     * @returns Current Rectangle
     */
    public rotate(angle: number): Rectangle {
        this._angle = angle * Math.PI / 180;
        return this;
    }

    /**
     * Rotates Rectangle
     * @param angle New rotation in radians
     * 
     * @returns Current Rectangle
     */
    public rotateRad(angle: number): Rectangle {
        this._angle = angle;
        return this;
    }


    /**
     * Resets Rectangle dimensions
     * @param newX New abscissa
     * @param newY New ordinate
     * @param newWidth New width
     * @param newHeight New height
     * @param newAngle New rotation
     * 
     * @returns Current Rectangle
     */
    public reset(newX: number, newY: number, newWidth: number, newHeight: number, newAngle: number = 0): Rectangle {
        this._x = newX;
        this._y = newY;
        this._width = newWidth;
        this._height = newHeight;
        this._angle = newAngle;

        this.halfWidth = newWidth / 2;
        this.halfHeight = newHeight / 2;

        return this;
    }

    /**
     * Clones current Rectangle
     * 
     * @returns A copy of current Rectangle
     */
    public clone(): Rectangle {
        return new Rectangle(this._x, this._y, this._width, this.height, this._angle);
    }

    /**
     * Checks if a point is within the bounds (inclusive) of a Rectangle
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Rectangle
     */
    public contains(p: Point): boolean;
    public contains(coordX: number, coordY: number): boolean;
    public contains(coordXOrPoint: number | Point, coordY?: number): boolean {

        let x: number, y: number;
        if (typeof(coordXOrPoint) === 'number') {
            x = coordXOrPoint;
            y = coordY;
        } else {
            x = coordXOrPoint.x;
            y = coordXOrPoint.y;
        }

        x -= this.x;
        y -= this.y;

        if (this.angle != 0) {
            // Rotation
            let v: Vector = new Vector(x, y).rotateRad(-this.angle);
            x = v.x;
            y = v.y;
        }

        return Math.abs(x) <= this.halfWidth && Math.abs(y) <= this.halfHeight;
    }

    /**
     * Checks if Rectangle collides another shape
     * @param shape Shape to check
     * 
     * @returns true only if provided shape collides current Rectangle
     */
    public collides(shape: Shape<any>): boolean {

        if (shape instanceof Rectangle) {
            // Get vertices
            let vert1: Array<Point> = this.getVertices();
            let vert2: Array<Point> = shape.getVertices();

            let sideNormal: Vector;
            let ref: number;
            let foundSepAxis: boolean;

            // Check first Rectangle
            for (let i = 0; i < 4; i++) {
                sideNormal = new Vector(vert1[i], vert1[(i + 1) % 4]).getNormal();
                ref = (sideNormal.x * (vert1[(i + 2) % 4].x - vert1[i].x) + sideNormal.y * (vert1[(i + 1) % 4].y - vert1[i].y)) > 0 ? 1 : -1;

                for (let j = 0; j < 4; j++) {
                    foundSepAxis = true;
                    if (ref == ((sideNormal.x * (vert2[j].x - vert1[i].x) + sideNormal.y * (vert2[j].y - vert1[i].y)) > 0 ? 1 : -1)) {
                        foundSepAxis = false;
                        break;
                    }
                }
                if (foundSepAxis) return false;
            }
            // Check second Rectangle
            for (let i = 0; i < 4; i++) {
                sideNormal = new Vector(vert2[i], vert2[(i + 1) % 4]).getNormal();
                ref = (sideNormal.x * (vert2[(i + 2) % 4].x - vert2[i].x) + sideNormal.y * (vert2[(i + 1) % 4].y - vert2[i].y)) > 0 ? 1 : -1;

                for (let j = 0; j < 4; j++) {
                    foundSepAxis = true;
                    if (ref == ((sideNormal.x * (vert1[j].x - vert2[i].x) + sideNormal.y * (vert1[j].y - vert2[i].y)) > 0 ? 1 : -1)) {
                        foundSepAxis = false;
                        break;
                    }
                }

                if (foundSepAxis) return false;
            }

            // No separating axis found => Rectangles collision
            return true;

        } else if (shape instanceof Circle) {
            let c: Circle = <Circle>shape;

            let x: number = c.x - this.x;
            let y: number = c.y - this.y;

            if (this.angle != 0) {
                // Rotation
                let v: Vector = new Vector(x, y).rotateRad(-this.angle);
                x = v.x;
                y = v.y;
            }

            x = Math.abs(x);
            y = Math.abs(y);

            // Check trivial cases
            if (x > this.halfWidth + c.radius) return false;
            if (y > this.halfHeight + c.radius) return false;
            if (x <= this.halfWidth) return true;
            if (y <= this.halfHeight) return true;

            // Check corner
            return (x - this.halfWidth) * (x - this.halfWidth) + (y - this.halfHeight) * (y - this.halfHeight) <= c.radius * c.radius;
        } else {
            // Call other side (Same as previous case with Rectangle)
            // Non trivial shapes implementations should take care of loops
            return shape.collides(this);
        }
    }


    /**
     * lists vertices of the rectangle
     * 
     * @Returns Vertices of the Rectangle, two adjacents vertices in the array form an edge of the Rectangle
     */
    public getVertices(): Array<Point> {
        let vertices: Array<Point> = new Array<Point>();

        let cos: number = Math.cos(this._angle);
        let sin: number = Math.sin(this._angle);

        let x1: number = this.halfWidth * cos - this.halfHeight * sin;
        let y1: number = this.halfWidth * sin + this.halfHeight * cos;
        let x2: number = this.halfWidth * cos + this.halfHeight * sin;
        let y2: number = this.halfWidth * sin - this.halfHeight * cos;

        vertices.push(new Point(x1 + this._x, y1 + this._y));
        vertices.push(new Point(x2 + this._x, y2 + this._y));
        vertices.push(new Point(this._x - x1, this._y - y1));
        vertices.push(new Point(this._x - x2, this._y - y2));

        return vertices;
    }
}


export class Circle implements Shape<Circle> {
    /**
     * Creates a new Circle
     * @param _x Abscissa of center
     * @param _y Ordinate of center
     * @param _radius Radius of circle
     * @param _angle Rotation
     */
    constructor(private _x: number = 0, private _y: number = 0, 
        private _radius: number = 0, private _angle = 0) {
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

    get angle(): number {
        return this._angle;
    }

    /**
     * Translates current Circle to relative coordinates
     * @param newX Added to current abscissa
     * @param newY Added to current ordinate
     * 
     * @returns Current Circle
     */
    public move(coordX: number, coordY: number): Circle;
    /**
     * Translates current Circle to relative coordinates
     * @param vect Vector to add
     * 
     * @returns Current Circle
     */
    public move(vect: Vector): Circle;
    public move(coordXOrVect: number | Vector, coordY?: number): Circle {
        if (typeof(coordXOrVect) === 'number') {
            this._x += coordXOrVect;
            this._y += coordY;
        } else {
            this._x += coordXOrVect.x;
            this._y += coordXOrVect.y;
        }

        return this;
    }

    /**
     * Translates current Circle to absolute coordinates
     * @param newX New abscissa
     * @param newY New ordinate
     *
     * @returns Current Circle
     */
    public moveTo(coordX: number, coordY: number): Circle;
    /**
     * Translates current Circle to absolute coordinates
     * @param point New origin for Circle
     *
     * @returns Current Circle
     */
    public moveTo(point: Point): Circle;
    public moveTo(coordXOrPoint: number | Point, coordY?: number): Circle {
        if (typeof(coordXOrPoint) === 'number') {
            this._x = coordXOrPoint;
            this._y = coordY;
        } else {
            this._x = coordXOrPoint.x;
            this._y = coordXOrPoint.y;
        }

        return this;
    }


    /**
     * Changes size of Circle
     * @param newRadius New radius
     * 
     * @returns Current Circle
     */
    public scale(newRadius: number): Circle {
        this._radius = newRadius;

        return this;
    }

    /**
     * Rotates Circle
     * @param angle New rotation in degrees
     * 
     * @returns Current Circle
     */
    public rotate(angle: number): Circle {
        this._angle = angle * Math.PI / 180;
        return this;
    }

    /**
     * Rotates Circle
     * @param angle New rotation in radians
     * 
     * @returns Current Circle
     */
    public rotateRad(angle: number): Circle {
        this._angle = angle;
        return this;
    }



    /**
     * Resets Circle dimensions
     * @param newX New abscissa of center
     * @param newY New ordinate of center
     * @param newWidth New radius
     * @param newAngle New rotation
     * 
     * @returns Current Circle
     */
    public reset(newX: number, newY: number, newRadius: number, newAngle: number = 0): Circle {
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
    public clone(): Circle {
        return new Circle(this._x, this._y, this._radius, this._angle);
    }


    /**
     * Checks if a point is within the bounds (inclusive) of a Circle
     * @param p Point to check
     * 
     * @returns true only if Point is inside current Circle
     */
    public contains(p: Point): boolean;
    public contains(coordX: number, coordY: number): boolean;
    public contains(coordXOrPoint: number | Point, coordY?: number): boolean {
        if (typeof(coordXOrPoint) === 'number') {
            return (coordXOrPoint - this._x) * (coordXOrPoint - this._x) + (coordY - this._y) * (coordY - this._y) <= this._radius * this._radius;
        } else {
            return (coordXOrPoint.x - this._x) * (coordXOrPoint.x - this._x) + (coordXOrPoint.y - this._y) * (coordXOrPoint.y - this._y) <= this._radius * this._radius;
        }
    }


    /**
     * Checks if Circle collides another shape
     * @param shape Shape to check
     * 
     * @returns true only if provided shape collides current Circle
     */
    public collides(shape: Shape<any>): boolean {
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
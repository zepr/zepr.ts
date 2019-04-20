/**
 * Interfaces used to declare interest in Mouse/Touch Events
 */

import { Engine } from './engine';
import { Point, Vector } from './geometry';
import { Sprite } from './sprite';
import { GameScreen } from './screen';


/**
 * Defines how engine should manage click/touch events
 */
export enum MouseEventType {
    /** Only provide position on click event */
    BASIC,
    /** Provide list of clicked sprites */
    SPRITES,
    /** Call method `onClick` (interface `Clickable`) on clicked sprites. `Screen` needn't implement `ClickListener` */
    DELEGATE,
    /** Call method `onClick` (interface `Clickable`) on clicked sprites ONLY IF `Screen` implements `ClickListener` */
    DELEGATE_STRICT
}


/**
 * An interface for sprites to manage click events
 */
export interface Clickable {
    /**
     * Called when a user clicks on a sprite and engine is in delegate mode
     * @param engine A reference to the active engine 
     * @param screen Current screen
     * @param point The global position of the click
     */
    onClick(engine: Engine, screen: GameScreen, point: Point): void;
}



/**
 * Every Screen interested in click events must implement this interface (Except when DELEGATE mode is used).
 * Click event listener must be activated in Engine :
 * ```javascript
 * // Not interested in clicked sprites
 * engine.enableMouseControl(); // Equivalent to engine.enableMouseControl(MouseEventType.BASIC);
 * ```
 * It's possible to capture the list of sprites clicked by setting the optional argument to true
 * ```javascript
 * // Capture sprites
 * engine.enableMouseControl(MouseEventType.SPRITES);
 * ```
 * Sprites may also manage their behaviour themselves
 * ```javascript
 * // Capture sprites
 * engine.enableMouseControl(MouseEventType.DELEGATE);
 * ```
 * When `MouseEventType.DELEGATE` is used, `Screen` needn't implement `ClickListener` interface
 * To enforce declaration of interface, use `MouseEventType.DELEGATE_STRICT`.
 * Screen declaration of `onClick` is called BEFORE any sprite, can cancel delegation by returning `false`. 
 */
export interface ClickListener {
    /**
     * Called when a user clicks on the screen
     * @param engine A reference to the active engine 
     * @param point The position of the click
     * @param sprites The list of sprites under the click, if capture is enabled
     * 
     * @returns true if `Sprite.onClick` method should be called in DELEGATE mode
     */
    onClick(engine: Engine, point: Point, sprites: Array<Sprite<any>>): boolean;
}


/**
 * Every Screen interested in drag events must implement this interface.
 * Drag event listener must be activated in Engine.
 * ```javascript
 * engine.enableMouseDrag();
 * ```
 */
export interface DragListener {
    /**
     * Called when a user drags
     * @param engine A reference to the active engine 
     * @param move Movement registered since last method call
     */
    onDrag(engine: Engine, move: Vector): void;

    /**
     * Called when a user ends drag
     * @param engine A reference to the active engine 
     */
    onDrop(engine: Engine): void;
}

/**
 * Every Screen interested in zoom events must implement this interface.
 * Zoom event listener must be activated in Engine.
 * ```javascript
 * engine.enableZoomControl();
 * ```
 * Default min and max zoom levels are set to 0.1 and 10 respectively.
 */
export interface ZoomListener {
    /**
     * Called when a user zoom (mouse wheel or screen pinch)
     * @param engine A reference to the active engine
     * @param ratio Ratio registered since last method call
     */
    onZoom(engine: Engine, ratio: number): void;
}

/**
 * Interfaces associated with screens
 */

/**
 * 
 */

import { Engine } from './engine';
import { Point, Vector } from './geometry';
import { Sprite } from './sprite';

/**
 * Mandatory interface for screens
 */
export interface GameScreen {

    /** Images to preload */
    images?: Array<string>;
    /** Sounds to preload */
    sounds?: Array<string>;

    /** 
     * Initialises scene. This method is called each time the screen is activated
     * @param engine A reference to the active engine
     */
    init(engine: Engine): void;

    /** 
     * Main method. Called on each frame
     * @param engine A reference to the active engine
     */
    run(engine: Engine): void;
}

/**
 * Every Screen interested in click events must implement this interface.
 * Click event listener must be activated in Engine.
 * ```javascript
 * // Not interested in clicked sprites
 * engine.enableMouseControl();
 * ```
 * It's possible to capture the list of sprites clicked by setting the optional argument to true
 * ```javascript
 * // Capture sprites
 * engine.enableMouseControl(true);
 * ```
 */
export interface ClickListener {
    /**
     * Called when a user clicks on the screen
     * @param engine A reference to the active engine 
     * @param point The position of the click
     * @param sprites The list of sprites under the click, if capture is enabled
     */
    onClick(engine: Engine, point: Point, sprites: Array<Sprite<any>>): void;
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

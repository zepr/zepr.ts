/**
 * Screen interface
 */

import { Core } from './core';

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
     * @param core A reference to the active engine core
     */
    init(core: Core): void;

    /** 
     * Main method. Called on each frame
     * @param core A reference to the active engine core
     * @param deltaTime Delai depuis le dernier appel
     */
    run(core: Core, deltaTime?: number): void;
}

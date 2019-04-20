/**
 * A simple helper to manage fullscreen mode. Fullscreen mode requires a user gesture. 
 * `request()` MUST be called within `screen.onClick()`, `sprite.onClick()` or similar method
 */

export class Fullscreen {
    private static requestFullscreen: any = document.documentElement.requestFullscreen 
        || (<any>document.documentElement).mozRequestFullScreen 
        || (<any>document.documentElement).webkitRequestFullScreen
        || (<any>document.documentElement).msRequestFullscreen;

    private static exitFullscreen: any = document.exitFullscreen 
        || (<any>document).mozRequestFullScreen 
        || (<any>document).webkitRequestFullScreen
        || (<any>document).msRequestFullscreen;

    /**
     * Checks if screen is in fullscreen mode
     * 
     * @returns true if fullscreen is active
     */
    static isActive(): boolean {
        let elem: any = document.fullscreenElement         
        || (<any>document).mozFullScreenElement
        || (<any>document).webkitFullScreenElement
        || (<any>document).msFullscreenElement;

        return elem != null;
    }

    /**
     * Requests fullscreen mode
     * 
     * @returns true if the request is made
     */
    static request(): boolean {
        if (this.isActive()) return false;
        this.requestFullscreen.call(document.documentElement);
        return true;
    }

    /**
     * Exits fullscreen mode
     * 
     * @returns true if the request is made
     */
    static exit(): boolean {
        if (!this.isActive()) return false;
        this.exitFullscreen.call(document);
    }

    /**
     * Toggles fullscreen state
     * 
     * @returns state of fullscreen mode after call (equivalent to `isActive`)
     */
    static toggle(): boolean {
        if (this.isActive()) {
            this.exitFullscreen.call(document);
            return false;
        } 

        this.requestFullscreen.call(document.documentElement);
        return true;
    }
}
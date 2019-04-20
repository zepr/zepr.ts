import { Point, Vector } from './geometry';
import { ClickListener, ZoomListener, DragListener, MouseEventType, Clickable } from './mouse';
import { Sprite } from './sprite';
import { Core } from './core';
import { LoaderScreen } from './loader';


/**
 * A simple state transition class
 */
class State {
    /** Current state */
    public current: number;
    /** Next state */
    public next: number;
}

/**
 * Defines the engine used to render scenes (aka [[GameScreen]]s) with support for mouse and touch events.
 */
export class Engine extends Core {

    /** Mouse control enabled */
    private mouseEnabled: boolean;
    /** Mouse control enabled with sprites */
    private mouseEventType: MouseEventType;
    /** Zoom (scroll / touch) */
    private zoomEnabled: boolean;

    /** Last mouse event */
    //private mouseEvent: Point;
    /** Mouse movement control enabled */
    private mouseMoveEnabled: boolean;
    /** Current mouse movement */
    private mouseMovement: Vector;
    /** Previous position */
    private mousePrevious: Point;
    /** Whether drag is complete */
    private endDrag: boolean = false;

    /** Current zoom state */
    private zoomState: State;
    /** Current touch zoom state */
    private touchZoomState: State;

    /** Minimum zoom value */
    private minZoom: number;
    /** Maximum zoom value */
    private maxZoom: number; 
    /** Is touch currently used to zoom  */
    private isTouchZoom: boolean;

    /** Functions used to manage events */
    private eventMap: Map<string, (event: MouseEvent | TouchEvent) => void>;

    /**
     * Defines a Engine with mouse/touch management. The scene is always maximized and centered on screen with preservation of its aspect ratio (Adds borders when needed)
     * @param width Scene width
     * @param height Scene height
     * @param loader Optional custom screen loader
     */
    public constructor(width: number, height: number, loader?: LoaderScreen) {
        super(width, height, loader);

        // Init function list
        this.eventMap = new Map<string, (event: MouseEvent | TouchEvent) => void>();
        this.eventMap.set('down', this.onDown.bind(this));
        this.eventMap.set('up', this.onUp.bind(this));
        this.eventMap.set('move', this.onMove.bind(this));
        this.eventMap.set('zoom', this.onZoom.bind(this));
        this.eventMap.set('endZoom', this.onEndZoom.bind(this));
    }


    protected run(time: number): void {
        super.run(time);

        // No mouse event with loader screen
        if (this.screen == null) return;

        // Manage mouse zoom/drag
        let uncasted = <any>this.screen;

        if (this.zoomEnabled && this.touchZoomState.next != 0 && this.touchZoomState.current != this.touchZoomState.next) {
            if (this.touchZoomState.current != 0) {
                this.zoomState.next *= this.touchZoomState.next / this.touchZoomState.current;
            }
            this.touchZoomState.current = this.touchZoomState.next;
        }

        if (this.zoomState.next < this.minZoom) { this.zoomState.next = this.minZoom };
        if (this.zoomState.next > this.maxZoom) { this.zoomState.next = this.maxZoom };

        if (this.zoomEnabled && this.zoomState.current != this.zoomState.next) {
            if (uncasted.onZoom !== undefined) {
                let zoomScreen: ZoomListener = <ZoomListener>uncasted;
                zoomScreen.onZoom(this, this.zoomState.next);
            }

            this.zoomState.current = this.zoomState.next;
        }

        if (this.mouseEnabled && !this.isTouchZoom
            && uncasted.onDrag !== undefined && !this.mouseMovement.isZeroLength()) {

            let dragScreen: DragListener = <DragListener>uncasted;
            dragScreen.onDrag(this, this.mouseMovement);
            this.mouseMovement.set(0, 0);
        }

        // End drag
        if (this.endDrag) {
            this.endDrag = false;
            if (uncasted.onDrop !== undefined) {
                (<DragListener>uncasted).onDrop(this);
            }
        }    
    }


    protected reset(): void {
        // Mouse
        this.mouseMovement = new Vector(0, 0);
        
        // Zoom
        this.zoomState = new State();
        this.zoomState.current = 1;
        this.touchZoomState = new State();
        this.touchZoomState.current = 0;
        this.isTouchZoom = false;        

        super.reset();
    }


    /**
     * Defines new zoom value. Ignored without [[enableZoomControl]]
     * @param newZoom New zoom value, within the minZoom - maxZoom limits
     */
    public setZoom(newZoom: number): void {
        this.zoomState.next = newZoom;
    }


    /**
     * Enables mouse and touch click events. Current Screen must implement ClickListener interface
     * @param eventType How mouse events should be managed
     */
    public enableMouseControl(eventType: MouseEventType | boolean = MouseEventType.BASIC): void {

        if (!this.mouseEnabled) {
            window.addEventListener<'mousedown'>('mousedown', this.eventMap.get('down'), { passive: false });
            window.addEventListener<'touchstart'>('touchstart', this.eventMap.get('down'), { passive: false });

            this.mouseEnabled = true;
        }

        if (eventType == null) {
            this.mouseEventType = MouseEventType.BASIC;
        } else if (typeof eventType === 'boolean') {
            this.mouseEventType = eventType ? MouseEventType.SPRITES : MouseEventType.BASIC;
        } else {
            this.mouseEventType = eventType;
        }
    }

    /**
     * Disables mouse and touch click events. 
     */
    public disableMouseControl(): void {
        if (this.mouseEnabled) {
            window.removeEventListener<'mousedown'>('mousedown', this.eventMap.get('down'));
            window.removeEventListener<'touchstart'>('touchstart', this.eventMap.get('down'));

            this.mouseEnabled = false;
        }
    }

    /**
     * Enables mouse and touch drag events. Current Screen must implement DragListener interface.
     */
    public enableMouseDrag(): void {
        this.enableMouseControl(this.mouseEventType); // Mandatory
        this.mouseMoveEnabled = true;
    }

    /**
     * Disables mouse and touch drag events.
     */
    public disableMouseDrag(): void {
        this.mouseMoveEnabled = false; // TODO : Voir effet de bord si desactivation en cours de cycle
    }

    /**
     * Enables mouse wheel and touch pinch events. Current Screen must implement ZoomListener interface.
     */
    public enableZoomControl(minZoom: number = 0.1, maxZoom: number = 10): void {

        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        
        if (!this.zoomEnabled) {
            this.touchZoomState.next = this.touchZoomState.current;
            this.zoomState.next = this.zoomState.current;

            if (!this.mouseEnabled) {
                // this.mouseEnabled not updated
                window.addEventListener<'touchstart'>('touchstart', this.eventMap.get('down'), { passive: false });
            }

            window.addEventListener<'wheel'>('wheel', this.eventMap.get('zoom'), { passive: false });
            window.addEventListener<'touchmove'>('touchmove', this.eventMap.get('zoom'), { passive: false });
            window.addEventListener<'touchend'>('touchend', this.eventMap.get('endZoom'), { passive: false });

            this.zoomEnabled = true;
        }
    }

    /**
     * Disables mouse wheel and touch pinch events.
     */
    public disableZoomControl(): void {
        if (this.zoomEnabled) {
            if (!this.mouseEnabled) {
                // this.mouseEnabled not updated
                window.removeEventListener<'touchstart'>('touchstart', this.eventMap.get('down'));
            }
            window.removeEventListener<'wheel'>('wheel', this.eventMap.get('zoom'));
            window.removeEventListener<'touchmove'>('touchmove', this.eventMap.get('zoom'));
            window.removeEventListener<'touchend'>('touchend', this.eventMap.get('endZoom'));

            this.zoomEnabled = false;
        }
    }

    /**
     * Listens zoom events
     * @param event Source event
     */
    protected onZoom(event: WheelEvent | TouchEvent): void {

        event.preventDefault();

        if (event instanceof WheelEvent) {
            if (event.deltaY > 0) {
                this.zoomState.next /= Engine.ZOOM_RATIO;
            } else {
                this.zoomState.next *= Engine.ZOOM_RATIO;
            }

        } else { // TouchEvent
            if (event.touches.length > 1) {
                this.isTouchZoom = true;
                this.touchZoomState.next = new Vector(
                    event.touches.item(0).pageX - event.touches.item(1).pageX,
                    event.touches.item(0).pageY - event.touches.item(1).pageY
                ).getLength();
            }
        }
    }

    /**
     * Reset state when zoom touch ends
     * @param event Source event
     */
    protected onEndZoom(event: TouchEvent): void {
        this.touchZoomState.current = 0;
        this.touchZoomState.next = 0;
        if (event.touches.length == 0) {
            this.isTouchZoom = false;
        }    
    }

    /**
     * Converts screen coords of event to Screen coords
     * @param event Source event
     * 
     * @returns The screen coordinates of the event
     */
    private getEventPosition(event: MouseEvent | TouchEvent): Point {
        let x: number = -1, y: number = -1;

        if (event instanceof MouseEvent) {
            x = event.pageX;
            y = event.pageY;   
        } else { // TouchEvent
            if (event.touches.length > 0) {
                let touch = event.touches.item(0);
                x = touch.pageX;
                y = touch.pageY;
            }
        }

        x -= this.coords.x;
        x /= this.coords.width;

        y -= this.coords.y;
        y /= this.coords.height;

        let position: Point = null;
        if (x > 0 && x < 1 && y > 0 && y < 1) {
            position = new Point(x * this.width, y * this.height);
        }

        return position;
    }

    /**
     * Listens mouse down events to manage both click and drag events
     * @param event Source event
     */
    protected onDown(event: MouseEvent | TouchEvent): void {

        event.preventDefault();

        let position: Point = this.getEventPosition(event);

        if (this.zoomEnabled && window.ontouchstart 
            && event instanceof TouchEvent && event.touches.length > 1) {
            
            this.isTouchZoom = true;
            this.touchZoomState.current = new Vector(
                event.touches.item(0).pageX - event.touches.item(1).pageX,
                event.touches.item(0).pageY - event.touches.item(1).pageY
            ).getLength();
            this.touchZoomState.next = 0;
            position = null;
        }

        if (position != null) {
            if (this.mouseMoveEnabled) {
                this.mouseMovement.set(0, 0);
                this.mousePrevious = position.clone();
    
                window.addEventListener<'mousemove'>('mousemove', this.eventMap.get('move'), { passive: false });
                window.addEventListener<'touchmove'>('touchmove', this.eventMap.get('move'), { passive: false });
    
                window.addEventListener<'mouseup'>('mouseup', this.eventMap.get('up'), { passive: false });
                window.addEventListener<'touchend'>('touchend', this.eventMap.get('up'), { passive: false });
            }

            let uncasted: any = <any>this.screen;
            let hasOnClickMethod: boolean = uncasted.onClick !== undefined;

            // Check if current screen supports mouse events
            if (this.mouseEventType == MouseEventType.DELEGATE || hasOnClickMethod) {
                let mouseScreen: ClickListener = <ClickListener>uncasted;

                // List clicked sprites
                let clickedSprites: Array<Sprite<any>> = null;
                if (this.mouseEventType != MouseEventType.BASIC) {
                    clickedSprites = new Array<Sprite<any>>();
                    this.spriteList.forEach((sprite: Sprite<any>): void => {
                        if (sprite.contains(position)) {
                            clickedSprites.push(sprite);
                        }
                    });
                }

                // Call `onClick` method of screen
                let callSprites: boolean = true;
                if (hasOnClickMethod) {
                    callSprites = mouseScreen.onClick(this, position.clone(), clickedSprites);
                }

                // Check for clickable sprites
                if (callSprites
                    && (this.mouseEventType == MouseEventType.DELEGATE || this.mouseEventType == MouseEventType.DELEGATE_STRICT)) {
                    clickedSprites.forEach((spr: Sprite<any>): void => {
                        if ((<any>spr).onClick) {
                            (<Clickable>(<any>spr)).onClick(this, this.screen, position.clone());
                        }
                    });
                }

            }
        }
    }

    /**
     * Listens move events to manage drag events
     * @param event Source event
     */
    protected onMove(event: MouseEvent | TouchEvent): void {
        event.preventDefault();

        if (this.mouseMoveEnabled) {
            let newPosition: Point = this.getEventPosition(event);
            if (newPosition != null) {
                this.mouseMovement.add(newPosition.x - this.mousePrevious.x, newPosition.y - this.mousePrevious.y);
                this.mousePrevious = newPosition;
            }
        }
    }

    /**
     * Listens mouse up events to manage both click and drag events
     * @param event Source event
     */
    protected onUp(event: MouseEvent | TouchEvent): boolean {

        event.preventDefault();

        if (this.mouseMoveEnabled && !this.isTouchZoom) {
            let newPosition: Point = this.getEventPosition(event);
            if (newPosition != null) {
                this.mouseMovement.add(newPosition.x - this.mousePrevious.x, newPosition.y - this.mousePrevious.y);
                this.mousePrevious = newPosition;
            }
        } else {
            this.mouseMovement.set(0, 0);    
        }

        window.removeEventListener<'mousemove'>('mousemove', this.eventMap.get('move'));
        window.removeEventListener<'touchmove'>('touchmove', this.eventMap.get('move'));
        window.removeEventListener<'mouseup'>('mouseup', this.eventMap.get('up'));
        window.removeEventListener<'touchend'>('touchend', this.eventMap.get('up'));

        this.endDrag = true;

        return false;
    }
     
}


/**
 * Exposes text-related classes
 */

/**
 * 
 */
import { Point } from "./geometry";

/** Defines possible text alignments */
export enum TextAlign {
    LEFT,
    RIGHT,
    CENTER,
    JUSTIFY        
};    

/** A simple font definition */
export class Font {

    /**
     * @param _face Font face
     * @param _size Font size
     * @param _color Font color
     */
    public constructor(protected _face: string = 'arial',
        protected _size: number = 12,
        protected _color: string = 'black') {
    }

    /** Font face */
    get face(): string {
        return this._face;
    }

    /** Font size */
    get size(): number {
        return this._size;
    }

    /** Font color */
    get color(): string {
        return this._color;
    }
}


/**
 * Represents a managed paragraph of text. This class is not a Sprite but is easily integrable to one.
 */
export class Text {

    /** Height of the text */
    protected height: number;
    /** Defined space size except for justified text */
    protected space: number;
    /** Defined space size for justified text */
    protected justifySpace: Array<number>;

    /** Text cut in lines of words */
    protected lines: Array<Array<string>>;
    /** Space before first word in line */
    protected lineSpace: Array<number>;

    /** Local rendering canvas (offset buffer) */
    protected localCanvas: HTMLCanvasElement;
    /** Local rendering context */
    protected localCtx: CanvasRenderingContext2D;

    /**
     * @param text Text to render
     * @param position Upper-left corner of text
     * @param width Desired width. Should be at least large enougth to put a word on a line
     * @param font [[Font]] used
     * @param align Alignment type
     */
    public constructor(protected text: string, protected position: Point, 
            protected width: number, protected font: Font = new Font(), 
            protected align: TextAlign = TextAlign.LEFT) {

        this.localCanvas = document.createElement<'canvas'>('canvas');
        this.localCtx = this.localCanvas.getContext('2d');

        this.update();
    }

    /**
     * Updates text properties
     */
    protected update = (): void => {
        this.localCtx.fillStyle = this.font.color;
        this.localCtx.font = this.font.size + 'px ' + this.font.face;
        this.calculate(this.localCtx);
        this.localCanvas.width = this.width;
        this.localCanvas.height = this.height;
        this.localCtx.clearRect(0, 0, this.localCanvas.width, this.localCanvas.height);
        this.prerender(this.localCtx);
    }

    /**
     * calculates text rendering properties
     * @param context Rendering context
     */
    protected calculate = (context: CanvasRenderingContext2D): void => {

        this.lines = new Array<Array<string>>();
        this.lineSpace = new Array<number>();
        this.space = context.measureText(' ').width;
        if (this.align === TextAlign.JUSTIFY) {
            // Default space considered as minimum space 
            // [or this.space = <minimum_width> => check for consequences before setting!!!]
            this.justifySpace = new Array<number>();
        }

        let currentLine: Array<string> = new Array<string>();
        let currentPosition: number = 0; // Current position in line
        let size: number = 0; // Size of current word

        let paragraphs: Array<string> = this.text.split('\n');
        paragraphs.forEach((p: string): void => {
            let words: Array<string> = p.split(' ');
            words.forEach((w: string): void => {
                size = context.measureText(w).width;
                if (currentPosition == 0 || currentPosition + this.space + size <= this.width) {
                    // Add to current line
                    currentLine.push(w);
                    if (currentPosition > 0) {
                        currentPosition += this.space;
                    }
                    currentPosition += size;
                } else {
                    // Current line is complete
                    // Calculate space
                    this.setLineSpace(currentLine, currentPosition, false);

                    // Generate new line
                    this.lines.push(currentLine);
                    currentLine = new Array<string>();
                    currentLine.push(w);
                    currentPosition = size;
                }
            });
            // Add last line of paragraph
            this.setLineSpace(currentLine, currentPosition, true);
            this.lines.push(currentLine);

            currentLine = new Array<string>();
            currentPosition = 0;            
        });

        this.height = this.lines.length * this.font.size + 0.25 * this.font.size;
    }

    /**
     * Calculates line spacing
     * @param currentLine The line to parse
     * @param currentPosition Size of text on line
     * @param lastLine If the line is the last one (Used to avoid oddly justified text)
     */
    protected setLineSpace = (currentLine: Array<string>, currentPosition: number, lastLine: boolean = false): void => {
        switch (this.align) {
            case TextAlign.RIGHT:
                this.lineSpace.push(this.width - currentPosition);
            break;
            case TextAlign.CENTER:
                this.lineSpace.push((this.width - currentPosition) / 2);
            break;
            case TextAlign.JUSTIFY:
                this.lineSpace.push(0);
                if (currentLine.length > 1) {
                    if (lastLine) {
                        this.justifySpace.push(this.space);
                    } else {
                        this.justifySpace.push((this.width - currentPosition + (currentLine.length - 1) * this.space) / (currentLine.length - 1));
                    }
                } else {
                    this.justifySpace.push(0); // No space required
                }
            break;                        
            case TextAlign.LEFT:
            default:
                this.lineSpace.push(0);
            break;                        
        }
    }

    /**
     * Retrieves height of the text block.
     * 
     * @returns Text height
     */
    public getHeight = (): number => {
        return this.height;
    }


    /**
     * Renders text on an offscreen canvas
     * @param context Rendering context
     */
    protected prerender = (context: CanvasRenderingContext2D): void => {
        this.localCtx.fillStyle = this.font.color;
        this.localCtx.font = this.font.size + 'px ' + this.font.face; 

        let px: number, py: number = 0;
        for (let i: number = 0; i < this.lines.length; i++) {
            py += this.font.size;
            px = this.lineSpace[i];

            this.lines[i].forEach((w: string): void => {
                context.fillText(w, px, py);
                // TODO : Stocker
                px += context.measureText(w).width;
                if (this.align === TextAlign.JUSTIFY) {
                    px += this.justifySpace[i];
                } else {
                    px += this.space;
                }
            });
        }
    }

    /**
     * Renders text on client canvas. useful for [[Sprite]] integration
     * @param context Rendering context
     */
    public render = (context: CanvasRenderingContext2D): void => {
        context.drawImage(this.localCanvas, this.position.x, this.position.y);
    }    
}
/**
 * Exposes sound-related functions
 */

/**
 * 
 */


/**
 * Each instance can manage a sound or music for the duration of the application
 */
export class Sound {

	/** Global audioContext */
    protected static readonly context: AudioContext = new ((<any>window).AudioContext || (<any>window).webkitAudioContext)();
	/** Memory buffer of audio file */
    protected data: AudioBuffer;
	/** Source used to play sound */
    protected source: AudioBufferSourceNode;
	/** Load status */
	protected _complete: boolean;
	
	/** Checks if audio read is complete. Complete does not mean playable! */
    get complete(): boolean {
        return this._complete;
    }

	/**
	 * Initialises instance with the managed sound.
	 * @param fileUrl url of the sound file
	 */
    public constructor(fileUrl: string) {
        this._complete = false;

        let req: XMLHttpRequest = new XMLHttpRequest();
		req.open('get', fileUrl, true);
  		req.responseType = 'arraybuffer';
		req.onload = (): void => {
			try {
				Sound.context.decodeAudioData(req.response, 
                    (buf: AudioBuffer): void => {
                        this.data = buf;
                        this._complete = true;
                    },
					(exception: DOMException): void => {
                        console.log('Unable to decode file [' + fileUrl + ']');
                        this._complete = true;
					}
				);
			} catch (exception) {
				console.log('Unable to decode file [' + fileUrl + ']');
				this._complete = true; 				
			}
		}
		req.onerror = (execption: ErrorEvent): void => {
			console.log('Unable to decode file [' + fileUrl + ']');
			this._complete = true;
		}
  		req.send();        
    }

	/**
	 * Plays sound 
	 * @param loop if the sound or music should be looped
	 * 
	 * @returns true if the data is available and the command was executed
	 */
	public play = (loop: boolean = false): boolean => {
		if (this.data) {
			this.source = Sound.context.createBufferSource();
			this.source.buffer = this.data;
			this.source.connect(Sound.context.destination);
			this.source.loop = loop;

			this.source.start();
			return true;
        }
		return false;
    }
	
	/**
	 * Stops sound
	 * 
	 * @returns true if the last command was [[play]]
	 */
	public stop = (): boolean => {
		if (this.source) {
			this.source.stop();
            this.source = null;
            return true;
        }
        return false;
	}    
}
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
	protected static context: AudioContext;
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
		
		// Initialise static AudioContext -if needed-
		if (Sound.context == null) {
			if ((<any>window).AudioContext) {
				Sound.context = new (<any>window).AudioContext();
			} else if ((<any>window).webkitAudioContext) {
				Sound.context = new (<any>window).webkitAudioContext();
			}
		}

		// Load sound if browser can play sound
		if (Sound.context) {
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
			req.onerror = exception => {
				console.log('Unable to decode file [' + fileUrl + ']');
				this._complete = true;
			}
			req.send();
		} else {
			this._complete = true;
		}
    }

	/**
	 * Plays sound 
	 * @param loop if the sound or music should be looped
	 * 
	 * @returns true if the data is available and the command was executed
	 */
	public play = (loop: boolean = false): boolean => {

		let success: boolean = false;

		if (this.data) {
			if (Sound.context.state === 'suspended') { // Chrome autoplay policy
				Sound.context.resume().then(() => { this._play(loop); success = true; });
			} else {
				this._play(loop);
				success = true;
			}
		}
		
		return success;
	}
	
	/**
	 * Internal method to play sound
	 * @param loop if the sound or music should be looped
	 */
	private _play = (loop: boolean = false): void => {

		if (this.source) {
			// Don't stop sample if already playing
			// But at least prevent unwanted looping
			this.source.loop = false;
		}

		this.source = Sound.context.createBufferSource();
		this.source.buffer = this.data;
		this.source.connect(Sound.context.destination);
		this.source.loop = loop;

		this.source.start();
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
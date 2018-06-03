export class Sound {

    protected static readonly context: AudioContext = new AudioContext();

    protected data: AudioBuffer;

    protected source: AudioBufferSourceNode;

    protected _complete: boolean;
    get complete(): boolean {
        return this._complete;
    }

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
    
	public stop = (): boolean => {
		if (this.source) {
			this.source.stop();
            this.source = null;
            return true;
        }
        return false;
	}    
}
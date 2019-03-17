/**
 * Exposes network-related functions
 */

/**
 * 
 */

/**
 * Simple ajax functions
 */
export class Net {

    /**
     * Async xhr GET call 
     * @param url url of service
     * @param callback Callback method
     */
    public static get = (url: string, callback: (message: any) => void): void => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.responseText != 'undefined' ) {
                let json: any;
                try {
                    json = JSON.parse(xhr.responseText);
                } catch(e) {
                }
                
                if (json != null) {
                    callback(json);
                }
            }
        };
        xhr.send();
    }

    /**
     * Async xhr POST call 
     * @param url url of service
     * @param content Request body. Content is serialized in Json
     * @param callback Callback method
     */
    public static post = (url: string, content: any, callback: (message: any) => void): void => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.responseText != 'undefined' ) {
                let json: any;
                try {
                    json = JSON.parse(xhr.responseText);
                } catch(e) {
                }
                
                if (json != null) {
                    callback(json);
                }
            }
        };
        xhr.send(JSON.stringify(content));
    }
}
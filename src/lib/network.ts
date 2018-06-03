export class Net {

    public static get = (url: string, callback: (message: any) => void): void => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.responseText != 'undefined' ) {
                callback(JSON.parse(xhr.responseText));
            }
        };
        xhr.send();
    }

    public static post = (url: string, content: any, callback: (message: any) => void): void => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = () => {
            if (xhr.readyState == XMLHttpRequest.DONE && xhr.responseText != 'undefined' ) {
                callback(JSON.parse(xhr.responseText));
            }
        };
        xhr.send(JSON.stringify(content));
    }
}

const { ccclass, property } = cc._decorator;
export default class Http {
    public static url: string = "https://www.mfxczz.cn/powerman/user/";

    public static sendRequest(path: string, data: any, handler: Function, extraUrl = null, failhandler: Function = null) {
        var xhr = new XMLHttpRequest();
        var str = "?";
        for (var k in data) {
            if (str != "?") {
                str += "&";
            }
            str += k + "=" + data[k];
        }
        if (extraUrl == null) {
            extraUrl = Http.url;
        }

        var requestURL = extraUrl + path;
        if (data) {
            requestURL += encodeURI(str);
        }
        console.log(requestURL);
        xhr.open("GET", requestURL, true);
        xhr.timeout = 10000;

        xhr.onload = () => {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                var ret = JSON.parse(xhr.responseText);
                if (handler) {
                    handler(ret);
                }
            } else {
                xhr.abort();
            }
        };

        xhr.ontimeout = (e) => {
            cc.log(e);
            if (failhandler)
                failhandler();
        };

        xhr.onabort = (e) => {
            cc.log(e);
            if (failhandler)
                failhandler();
        };

        xhr.onerror = (e) => {
            cc.log(e);
            if (failhandler)
                failhandler();
        }
        xhr.send();
        return xhr;
    }
}



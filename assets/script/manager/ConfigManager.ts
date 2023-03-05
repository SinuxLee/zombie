import Singleton from "./Singleton";


export default class ConfigManager extends Singleton {
    private bInit: boolean = false; //是否加载完毕

    async loadConfig() {
        if (this.bInit) return;

        //这个游戏配置放到 DB.ts里面的

        this.bInit = true;
        console.log("配置加载完成")
    }
}

var loadJson = async (filepath: string) => {
    return new Promise((resolve, reject) => {
        type kv = { key: string, value: string };
        cc.loader.loadRes("config/" + filepath, cc.JsonAsset, (err, conf: cc.JsonAsset) => {
            if (err) {
                console.error(err)
                reject();
                return;
            }
            resolve(conf.json);
        })
    })
}

var readConfig = async (filepath: string, c: any) => {
    return new Promise((resolve, reject) => {
        type kv = { key: string, value: string };
        cc.loader.loadRes("config/" + filepath, cc.TextAsset, (err, conf: cc.TextAsset) => {
            if (err) {
                console.error(err)
                reject();
                return;
            }

            var arr = conf.text.split("\r\n");
            var templatestr = arr[1].split(",");
            var template: Array<kv> = [];

            for (var i = 0; i < templatestr.length; ++i) {
                var tmp = templatestr[i].split(":");
                if (tmp.length == 2)
                    template.push({ key: tmp[0], value: tmp[1] });
                else
                    template.push({ key: "key" + i, value: "string" });
            }

            var items = [];
            for (var i = 2; i < arr.length; ++i) {
                if (arr[i] != "") {
                    var datas = arr[i].split(",");
                    var item = new c();
                    for (var j = 0; j < datas.length; ++j) {
                        var value: any = datas[j];
                        // console.log(i,j)
                        switch (template[j].value) {
                            case "number":
                                value = Number(value);
                                break;
                            case "string":
                                value = value.trim();
                                break;
                            case "boolean":
                                value = Number(value) == 1;
                                break;
                            case "table":
                                value = value.split(":");
                                break;
                            case "inttable":
                                value = value.split(":");
                                for (var v = 0; v < value.length; ++v) {
                                    value[v] = Number(value[v]);
                                }
                                break;
                            case "lnumber"://大数据处理
                                value = Number(value);
                                break
                        }
                        item[template[j].key] = value;
                    }
                    items.push(item);
                }
            }
            resolve(items);
        })
    })
}

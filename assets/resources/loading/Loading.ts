import ConfigManager from "../../script/manager/ConfigManager";
import AudioMgr from "../../script/utils/AudioMgr";
import BaseUI from "../../script/framwork/BaseUI";
import Data from '../../script/manager/Data';
import PoolMgr from "../../script/manager/PoolMgr";
import Http from "../../script/utils/HTTP";
import Utils from "../../script/utils/Utils";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Loading extends BaseUI {


    onBtnClicked(event, customEventData) {
        var btnName = event.target.name;

        switch (btnName) {
            case "btn_rstart":
                {
                    cc.director.loadScene("loading")
                }
                break;
        }
    }

    loadSubpackage(name: string) {
        return new Promise((resolve, reject) => {
            cc.loader.downloader.loadSubpackage(name, (err) => {
                if (err) {
                    console.error(err);
                    if (cc.isValid(this.node))
                        this.GetGameObject("btn_rstart").active = true;
                    reject();
                }
                else {
                    if (cc.isValid(this.node))
                        this.SetProgressBar("ProgressBar", this.GetProgressBar("ProgressBar").progress + 0.2);
                    resolve(null);
                }
            });
        })
    }

    async onLoad() {

        Http.sendRequest("get_server_time", {
        }, (ret) => {
            console.log("get_server_time:", ret, ret.time);
            Utils.setServerTime(ret.time);
        }, null, () => {
        });

        cc.debug.setDisplayStats(false);
        cc.game.setFrameRate(60);

        let savedatatime = cc.sys.localStorage.getItem("savedatatime");
        if (savedatatime) {
            savedatatime = Number(savedatatime);
        }

        super.onLoad();
        
        await ConfigManager.Instance().loadConfig();
        this.startLoginAction();

        let descs = ["初次加载时间可能会较长，请耐心等待....","有一天，花朵王国里来了一群僵尸...", "花园保卫战即将打响，快去帮助花朵们抵御入侵！"];
        let index = 0;
        this.node.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
            this.SetText("desp", descs[index]);
            index++;
            if (index > descs.length - 1)
                index = 0;
        })).repeatForever())

        this.GetGameObject("btn_rstart").active = false;
    }

    startLoginAction() {
        AudioMgr.Instance().loadSounds();
        this.node.runAction(cc.sequence(cc.delayTime(.5), cc.callFunc(async () => {

            Data.loadData()

            var p: number = 0;
            this.node.runAction(cc.sequence(cc.delayTime(0.01), cc.callFunc(() => {
                p += 0.018;
                this.SetProgressBar("ProgressBar", p);
                if (p >= 1) {
                    this.node.stopAllActions();
                    PoolMgr.Instance().loadPrefabs()

                    cc.director.loadScene("hall");
                }
            })).repeatForever());
        })))
    }

    progress: number = 0;

    async subpackagecomplete() {
        console.log("子包加载完成")
        await ConfigManager.Instance().loadConfig();
        this.startLoginAction();
    }
}

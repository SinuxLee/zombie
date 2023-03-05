import GameConst from '../game/GameConst';
import Data from '../manager/Data';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DebugTools extends cc.Component {
    start() {
        if (cc.sys.platform != cc.sys.DESKTOP_BROWSER) {
            return;
        }

        this.addBtn("清除数据", () => {
            localStorage.setItem(GameConst.local_data_key, "");
        })

        this.addBtn("金币+很多", () => {
            Data.user.coin += 1000000000000000
        })

        this.addBtn("钻石+很多", () => {
            Data.user.gem += 100000
        })

        this.addBtn("1倍数",()=>{
            cc.kSpeed(1);
        })

        this.addBtn("4倍数",()=>{
            cc.kSpeed(4);
        })

        this.addBtn("lv++", () => {
           Data.user.lv++;
        })
    }

    addBtn(name: string, callback: Function) {
        let toolbar = document.getElementsByClassName("toolbar")[0];
        if (!toolbar) return;
        let div = document.createElement("div");
        div.className = "item";
        div.innerHTML = "<button id='" + name + "'>" + name + "</button>";
        toolbar.appendChild(div);

        document.getElementById(name).onclick = () => {
            callback()
        };
    }
}

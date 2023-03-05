import BaseUI from '../../script/framwork/BaseUI';
import AudioMgr from '../../script/utils/AudioMgr';
import Utils from '../../script/utils/Utils';

const {ccclass, property} = cc._decorator;

@ccclass
export default class FairyItem extends BaseUI {
    start() {
        this.node.runAction(cc.sequence(cc.delayTime(10), cc.callFunc(() => {
            this.ChuXian();
        })))
    }
    ChuXian() {
        this.node.runAction(cc.sequence(cc.callFunc(() => {
            this.node.position = cc.v3(-cc.winSize.width / 2 - 200, cc.winSize.height / 4 - 100)
        }), cc.moveTo(20, cc.winSize.width / 2 + 200, cc.winSize.height / 4 - 100)).repeatForever())
    }
    onBtnClicked(event, customEventData) {
        var btnName = event.target.name;
        AudioMgr.Instance().playSFX("click");
        switch (btnName) {
            case "FairyItem":
                this.node.stopAllActions();
                this.node.position = cc.v3(-cc.winSize.width / 2 - 200, cc.winSize.height / 4 - 100);
                this.node.runAction(cc.sequence(cc.delayTime(40), cc.callFunc(() => {
                    this.ChuXian();
                })))
                Utils.createUI("prefab/FairyBonusUI")
                break;
        }
    }

}

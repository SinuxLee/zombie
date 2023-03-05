import BaseUI from '../../script/framwork/BaseUI';
import AudioMgr from '../../script/utils/AudioMgr';

const {ccclass, property} = cc._decorator;

@ccclass
export default class BossCommingUI extends BaseUI {
    start () {
        AudioMgr.Instance().playSFX("Arlam");
        this.node.runAction(cc.sequence(cc.delayTime(3),cc.callFunc(()=>{
            this.closeUI();
        })))
    }

}

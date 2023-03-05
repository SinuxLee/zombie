import BaseUI from '../../script/framwork/BaseUI';
import { DB_droneRewards } from '../../script/game/DB';
import Data from '../../script/manager/Data';
import MsgHints from '../../script/framwork/MsgHints';
import AudioMgr from '../../script/utils/AudioMgr';

const {ccclass, property} = cc._decorator;

@ccclass
export default class FairyBonusUI extends BaseUI {
     superPot = [];
    start () {
        var t =  Data.user.GetMaxLv();
        var n = DB_droneRewards[t+""][1];
        
        for (var o = 0; o < 4; o++) 
            this.superPot.push(n);

    }

    onDestroy()
    {
        super.onDestroy();
    }
    
    onBtnClicked(event, customEventData) {
        var btnName = event.target.name;
        AudioMgr.Instance().playSFX("click");
        switch (btnName) {
            case "btn_close":
                this.closeUI();
                break;
            case "btn_ad":
                MsgHints.show("敬请期待")
                // AdCenter.Instance().play(0,(b)=>{
                //     if(b)
                //     {
                //         Data.user.DropGiftPts = Data.user.DropGiftPts.concat(this.superPot);
                //         this.closeUI();
                //     }
                // })
                break;
            case "btn_gem":
                if(Data.user.gem<3)
                {
                    MsgHints.show("钻石不足")
                    return;
                }
                Data.user.gem -= 3;
                Data.user.DropGiftPts = Data.user.DropGiftPts.concat(this.superPot);
                this.closeUI();
                break;
        }
    }

}

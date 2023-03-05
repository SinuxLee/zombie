import BaseUI from '../../script/framwork/BaseUI';
import Data from '../../script/manager/Data';
import { DB_levelupGem } from '../../script/game/DB';
import Utils from '../../script/utils/Utils';
import AudioMgr from '../../script/utils/AudioMgr';

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewPlantUI extends BaseUI {

    private coin = 0;
    private gem = 0;
    async start () {

        let lv = Data.user.GetMaxLv()
        let coin = Data.user.BuyPrice(Math.max(1,lv-3));
        let levelup = DB_levelupGem[lv+""];
        this.GetGameObject("node_gem").active = levelup;
        this.SetText("lbl_lv","等级"+lv);

        AudioMgr.Instance().playSFX("unlock_plant")

        this.coin = coin;
        if(levelup)
        {
            this.gem = levelup[1]
            this.SetText("lbl_gem",this.gem+"");
        }
        this.SetText("lbl_coin",Utils.formatNumber(coin));

        this.GetSkeleton("flower1").skeletonData = await Utils.loadRes("spine/flower"+lv,sp.SkeletonData) as sp.SkeletonData;
        this.GetSkeleton("flower1").setAnimation(0,"idleL",true);
    }


    onBtnClicked(event, customEventData) {
        var btnName = event.target.name;
        AudioMgr.Instance().playSFX("click");
        switch (btnName) {
            case "btn_get":
                {
                    let coin = this.coin
                    let gem = this.gem;
                    
                    AudioMgr.Instance().playSFX("coin");
                    Utils.flyAnim(0,this.node,"icon_coin",Utils.getRandomInt(5,10),100,(b)=>{
                        if(b)
                        {
                            Data.user.coin += coin;
                        }  
                    })
                    if(gem>0)
                    {
                        AudioMgr.Instance().playSFX("gem");
                        Utils.flyAnim(1,this.node,"icon_gem",Utils.getRandomInt(2,4),85,(b)=>{
                            if(b)
                            {
                                Data.user.gem += gem;
                            }  
                        })
                    }
                    this.closeUI();
                }
                break;
        }
    }
}

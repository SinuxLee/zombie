import BaseUI from '../framwork/BaseUI';
import Data from '../manager/Data';
import { DB_slot } from './DB';
import Utils from '../utils/Utils';
import MsgHints from '../framwork/MsgHints';
import GameConst from './GameConst';

const {ccclass, property} = cc._decorator;

@ccclass
export default class SlotItem extends BaseUI {

    static getCurOpen()
    {
        let curopen = -1
        for(var i= 1;i<12;++i)
        {
            if(Data.user.slots[i] == 0)
            {
                curopen = i;
                break;
            }
        }
        return curopen;
    }

    onBtnClicked(event, customEventData) {
        let curopen = SlotItem.getCurOpen();
        if(curopen == -1)return;
        if(this.index-1 > curopen )
        {
            MsgHints.show("需要先解锁"+(curopen+1));
            return;
        }

        let type = DB_slot[curopen].type;
        if(type == 0)
        {
            if(Data.user.coin < DB_slot[curopen].price)
            {
                MsgHints.show("金币不足");
                return
            }
        }
        else
        {
            if(Data.user.gem < DB_slot[curopen].price)
            {
                MsgHints.show("钻石不足");
                return
            }
        }

        Data.user.slots[curopen] = 1;
        if(type == 0)
        {
            Data.user.coin -= DB_slot[curopen].price
        }
        else
        {
            Data.user.gem -= DB_slot[curopen].price
        }
        console.log("解锁土地",curopen)
        Data.save();
        this.dispatch(GameConst.OPEN_SLOT,curopen);
        this.setIndex(this.index);
    }


    private index = 0;
    setIndex(i)
    {
        this.index = i;
        this.SetText("lbl_index",i+"");
        // console.log(i,Data.user.slots[i])
        let curopen = SlotItem.getCurOpen();
        this.node.getComponent(cc.Button).interactable = this.index-1>=curopen && curopen !=-1;

        // this.GetSkeleton("fx_slot").setAnimation(0,"buy",true)
        // this.GetGameObject("fx_slot").active = false;
        let info = Data.user.slots[i-1];

        this.GetGameObject("lock").active = info == 0;
        this.GetGameObject("lbl_index").active = info == 0;
        this.GetGameObject("node_cost").active = info == 0;

        this.GetGameObject("2btcoin").active = DB_slot[i-1].type == 0;
        this.GetGameObject("2btdiamond").active = DB_slot[i-1].type == 1;
        this.SetText("lbl_open_cost",Utils.formatNumber( DB_slot[i-1].price))
    }
}

import Utils from '../utils/Utils';
import BaseUI from '../framwork/BaseUI';
import { DB_plant, MAX_PLANT } from './DB';
import HallScene from './HallScene';
import Bullet from '../../resources/prefab/Bullet';
import Data from '../manager/Data';
import { PlantInfo } from './UserModel';

const { ccclass, executeInEditMode, property } = cc._decorator;

@ccclass
export default class SoldierItem extends BaseUI {
    @property(cc.Prefab)
    bullet_pre:cc.Prefab = null;

    index: number = -1;

    linkItem: SoldierItem = null;
    datacopy: PlantInfo = null;
    bDrag: boolean = false;
    droptype:number = 0;

    droptype0endtime = 0;

    setItemData(d: PlantInfo,droptype:number = -1) {// 3普通掉落 4小精灵掉落
        if(droptype != -1)
            this.droptype = droptype;

        if(this.droptype!=0 &&  this.droptype0endtime < Utils.getServerTime())
        {
            this.droptype0endtime = Utils.getServerTime() + 10000;
        }

        //减少重绘制
        if (this.datacopy && d) {
            if (this.datacopy.index == d.index &&
                this.datacopy.lv == d.lv &&
                this.datacopy.open == d.open) {
                return;
            }
        }

        // console.log("setItemData",d)
        this.datacopy = d ? JSON.parse(JSON.stringify(d)) : null;
        if (this.datacopy)
            this.datacopy.index = this.index;
        this.updateItem();
    }

    private curplayani = ""
    async updateItem() {
        this.GetGameObject("level_1").active = this.datacopy != null;
        this.GetGameObject("flower1").active = this.datacopy != null;
        if (this.datacopy)
        {
            this.GetGameObject("lbl_lv").getComponent(cc.Label).string = "lv." + this.datacopy.lv;

            if(this.droptype==0)
            {
                this.GetGameObject("lbl_lv").active = true;

                let info = DB_plant[Math.min(this.datacopy.lv - 1,MAX_PLANT-1)];
                this.cd = Number(info[1]);
                if(this.curplayani !=  this.datacopy.lv + "_idleL")
                {
                    this.curplayani = this.datacopy.lv + "_idleL";
                    this.GetSkeleton("flower1").skeletonData = await Utils.loadRes("spine/flower"+Math.min(this.datacopy.lv,MAX_PLANT),sp.SkeletonData) as sp.SkeletonData;
                    this.GetSkeleton("flower1").setAnimation(0,"idleL",true);
                    // console.log("====",this.datacopy.lv,this.droptype)
                }
            }
            else
            {
                this.GetGameObject("lbl_lv").active = false;
                if(this.droptype == 4)
                {
                    if(this.curplayani !=  "pot1_idle")
                    {
                        this.curplayani =  "pot1_idle";
                        this.node.opacity = 0;
                        this.GetSkeleton("flower1").skeletonData = await Utils.loadRes("spine/pot1",sp.SkeletonData) as sp.SkeletonData;
                        this.GetSkeleton("flower1").clearTracks();
                        this.GetSkeleton("flower1").setAnimation(0,"fall",false);
                        this.node.opacity = 255;
                        this.node.runAction(cc.sequence(cc.delayTime(0.8),cc.callFunc(()=>{
                            this.GetSkeleton("flower1").setAnimation(1,"idle",true);
                        })));
                        console.log("===2=",this.datacopy.lv)
                    }
                }
                else
                {
                    if(this.curplayani !=  "pot3_idle")
                    {
                        this.curplayani =  "pot3_idle";
                        this.node.opacity = 0;
                        this.GetSkeleton("flower1").skeletonData = await Utils.loadRes("spine/pot3",sp.SkeletonData) as sp.SkeletonData;
                        this.GetSkeleton("flower1").clearTracks();
                        this.GetSkeleton("flower1").setAnimation(0,"fall",false);
                        this.node.opacity = 255;
                        this.node.runAction(cc.sequence(cc.delayTime(0.8),cc.callFunc(()=>{
                            this.GetSkeleton("flower1").setAnimation(1,"idle",true);
                        })));
                        console.log("===1",this.datacopy.lv)
                    }
                }
            }
        }
    }

    private getTarget()
    {
        let enemylist = HallScene.Instance.enemylist;
        let target = null;
        let mindis = 400;
        for(var i = 0;i<enemylist.length;++i)
        {
            if(enemylist[i].x< -cc.winSize.width/2)continue;
            let dis = enemylist[i].position.sub(this.node.position).mag();
            if(dis < mindis)
            {
                target = enemylist[i];
                mindis = dis;
            }
        }

        return target;
    }
    private cd = 0;
    
    private lastfire = 0;
    update(dt)
    {
        if(this.datacopy && this.droptype == 0 && Data.user.double_att_time>Utils.getServerTime())
        {
            this.GetSkeleton("flower1").timeScale = 1.5;
                this.GetGameObject("kb").active = true;
        }
        else
        {
            this.GetSkeleton("flower1").timeScale = 1
            this.GetGameObject("kb").active = false;
        }
        if(this.droptype!=0 )
        {
            if(Utils.getServerTime() > this.droptype0endtime)
            {
                this.droptype = 0;
                this.updateItem();
            }
        }
        if(this.bDrag)return;
        if(!this.datacopy)return;
        if(this.droptype!=0)return;

        this.lastfire += dt

        if(this.lastfire >= this.cd / ((Data.user.double_att_time>Utils.getServerTime())?2:1))
        {
            this.lastfire = 0;
            let target = this.getTarget();
            if(target)
            {
                this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(()=>{
                    if(this.bDrag)return;
                    if(!this.datacopy)return;

                    let b = cc.instantiate(this.bullet_pre);
                    b.position = this.node.position.add(target.x>this.node.x?cc.v3(15,35,0):cc.v3(-15,35,0));
                    b.parent = HallScene.Instance.GetGameObject("node_bullet");
                    b.getComponent(Bullet).setInfo(target,this.datacopy.lv);
                })))
                if(target.x>this.node.x)
                {
                    this.GetSkeleton("flower1").setAnimation(0,"atkR",false);
                    this.GetSkeleton("flower1").setAnimation(1,"idleR",true);
                    this.curplayani = "idleR";
                }
                else
                {
                    this.GetSkeleton("flower1").setAnimation(0,"atkL",false);
                    this.GetSkeleton("flower1").setAnimation(1,"idleL",true);
                    this.curplayani = "idleL";
                }
            }
        }
    }
}

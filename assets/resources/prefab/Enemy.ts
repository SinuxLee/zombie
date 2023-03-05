import BaseUI from '../../script/framwork/BaseUI';
import HallScene from '../../script/game/HallScene';
import { DB_zombie, DB_plant } from '../../script/game/DB';
import Utils from '../../script/utils/Utils';
import Data from '../../script/manager/Data';
import AudioMgr from '../../script/utils/AudioMgr';

const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends BaseUI {

    @property(cc.Prefab)
    getcoin_pre: cc.Prefab = null;

    private maxhp = 0
    private hp = 0;
    private money = 0;

    public getBossMoney() {
        if (this.type == 2) {
            if (Data.user.double_income_time > Utils.getServerTime()) {
                this.money *= 2;
            }
            return (this.maxhp - this.hp) / this.maxhp * this.money;
        }
        return 0;
    }

    private type = 0;//0 普通 1 小boss 2大boss
    async setID(id: number, boss: boolean)//是否boss
    {
        this.type = boss ? 1 : 0;
        let info = DB_zombie[id + ""];

        if (id > 100) {
            id -= 100;
            this.type = 2;
        }

        if (id > 52)
            id = Utils.getRandomInt(1, 52);

        // this.GetGameObject("boss").active = this.type == 2;

        this.sped = info[2] * this.base_speed;
        this.maxhp = info[1];
        this.hp = this.maxhp;
        this.money = Math.floor(info[3] * Utils.getRandom(0.8, 1.2));

        // console.log(this.type == 2?"boss":"e",this.maxhp,this.money,"====")
        this.node.position = HallScene.Instance.path[0];
        this.node.scale = this.type == 0 ? .8 : 1.1;
        this.GetGameObject("sp").scaleX = 0.5;
        if (id == 25) {
            AudioMgr.Instance().playSFX("dog")
        }
        else if (id == 13) {
            AudioMgr.Instance().playSFX("pig")
        }
        else {
            AudioMgr.Instance().playSFX(Utils.getRandom(0, 1) < .6 ? "zb1" : "zb2")
        }
        this.GetSkeleton("sp").skeletonData = await Utils.loadRes("spine/enemy" + id, sp.SkeletonData) as sp.SkeletonData;
        this.GetSkeleton("sp").setAnimation(0, "run", true);
        this.GetGameObject("New ProgressBar").opacity = 0;
    }

    hit(plantlv: number) {
        if (this.hp <= 0) return;

        let info = DB_plant[plantlv - 1];

        let skill = String(info[3]).split("|");
        let skilltype = Number(skill[0]);
        let skillvalue = Number(skill[1]);
        let power = Number(info[2])

        let bbj = false;
        if (Utils.getRandom(0, 100) < skillvalue) {
            if (skilltype == 1)//减速
            {
                this.slowdown();
            }
            else if (skilltype == 2)//双倍伤害
            {
                power *= 2;
                bbj = true;
            }
            else if (skilltype == 3)//冰冻
            {
                this.frozen();
            }
        }


        this.hp -= power;
        this.hp = Math.max(this.hp, 0)

        this.SetProgressBar("New ProgressBar", this.hp / this.maxhp);
        this.GetGameObject("New ProgressBar").stopAllActions();
        this.GetGameObject("New ProgressBar").opacity = 255;
        this.GetGameObject("New ProgressBar").runAction(cc.sequence(cc.delayTime(1), cc.fadeTo(0.2, 0)))

        if (bbj) {
            this.showWLBaoji(power, Utils.getRandom(0, 1) > 0.5);
        }
        else {
            this.showFSHurt(power, Utils.getRandom(0, 1) > 0.5);
        }
        if (this.hp <= 0) {
            HallScene.Instance.removeenemy(this.node, false);
            this.GetGameObject("sp").runAction(cc.sequence(cc.delayTime(0.5), cc.fadeTo(.2, 0), cc.callFunc(() => {
                this.node.removeFromParent(true);
            })))
            if (Data.user.double_income_time > Utils.getServerTime()) {
                this.money *= 2;
            }

            //daboss界面加钱
            if (this.type != 2) {
                let node = cc.instantiate(this.getcoin_pre);
                node.parent = this.node.parent;
                node.getChildByName("lbl_add_coin").getComponent(cc.Label).string = Utils.formatNumber(this.money);
                node.position = this.node.position.add(cc.v3(0, 50, 0));
                node.zIndex = 1000;
                node.scale = 0.5
                Data.user.coin += this.money;
                node.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.2, 1.3), cc.moveBy(0.2, 0, 80)), cc.delayTime(.8), cc.spawn(cc.moveBy(0.5, 50), cc.fadeTo(0.5, 50)), cc.removeSelf()));
            }

            this.playSkAni("spine/other/zhuoshao", "effect", this.node, cc.v3(0, 75, 0), 1).then((node) => {
                node.scale = 2;
            });
        }
        else {
            // this.GetGameObject("hit").getComponent(cc.Animation).play("hit");
            this.playSkAni("spine/other/jizhong", "animation", this.node, cc.v3(0, 75, 0), 1)
            this.redendtime = Utils.getServerTime() + 300;
        }
        AudioMgr.Instance().playSFX("hit")
        // this.GetGameObject("hit").getComponent(cc.Animation).play("hit");
    }

    slowdown() {

        AudioMgr.Instance().playSFX("skill_slow")
        this.GetSkeleton("sp").timeScale = 0.5;
        this.GetGameObject("jiansu").active = true;
        this.GetGameObject("sp").stopAllActions();
        this.GetGameObject("sp").runAction(cc.sequence(cc.delayTime(1), cc.callFunc(() => {
            this.GetGameObject("sp").color = cc.Color.WHITE;
            this.GetSkeleton("sp").timeScale = 1;
            this.GetGameObject("jiansu").active = false;
        })))
    }

    bfrozen = false;
    frozen() {
        AudioMgr.Instance().playSFX("skill_freeze")
        this.bfrozen = true;
        this.GetGameObject("fx_stun").stopAllActions();
        this.GetGameObject("fx_stun").active = true;
        this.purpleendtime = Utils.getServerTime() + 1000;
        this.GetSkeleton("sp").paused = true;
        this.GetGameObject("fx_stun").runAction(cc.sequence(cc.delayTime(1), cc.callFunc(() => {
            this.GetGameObject("fx_stun").active = false;
            this.GetSkeleton("sp").paused = false;
            this.bfrozen = false;
        })))
    }

    private pathindex = 1;
    private sped = 1;
    private base_speed = 50;

    private redendtime = 0;
    private purpleendtime = 0;
    update(dt) {
        if (this.redendtime > Utils.getServerTime()) {
            this.GetGameObject("sp").color = cc.Color.RED.fromHEX("#7C82DE")
        }
        else if (this.purpleendtime > Utils.getServerTime()) {
            this.GetGameObject("sp").color = cc.Color.RED.fromHEX("#ED7373")
        }
        else {
            this.GetGameObject("sp").color = cc.Color.WHITE
        }

        if (this.bfrozen) return;
        if (!HallScene.Instance.path[this.pathindex]) return;
        let d = HallScene.Instance.path[this.pathindex].sub(this.node.position);
        if (d.mag() < this.sped * dt) {
            this.node.position = HallScene.Instance.path[this.pathindex];
            this.pathindex++;
            if (this.pathindex == 3)
                this.GetGameObject("sp").scaleX = -0.5;

            if (this.pathindex >= HallScene.Instance.path.length) {
                console.log("逃过")
                HallScene.Instance.removeenemy(this.node, true);
                this.node.removeFromParent(true)
            }
        }
        else {
            let v = d.normalize().mul( this.sped * dt);
            this.node.position = this.node.position.add(v);
        }
    }

    showFSHurt(num: number, forward: boolean = false) {
        var node = cc.instantiate(this.GetGameObject("fs_hurt"));
        node.parent = this.node;
        if (forward) node.x *= -1;
        node.getComponent(cc.Label).string = Utils.formatCoin(num);
        node.active = true;
        var bezier;
        if (forward) {
            bezier = [cc.v2(-10, 50), cc.v2(-40, 60), cc.v2(-60, 20)];
        } else {
            bezier = [cc.v2(10, 50), cc.v2(40, 60), cc.v2(60, 20)];
        }
        var bezierForward = cc.bezierBy(1, bezier);
        node.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(1, 0.6),
                bezierForward
            ),
            cc.removeSelf()
        ));
    }

    showWLBaoji(num: number, forward: boolean = false) {
        AudioMgr.Instance().playSFX("skill_crit")
        var node = cc.instantiate(this.GetGameObject("wl_baoji"));
        node.parent = this.node;
        if (forward) node.x *= -1;
        node.getComponent(cc.Label).string = Utils.formatCoin(num);
        node.active = true;
        node.scale = 0.2;
        var bezier;
        var bezier1;
        if (forward) {
            bezier = [cc.v2(-5, 20), cc.v2(-8, 30), cc.v2(-10, 30)];
            bezier1 = [cc.v2(-5, -20), cc.v2(-8, -30), cc.v2(-10, -30)];
        } else {
            bezier = [cc.v2(5, 20), cc.v2(8, 30), cc.v2(10, 30)];
            bezier1 = [cc.v2(5, -20), cc.v2(8, -30), cc.v2(10, -30)];
        }
        var bezierFront = cc.bezierBy(0.2, bezier);
        var bezierBack = cc.bezierBy(0.5, bezier1);
        node.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.2, 1),
                bezierFront
            ),
            cc.delayTime(0.5),
            cc.spawn(
                cc.scaleTo(0.5, 0.2),
                bezierBack,
                cc.fadeOut(0.5),
            ),
            cc.removeSelf()
        ));
    }

}

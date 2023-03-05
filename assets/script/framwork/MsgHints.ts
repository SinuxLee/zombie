import PoolMgr from "../manager/PoolMgr";

/**
 * 游戏内提示消息
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class MsgHints extends cc.Component {

    private static _prefab = null;

    public static show(msg: string) {
        if (msg == "") return;
        if (MsgHints._prefab == null) {
            cc.loader.loadRes("prefab/common/msg_hints", (err, prefab) => {
                if (err) {
                    return;
                }
                MsgHints._prefab = prefab;
                PoolMgr.Instance().initPool("msg_hints", MsgHints._prefab, 20);
                MsgHints.show(msg);
            });
            return;
        }

        //对象池没有对象就不显示了   
        if (PoolMgr.Instance().pools["msg_hints"].size() == 0) return;

        var node: cc.Node = PoolMgr.Instance().get("msg_hints");//cc.instantiate(MsgHints._prefab);
        node.scaleY = 0;
        node.parent = cc.find("Canvas");
        node.zIndex = 999999999;
        node.getChildByName("label").getComponent(cc.Label).string = msg;
        node.getComponent(cc.Animation).play("msghints", 0);
        node.getComponent(cc.Animation).on('finished', () => {
            // node.destroy();
            PoolMgr.Instance().put("msg_hints", node);
        });
    }

}
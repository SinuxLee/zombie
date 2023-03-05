

const { ccclass, property } = cc._decorator;
@ccclass
export default class PoolMgr {

    pools: any = {};
    prefabs: any = {};

    pre_bullets: cc.Prefab[] = [];

    private static _instance: PoolMgr = null;
    public static Instance(): PoolMgr {
        if (PoolMgr._instance == null)
            PoolMgr._instance = new PoolMgr()
        return PoolMgr._instance;
    }

    loadPrefabs() {
        cc.loader.loadRes("prefab/Coin", cc.Prefab, (err, ret) => {
            if (err) {
                console.error(err);
                return;
            }
            this.initPool("Coin", ret, 11);
        });

        cc.loader.loadRes("prefab/Gem", cc.Prefab, (err, ret) => {
            if (err) {
                console.error(err);
                return;
            }
            this.initPool("Gem", ret, 11);
        });

        // Utils.loadRes("prefab/Car", cc.Prefab).then((pre: cc.Prefab) => {
        //     this.initPool("Car", pre, 20);
        // })

        // Utils.loadRes("prefab/Guest", cc.Prefab).then((pre: cc.Prefab) => {
        //     this.initPool("Guest", pre, 20);
        // })

    }

    initPool(key: any, prefab: cc.Prefab, count: number) {
        this.prefabs[key] = prefab;
        this.pools[key] = new cc.NodePool();
        for (var i = 0; i < count; ++i) {
            this.pools[key].put(cc.instantiate(prefab));
        }
    }

    get(key: any): cc.Node {
        if (this.pools[key] == null) {
            cc.error("没有" + key);
            return null;
        }
        if (this.pools[key].size() > 0) {
            var node = this.pools[key].get();
            var spine = node.getChildByName("spine");
            if (spine) {
                spine.getComponent(sp.Skeleton).paused = false;
            }
            return node;
        }
        else
            return cc.instantiate(this.prefabs[key]);
    }

    put(key: any, node: cc.Node) {
        this.pools[key].put(node);
        // var spine = node.getChildByName("spine");
        // if (spine) {
        //     spine.getComponent(sp.Skeleton).paused = true;
        // }
    }
}



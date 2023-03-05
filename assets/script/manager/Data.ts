
import UserModel from "../game/UserModel";
import Utils from "../utils/Utils";
import AudioMgr from "../utils/AudioMgr";
import GameConst from "../game/GameConst";

export default class Data {
    public static user: UserModel = new UserModel();

    public static save( bRemote: boolean = false) {
        var obj = {}
        obj['user'] = Data.user.getUploadData()
        Data.savedata(obj, bRemote)
    }
    public static loadData() {
        var localdata = cc.sys.localStorage.getItem(GameConst.local_data_key);
        if (localdata) {
            localdata = JSON.parse(localdata);
            // console.log('本地数据', localdata)
            Data.user.setData(localdata['user'])
        }
        else {
            //没有档案重置下音乐开关
            cc.sys.localStorage.setItem("bgmVolume", 1);
            cc.sys.localStorage.setItem("sfxVolume", 1);
            AudioMgr.Instance().sfxVolume = 1;
            AudioMgr.Instance().bgmVolume = 1;
        }
    }

    //本地存数据
    private static savedata(data, bRemote: boolean = false) {
        cc.sys.localStorage.setItem("savedatatime", Utils.getServerTime());
        var strdata = JSON.stringify(data);
        cc.sys.localStorage.setItem(GameConst.local_data_key, strdata);
    }
}
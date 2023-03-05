import BaseUI from "../../script/framwork/BaseUI";
import AudioMgr from "../../script/utils/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingUI extends BaseUI {

    btn_music: cc.Node = null;
    btn_music_close: cc.Node = null;

    btn_sound: cc.Node = null;
    btn_sound_close: cc.Node = null;

    async start() {

        AudioMgr.Instance().playSFX("ui_open_popup_1");
        this.btn_music = this.GetGameObject("btn_music_on");
        this.btn_music_close = this.GetGameObject("btn_music_off");

        this.btn_sound = this.GetGameObject("btn_sound_on");
        this.btn_sound_close = this.GetGameObject("btn_sound_off");

        this.btn_music.active = AudioMgr.Instance().bgmVolume == 1;
        this.btn_music_close.active = AudioMgr.Instance().bgmVolume == 0;

        this.btn_sound.active = AudioMgr.Instance().sfxVolume == 1;
        this.btn_sound_close.active = AudioMgr.Instance().sfxVolume == 0;
    }

    onBtnClicked(event, customEventData) {
        var btnName = event.target.name;
        AudioMgr.Instance().playSFX("click");
        switch (btnName) {
            case "btn_back":
                this.closeUI()
                break;
            case "btn_music_on":
            case "btn_music_off":
                this.btn_music.active = !this.btn_music.active;
                this.btn_music_close.active = !this.btn_music_close.active;
                AudioMgr.Instance().setBGMVolume(this.btn_music.active ? 1 : 0, true);
                break;
            case "btn_sound_on":
            case "btn_sound_off":
                this.btn_sound.active = !this.btn_sound.active;
                this.btn_sound_close.active = !this.btn_sound_close.active;
                AudioMgr.Instance().setSFXVolume(this.btn_sound.active ? 1 : 0, true);
                break;
        }
    }
}

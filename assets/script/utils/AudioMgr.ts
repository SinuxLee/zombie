import Singleton from "../manager/Singleton";
import Utils from "./Utils";
export default class AudioMgr extends Singleton {

    public bgmVolume: number = 1;
    public sfxVolume: number = 1;

    bgmAudioID: number = -1;
    audioId: number = -1;

    loadSounds() {
        var t = cc.sys.localStorage.getItem("bgmVolume");
        var t1 = cc.sys.localStorage.getItem("sfxVolume");

        this.bgmVolume = t == 0 ? Number(t) : 1;
        this.sfxVolume = t1 == 0 ? Number(t1) : 1;
        console.log("loadSounds", this.bgmVolume, this.sfxVolume)

        cc.log(this.bgmVolume, this.sfxVolume)
        cc.loader.loadResDir("sounds",()=>{
            this.playBGM("BGM1");
        });
    }

    getUrl(url: string): cc.AudioClip {
        return cc.loader.getRes("sounds/" + url);
    }

    private bgm_url: string = "BGM1"
    playBGM(url: string) {
        this.bgm_url = url;
        var audioUrl = this.getUrl(url);
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.stop(this.bgmAudioID);
        }
        if (this.bgmVolume > 0) {
            this.bgmAudioID = cc.audioEngine.play(audioUrl, true, this.bgmVolume);
        }
    }

    stopSFX(audioId: number) {
        var ok = cc.audioEngine.stop(audioId);
        return ok;
    }

    private lastplaysfxtime = {};
    private sfxcd = {
        "zb1":1500,
        "zb2":1500,
        "hit":300,
        "merge_success":100,
        "skill_freeze":300,
        "skill_slow":300,
    }

    playSFX(url: string) {
        // if (GameManager.Instance.fps < 20) return;

        if (!this.lastplaysfxtime[url])
            this.lastplaysfxtime[url] = 0;
        let cd = this.sfxcd[url] || 0;
        if (Utils.getServerTime() - this.lastplaysfxtime[url] < cd) {
            return;
        }
        this.lastplaysfxtime[url] = Utils.getServerTime();

        var audioUrl = this.getUrl(url);
        if (this.sfxVolume > 0) {
            this.audioId = cc.audioEngine.play(audioUrl, false, this.sfxVolume);
            return this.audioId;
        }
    }

    pauseBGM() {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.pause(this.bgmAudioID);
            // cc.log("暂停bgm")
        }
    }

    resumBGM() {
        if (this.bgmAudioID >= 0) {
            cc.audioEngine.resume(this.bgmAudioID);
            // cc.log("恢复bgm")
        }
    }

    setBGMVolume(v: number, force: boolean = false) {
        if (this.bgmVolume != v || force) {
            cc.sys.localStorage.setItem("bgmVolume", v);
            this.bgmVolume = v;
            cc.audioEngine.setVolume(this.bgmAudioID, v);
        }
        if (this.bgmAudioID >= 0) {
            if (v > 0) {
                cc.audioEngine.resume(this.bgmAudioID);
            } else {
                cc.audioEngine.pause(this.bgmAudioID);
            }
        } else {
            this.playBGM(this.bgm_url);
        }
    }

    setSFXVolume(v: number, force: boolean = false) {
        if (this.sfxVolume != v || force) {
            cc.sys.localStorage.setItem("sfxVolume", v);
            this.sfxVolume = v;
            //设置音效大小会同时设置背景音乐的声音，不设置音效大小，本地音效依然可以受控使用，暂未找到原因
            // cc.audioEngine.setEffectsVolume(v);
        }
    }
}
import { Gol } from "./gol.js";
import { MathUtils } from "./math/math-utils.js";

class AudioManager {
    
    /**
     * 
     * @type {AudioContext}
     */
    audioContext;

    /**
     * 
     * @type {AudioBufferSourceNode}
     */
    bgMusicNode = null;

    /**
     * 
     * @type {GainNode}
     */
    masterGain;

    /**
     * 
     * @type {GainNode}
     */
    bgMusicGain;

    /**
     * 
     * @type {GainNode}
     */
    cueGain;

    /**
     * 
     * @type {AnalyserNode}
     */
    analyser;

    /**
     * 
     * @type {Uint8Array}
     */
    dataArray;

    constructor() {

        this.audioContext = new AudioContext();

        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 1.0;

        this.bgMusicGain = this.audioContext.createGain();
        this.bgMusicGain.connect(this.masterGain);
        this.bgMusicGain.gain.value = 1.0;

        this.cueGain = this.audioContext.createGain();
        this.cueGain.connect(this.masterGain);
        this.cueGain.gain.value = 1.0;

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.connect(this.audioContext.destination);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    get masterVolume() {
        return this.masterGain.gain.value;
    }

    set masterVolume(val) {
        this.masterGain.gain.value = MathUtils.sat(val);
    }

    get bgMusicVolume() {
        return this.bgMusicGain.gain.value;
    }

    set bgMusicVolume(val) {
        this.bgMusicGain.gain.value = MathUtils.sat(val);
    }

    get cueVolume() {
        return this.cueGain.gain.value;
    }

    set cueVolume(val) {
        this.cueGain.gain.value = MathUtils.sat(val);
    }

    setFrequencyDataSize(size) {
        if(!MathUtils.isPowerOf2(size) && size < 16) {
            throw new Error("size must be power of 2 and equal or bigger than 16");
        }
        this.analyser.fftSize = size * 2;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }

    getFrequencyData() {
        this.analyser.getByteFrequencyData(this.dataArray);
        return this.dataArray;
    }

    playBgMusic(clipName, params = {}) {
        const loop = params.loop === undefined ? true : params.loop;
        const time = params.time === undefined ? 0 : params.time;

        const clipData = Gol.files.get(clipName);

        this.stopBgMusic();

        this.bgMusicNode = this.audioContext.createBufferSource();
        this.bgMusicNode.buffer = clipData;
        this.bgMusicNode.loop = loop;
        this.bgMusicNode.start(time);

        this.bgMusicNode.connect(this.bgMusicGain);
        this.bgMusicNode.connect(this.analyser);

    }

    stopBgMusic() {
        if(this.isBgMusicPlaying()) {
            this.bgMusicNode.stop(0);
            this.bgMusicNode = null;
        }
    }

    isBgMusicPlaying() {
        return !(this.bgMusicNode === null);
    }

    playCue(clipName, volume = 1.0) {
        const clipData = Gol.files.get(clipName);

        const cueNode = this.audioContext.createBufferSource();
        cueNode.buffer = clipData;
        cueNode.start(0);

        const gain = this.audioContext.createGain();
        gain.connect(this.cueGain);
        gain.gain.value = MathUtils.sat(volume);

        cueNode.connect(gain);
    }

    onResume() {
        if(this.audioContext.state == "suspended") {
            this.audioContext.resume();
        }
    }

}

export {
    AudioManager
}
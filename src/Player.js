import Drawer from "./Drawer"


class Player extends Drawer {
    constructor(audio, options) {
        super();
        this.options = options

        this.initAudio(audio)
        this.initDrawer(options.render || {})

        audio.addEventListener('play', this.onAudioPlay)
        audio.addEventListener('pause', this.onAudioPause)
        audio.addEventListener('ended', this.onAudioEnd)
    }

    mount(el) {
        el.appendChild(this.app.view)
    }

    onAudioPlay = () => {
        this.app.ticker.start()
    }

    onAudioPause = () => {
        this.tickerStop()
    }

    onAudioEnd = () => {
        this.tickerStop()
    }

    play() {
        if (this.audio) {
            this.audio.play();
        } else {
            throw new Error("no audio");
        }
        return this;
    }

    pause() {
        if (this.audio) {
            this.audio.pause();
        } else {
            throw new Error("no audio");
        }
        return this;
    }

    stop() {
        this.pause()
        this.audio.currentTime = 0
    }

    destroy() {
        this.stop()
        this.audio.removeEventListener('pause', this.onAudioPause)
        this.audio.removeEventListener('ended', this.onAudioEnd)
        this.audio.removeEventListener('play', this.onAudioPlay)
        this.audio = null
    }
}

export default Player;

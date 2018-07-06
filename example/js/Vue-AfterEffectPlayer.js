Vue.component('aftereffect-player', {
    name: "aftereffect-player",
    props: {
        url: {
            type: String,
            require: true
        }
    },
    mounted: function() {
        this.init();
        window.addEventListener("keydown", this.keydown);
    },
    watch: {
        url: function(curVal) {
            if (this.player.isInit) {
                this.player.changeAudio(curVal);
                this.player.play();
            }
        }
    },
    beforeDestory: function() {
        window.removeEventListener("keydown", this.keydown);
    },
    data: function() {
        return {
            player: {}
        }
    },
    methods: {
        init: function() {
            var that = this;
            this.player = afterEffectPlayer.init(
                this.$refs.player,
                this.url, {
                    onended: function(e) {
                        that.$emit('onended', e);
                    },
                    watchFPS: function(FPS, FPS_now) {
                        that.$emit('watchfps', FPS, FPS_now);
                    }
                }
            )
            this.player.play();
        },
        keydown: function(event) {
            var that = this;
            console.log(this);
            if (event.keyCode === 32 && that.player.audio) {
                (that.player.audio.paused) ? that.player.play(): that.player.pause();
            }
            if (event.keyCode === 38 && that.player.audio) {
                var volume = that.player.audio.volume;
                volume += 0.01;
                that.player.audio.volume = (volume > 1) ? 1 : volume;
            }
            if (event.keyCode === 40 && that.player.audio) {
                var volume = that.player.audio.volume;
                volume -= 0.01;
                that.player.audio.volume = (volume < 0) ? 0 : volume;
            }
        }
    },
    template: '<div ref="player"></div>'
});
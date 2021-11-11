Vue.component('aftereffect-player', {
    name: "aftereffect-player",
    props: {
        url: {
            type: String,
            require: true
        },
        title: {
            type: String,
            require: true
        },
        config: {
            type: Object,
        }
    },
    mounted: function() {
        this.init();
        window.addEventListener("keydown", this.keydown);
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
            const audio = new Audio()
            audio.src = this.url
            audio.addEventListener('ended', (e) => {
                that.$emit('onended', e);
            })
            audio.play()
            var afterEffectPlayer = new AfterEffectPlayer(
                audio,
                {
                    title: this.title,
                    watchFPS: function(FPS, FPS_now) {
                        that.$emit('watchfps', FPS, FPS_now);
                    },
                    render: {
                        ...this.config
                    }
                }
            );

            afterEffectPlayer.mount(this.$refs.player)

            this.player = afterEffectPlayer
        },
        keydown: function(event) {
            var that = this;
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
            if (event.keyCode === 37 && that.player.audio) {
                var currentTime = that.player.audio.currentTime;
                currentTime -= 1;
                that.player.audio.currentTime = (currentTime > 0) ? currentTime : 0;
            }
            if (event.keyCode === 39 && that.player.audio) {
                var currentTime = that.player.audio.currentTime;
                var duration = that.player.audio.duration;
                currentTime += 1;
                that.player.audio.currentTime = (currentTime < duration) ? currentTime : 0;
            }
        }
    },
    template: '<div ref="player"></div>'
});

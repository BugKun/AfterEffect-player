new Vue({
    el: '#app',
    mounted: function() {
    },
    data: {
        title: '',
        FPS: 0,
        isPlayed: false,
        url: null,
        lastFPSUpdateTime: 0,
        file: null,
        playerConfig: {
            resolution: 1,
            antialias: true,
            autoDensity: true
        }
    },
    methods: {
        onSelectedFile: function(file) {
            this.file = file.raw
            console.log(file.raw)
        },
        handleRemove() {
            this.file = null
        },
        playMusic: function() {
            var that = this
            var file = this.file
            if(!file) {
                alert('请选择文件')
                return
            }
            var filename = file.name.split('.');
            filename.pop()
            filename = filename.join('.')
            this.title = filename
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function (event) {
                var blob = new Blob([event.target.result], { type: file.type });
                window.URL = window.URL || window.webkitURL;
                var blobURL = window.URL.createObjectURL(blob);
                that.url = blobURL
                that.isPlayed = true;
            }
        },
        onended: function() {
            this.isPlayed = false;
        },
        watchfps: function(FPS, FPS_now) {
            if(FPS_now - this.lastFPSUpdateTime > 1000) {
                this.FPS = FPS;
                this.lastFPSUpdateTime = FPS_now
            }
        },
    }
});

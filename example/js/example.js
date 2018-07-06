var afterEffectPlayer = new AfterEffectPlayer();
var isSupported = afterEffectPlayer.isSupport();
Vue.use(bootstrapVue);



new Vue({
    el: '#app',
    mounted: function() {
        window.addEventListener("resize", this.FPSGaugeResize);
        window.addEventListener("resize", this.FPSLineResize);
    },
    data: {
        isSupported: isSupported,
        sampleRate: (isSupported) ? afterEffectPlayer.audioContext.sampleRate : null,
        uploadedFileInput: {
            active: 0,
            item: [
                "Choose a music file to play",
                "Text a audio URL to play"
            ],
            file: null,
            URL: null
        },
        uploadedImageInput: {
            active: 0,
            item: [
                "Choose a picture",
                "Text a image URL to display"
            ],
            file: null,
            URL: null
        },
        musicDemo: [
            location.origin + "/instant/1.m4a",
            location.origin + "/instant/2.m4a"
        ],
        FPS_Log: [],
        FPS: 0,
        FPSpanel: true,
        FPSPanelShow: false,
        FPSGaugeChartShow: true,
        screenLimit: false,
        isPlayed: false,
        FPSLine: true,
        FPSLineShow: false,
        showRequirements: false,
        advanceOptions: {
            show: false,
        },
        options: {},
        url: null
    },
    computed: {
        GaugeFlexiable: function() {
            return Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)); //勾股定理
        },
        FPS_Gauge_Chart: function() {
            return {
                series: [{
                    name: 'FPS',
                    type: 'gauge',
                    max: 70,
                    axisLine: { // 坐标轴线
                        lineStyle: { // 属性lineStyle控制线条样式
                            color: [
                                [30 / 70, '#c23531'],
                                [50 / 70, '#63869e'],
                                [1, '#91c7ae']
                            ],
                            width: 10 / 2141 * this.GaugeFlexiable
                        }
                    },
                    splitLine: { // 分隔线
                        length: 16 / 2141 * this.GaugeFlexiable // 属性length控制线长
                    },
                    data: [{ value: this.FPS, name: 'FPS' }],
                    title: {
                        fontSize: 15 / 2141 * this.GaugeFlexiable
                    },
                    axisLabel: { // 坐标轴文本标签，详见axis.axisLabel
                        textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontSize: 12 / 2141 * this.GaugeFlexiable
                        }
                    },
                    pointer: {
                        width: 8 / 2141 * this.GaugeFlexiable
                    },
                    detail: {
                        textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                            fontSize: 30 / 2141 * this.GaugeFlexiable
                        }
                    }
                }]
            }
        },
        FPS_line_Chart: function() {
            return {
                tooltip: {
                    trigger: 'axis'
                },
                xAxis: {
                    data: this.FPS_Log.map(function(item) {
                        return new Date(item.targetTime).toLocaleTimeString();
                    })
                },
                yAxis: {
                    splitLine: {
                        show: false
                    }
                },
                toolbox: {
                    left: 'center',
                    feature: {
                        dataZoom: {
                            yAxisIndex: 'none'
                        },
                        restore: {},
                        saveAsImage: {}
                    }
                },
                dataZoom: [{
                    //startValue: ''
                }, {
                    type: 'inside'
                }],
                visualMap: {
                    top: 10,
                    right: 10,
                    pieces: [{
                        gt: 0,
                        lte: 30,
                        color: '#c23531'
                    }, {
                        gt: 30,
                        lte: 50,
                        color: '#63869e'
                    }, {
                        gt: 50,
                        lte: 70,
                        color: '#91c7ae'
                    }],
                    outOfRange: {
                        color: '#999'
                    }
                },
                series: {
                    name: 'FPS',
                    type: 'line',
                    data: this.FPS_Log.map(function(item) {
                        return item.FPS;
                    }),
                    smooth: true,
                    markLine: {
                        silent: true,
                        data: [{
                            yAxis: 30
                        }, {
                            yAxis: 50
                        }, {
                            yAxis: 60
                        }]
                    }
                }
            }
        },
        dragContainerText: function() {
            return this.$refs.dragContainer.querySelector(".container> h2")
        },
        FPSColor: function() {
            var FPS = this.FPS;
            if(FPS > 55){
                color = "#91c7ae";
            }else if(FPS > 30){
                color = "#63869e";
            }else{
                color = "#c23531";
            }
            return "color:" + color;
        }
    },
    methods: {
        dropdownSwicth: function(target, item) {
            target.active = item;
        },
        playMusic: function(url) {
            this.isPlayed = true;
            if(this.FPSpanel) this.FPSPanelShow = true;
            this.url = url;
            this.$nextTick(this.FPSGaugeResize);
        },
        loadMusicDemo: function(i) {
            this.playMusic(this.musicDemo[i]);
        },
        loadInputFile: function(e) {
            this.loadFile(e.target.files[0]);
        },
        loadFile: function(files) {
            this.loadMusicURL(URL.createObjectURL(files));
        },
        loadMusicURL: function(url) {
            var $url = (typeof url === "string")? url : this.uploadedFileInput.URL
            this.playMusic($url);
        },
        onended: function() {
            this.FPSPanelShow = this.isPlayed = false;
            if(this.FPSLine) this.FPSLineShow = true;
        },
        FPSGaugeChartShowToggle: function (){
            if(this.FPSGaugeChartShow) {
                this.FPSGaugeChartShow = false;
            } else{
                this.FPSGaugeChartShow = true;
                this.$nextTick(this.FPSGaugeResize);
            }
        },
        watchfps: function(FPS, FPS_now) {
            this.FPS = FPS;
            this.FPS_Log.push({ FPS: FPS, targetTime: FPS_now });
        },
        dragContainerDragenter: function() {
            this.dragContainerText.innerText = "Drop it on the container";
        },
        dragContainerDragover: function(e) {
            e.stopPropagation();
            e.preventDefault();
            //set the drop mode
            this.dragContainerText.innerText = "Drop it on the container";
            e.dataTransfer.dropEffect = 'copy';
        },
        dragContainerDragleave: function(e) {
            this.dragContainerText.innerText = "Drag&drop a music file there to play";
        },
        dragContainerDrop: function(e) {
            e.stopPropagation();
            e.preventDefault();
            this.dragContainerText.innerText = "Drag&drop a music file there to play";
            if (this.isSupported.state) {
                this.loadFile(e.dataTransfer.files[0]);
            }
        },
        FPSGaugeResize: function() {
            if(window.innerWidth > 1280 && window.innerHeight > 720) {
                this.screenLimit = false;
            }else{
                this.screenLimit = true;
                return;
            }
            var FPSGauge = this.$refs.FPSGauge;
            if(!FPSGauge) return;
            FPSGauge.$el.style.width = window.innerWidth * 0.16 + "px";
            FPSGauge.$el.style.height = window.innerHeight * 0.27 + "px";
            FPSGauge.$emit("resize");
        },
        FPSLineResize: function() {
            var FPSLine = this.$refs.FPSLine;
            if(!FPSLine) return;
            FPSLine.$el.style.width = FPSLine.$el.parentNode.offsetWidth + "px";
            FPSLine.$el.style.height =window.innerHeight * 0.8 + "px";
            FPSLine.$emit("resize");
        },
        reset: function() {
            window.location.reload();
        },
        changeFileBackground: function(e) {
            this.loadBackground(URL.createObjectURL(e.target.files[0]));
        },
        loadBackground: function(url) {
            var $url = (typeof url === "string")? url : this.uploadedImageInput.URL;
            document.body.style.backgroundImage = "url(" + $url + ")";
        }
    }
});
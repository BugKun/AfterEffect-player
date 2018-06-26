var afterEffectPlayer = new AfterEffectPlayer();

var supported = afterEffectPlayer.isSupport();

if(!supported.state){
    var num = supported.list.length, numText = "a moudle", are = "is";
    $(".error-content").fadeIn().find("#error-text").text("Your device is not supported! It is lack of serveral moudles, which are " + supported.list.join(", ") + ".");
}else if(afterEffectPlayer.audioContext.sampleRate !== 44100){
    $(".src-detected").fadeIn().find("#src-detected-text").text("SRC Detected! Please change Audio Driver sampling rates from " + (afterEffectPlayer.audioContext.sampleRate / 1000) + "khz to 44.1khz.");
}

function getStatus() {
    var state = {};
    state.showFPS = $("#Show-FPS").is(':checked');
    state.loadUrl = $("#Load-url").is(':checked');
    state.uploadedImage = $("#uploadedImage").prop('files');
    state.uploadedFile = $("#uploadedFile").prop('files');
    return state;
}

var FPS_Log = [], fileInterface = {
    music: {
        local: true
    },
    image: {
        local: true
    }
};

$(".uploadedFile .localFile").click(function () {
    fileInterface.music.local = true;
    $(".uploadedFile .custom-file").show();
    $(".uploadedFile .urlMode").hide();
    $(".uploadedFile .dropdown-toggle").text($(this).text());
});

$(".uploadedFile .urlFile").click(function () {
    fileInterface.music.local = false;
    $(".uploadedFile .custom-file").hide();
    $(".uploadedFile .urlMode").show();
    $(".uploadedFile .dropdown-toggle").text($(this).text());
});

$(".uploadedImage .localFile").click(function () {
    fileInterface.image.local = true;
    $(".uploadedImage .custom-file").show();
    $(".uploadedImage .urlMode").hide();
    $(".uploadedImage .dropdown-toggle").text($(this).text());
});

$(".uploadedImage .urlFile").click(function () {
    fileInterface.image.local = true;
    $(".uploadedImage .custom-file").hide();
    $(".uploadedImage .urlMode").show();
    $(".uploadedImage .dropdown-toggle").text($(this).text());
});

var GaugeFlexiable = Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)); //勾股定理


var FPS_Gauge_Option = {
    series: [
        {
            name: 'FPS',
            type: 'gauge',
            max: 70,
            axisLine: {            // 坐标轴线
                lineStyle: {       // 属性lineStyle控制线条样式
                    color: [[30 / 70, '#c23531'],[50 / 70, '#63869e'],[1, '#91c7ae']],
                    width: 10 / 2141 * GaugeFlexiable
                }
            },
            splitLine: {           // 分隔线
                length :16 / 2141 * GaugeFlexiable         // 属性length控制线长
            },
            data: [{value: 0, name: 'FPS'}],
            title : {
                fontSize: 15 / 2141 * GaugeFlexiable
            },
            axisLabel: {           // 坐标轴文本标签，详见axis.axisLabel
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontSize : 12 / 2141 * GaugeFlexiable
                }
            },
            pointer: {
                width : 8 / 2141 * GaugeFlexiable
            },
            detail: {
                textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
                    fontSize : 30 / 2141 * GaugeFlexiable
                }
            }
        }
    ]
};



$('#FPS-gauge').css({
    width: window.innerWidth * 0.16,
    height: window.innerHeight * 0.27
});
$("#FPS-line").css({
    height: window.innerHeight * 0.8
});
var FPS_Gauge = echarts.init($('#FPS-gauge')[0]);
var FPS_line = echarts.init($('#FPS-line')[0]);
$(window).resize(function () {
    $('#FPS-gauge').css({
        width: window.innerWidth * 0.16,
        height: window.innerHeight * 0.27
    });
    var _GaugeFlexiable = Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)); //勾股定理
    FPS_Gauge_Option.series[0].axisLine.lineStyle.width = 10 / 2141 * _GaugeFlexiable;
    FPS_Gauge_Option.series[0].splitLine.length = 16 / 2141 * _GaugeFlexiable;
    FPS_Gauge_Option.series[0].title.fontSize = 15 / 2141 * _GaugeFlexiable;
    FPS_Gauge_Option.series[0].axisLabel.textStyle.fontSize = 12 / 2141 * _GaugeFlexiable;
    FPS_Gauge_Option.series[0].detail.textStyle.fontSize = 30 / 2141 * _GaugeFlexiable;
    FPS_Gauge_Option.series[0].pointer.width = 8 / 2141 * _GaugeFlexiable;
    FPS_Gauge.resize();

    $("#FPS-line").css({
        width: $("#FPS-line-container .modal-body").width(),
        height: window.innerHeight * 0.8
    });
    FPS_line.resize();
});



var afterEffectPlayerOpt = {
    watchFPS: function (FPS, targetTime) {
        var color = "";
        if(FPS > 55){
            color = "#91c7ae";
        }else if(FPS > 30){
            color = "#63869e";
        }else{
            color = "#c23531";
        }
        FPS_Log.push({ targetTime: targetTime, FPS: FPS });
        $(".FPS .value").css("color", color).text(FPS);



        FPS_Gauge_Option.series[0].data[0].value = FPS;
        FPS_Gauge.setOption(FPS_Gauge_Option); // 使用刚指定的配置项和数据显示图表。
    },
    onended: function () {
        $(".player").fadeOut();
        $(".fileWrapper-container").fadeIn(function () {
            $("#FPS-line").css({
                width: $("#FPS-line-container .modal-body").width()
            });
            FPS_line.resize();
        });
        $(".FPS").fadeOut();
        $('#FPS-line-container').modal('show');
        var FPS_line_Option  = {
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                data: FPS_Log.map(function (item) {
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
                //startValue: '2014-06-01'
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
                data: FPS_Log.map(function (item) {
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
        };
        FPS_line.setOption(FPS_line_Option);
    }
};

$('.FPS .close[aria-label="Close"]').click(function () {
    $(".FPS").fadeOut();
});

function afterEffectPlayerStart(url){
    $(".FPS").fadeIn();
    FPS_Log = [];
    afterEffectPlayer.init(
        $(".player").fadeIn().get(0),
        url ,
        afterEffectPlayerOpt
    ).play();
    $(".fileWrapper-container").fadeOut();
}

$("#demo-music-1").click(function () {
    var url = location.origin + "/instant/1.m4a";
    afterEffectPlayerStart(url);
});

$("#demo-music-2").click(function () {
    var url = location.origin + "/instant/2.m4a";
    afterEffectPlayerStart(url);
});

$("#loadFile").click(function () {
    var url = $("#fileUrl").val();
    afterEffectPlayerStart(url);
});

$("#loadImage").click(function () {
    var url = $("#imageUrl").val();
    var background = new Image();
    background.onload = function(){
        $("body").css("backgroundImage", "url(" + url + ")");
    };
    background.onerror = function(e){
        console.log(e);
    };
    background.src = url;
    console.log(url);
});

$("#uploadedFile").change(function () {
    var file = this.files[0],
        fileAllName = file.name.split(".");
    fileAllName.pop();
    var fileName = fileAllName.join(".");
    console.log(fileName);
    var url = URL.createObjectURL(file);
    afterEffectPlayerOpt.title = fileName;
    afterEffectPlayerStart(url);
});

$("#uploadedImage").change(function () {
    var file = this.files[0];
    var url = URL.createObjectURL(file);
    $("body").css("backgroundImage", "url(" + url + ")");
});


//listen the drag & drop
var dragContainer = $('.dragContainer')[0];
dragContainer.addEventListener("dragenter", function () {
    $(".dragContainer h2").text("Drop it on the container");
});
dragContainer.addEventListener("dragover", function (e) {
    e.stopPropagation();
    e.preventDefault();
    //set the drop mode
    $(".dragContainer h2").text("Drop it on the container");
    e.dataTransfer.dropEffect = 'copy';
});
dragContainer.addEventListener("dragleave", function () {
    $(".dragContainer h2").text("Drag&drop a music file there to play");
});
dragContainer.addEventListener("drop", function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(".dragContainer h2").text("Drag&drop a music file there to play");
    if (supported.state) {
        var file = e.dataTransfer.files[0];
        var url = URL.createObjectURL(file);
        afterEffectPlayerStart(url);
    }
}, true);


// 监听键盘
$(document).keydown(function(event){
    if(event.keyCode === 32 && afterEffectPlayer.audio){
        (afterEffectPlayer.audio.paused)? afterEffectPlayer.play(): afterEffectPlayer.pause();
    }
    if(event.keyCode === 38 && afterEffectPlayer.audio){
        var volume = afterEffectPlayer.audio.volume;
        volume += 0.01;
        afterEffectPlayer.audio.volume = (volume > 1)? 1 : volume;
    }
    if(event.keyCode === 40 && afterEffectPlayer.audio){
        var volume = afterEffectPlayer.audio.volume;
        volume -= 0.01;
        afterEffectPlayer.audio.volume = (volume < 0)? 0 : volume;
    }
});

$("#toggle-FPS-gauge").on("click",function (e) {
    e.stopPropagation();
    e.preventDefault();
});

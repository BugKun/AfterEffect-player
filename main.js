function Visualizer() {
    this.file = null; //the current file
    this.fileName = null; //the current file name
    this.audioContext = null;
    this.info = document.querySelector('.info').innerHTML; //used to upgrade the UI information
    this.infoUpdateId = null; //to store the setTimeout ID and clear the interval
    this.animationId = null;
    this.progressId = null;
    this.status = 0; //flag for sound is playing 1 or stopped 0
    this.forceStop = false;
    this.ShowFPS = false;
    this.FPS = [];
    this.drawMeter_fps = null;
    this.progress_fps = null;
    this.clientWidth = document.body.clientWidth;
    this.clientHeight = document.body.clientHeight;
    this.init();
}

Visualizer.prototype = {
    constructor: Visualizer,
    init: function () {
        this._prepareAPI();
        this._addEventListner();
        if (this.audioContext.sampleRate !== 44100) document.querySelector(".SRC").innerText = "WARNING! SRC detective! Please change Audio Driver sampling rates from " + (this.audioContext.sampleRate / 1000) + "khz to 44.1khz.";
    },
    _prepareAPI: function () {
        //fix browser vender for AudioContext and requestAnimationFrame
        window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
        window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;
        try {
            this.audioContext = new AudioContext();
        } catch (e) {
            this._updateInfo('!Your browser does not support AudioContext', false);
            console.log(e);
        }
    },
    _addEventListner: function () {
        var that = this,
            audioInput = document.querySelector("#uploadedFile"),
            imageInput = document.querySelector("#uploadedImage");
        //listen the file upload
        audioInput.onchange = function () {
            if (that.audioContext === null) {
                return;
            }
            //the if statement fixes the file selction cancle, because the onchange will trigger even the file selection been canceled
            if (audioInput.files.length !== 0) {
                //only process the first file
                that.file = audioInput.files[0];
                that.fileName = that.file.name.replace(/.m4a|.mp3|.wma|.wav|.flac/i, "");
                that.url = URL.createObjectURL(that.file);
                if (that.status === 1) {
                    //the sound is still playing but we upload another file, so set the forceStop flag to true
                    that.forceStop = true;
                }
                document.querySelector('.fileWrapper').style.display = "block";
                document.querySelector('.layout').style.display = "none";
                that._updateInfo('Uploading', true);
                //once the file is ready,start the visualizer
                that._start();
            }
        };
        imageInput.onchange = function () {
            var _url = URL.createObjectURL(this.files[0]);
            document.body.style.backgroundImage = "url(" + _url + ")";
        };
        document.onkeydown = function (e) {
            if (e.keyCode == 32 && that.audio) {
                if (that.audio.paused) {
                    that.audio.play();
                } else {
                    that.audio.pause();
                }
            }
            if (e.keyCode == 38 && that.audio) {
                if (that.audio.volume < 1) that.audio.volume += 0.1;
            }
            if (e.keyCode == 40 && that.audio) {
                if (that.audio.volume >= 0) that.audio.volume -= 0.1;
            }
        };
        document.querySelector("#Show-FPS").onchange = function () {
            that.ShowFPS = this.checked;
            if (this.checked) {
                document.querySelector(".FPS").style.display = "block";
            } else {
                document.querySelector(".FPS").style.display = "none";
            }
        };
        document.querySelector("#Load-url").onchange = function () {
            if (this.checked) {
                document.querySelector(".uploadedFile").style.display = "none";
                document.querySelector(".loadurl").style.display = "block";
            } else {
                document.querySelector(".loadurl").style.display = "none";
                document.querySelector(".uploadedFile").style.display = "block";
            }
        };
        document.querySelector(".loadurl-btn").onclick = function () {
            if (document.querySelector("#loadurl").value !== "") {
                that.url = document.querySelector("#loadurl").value;
                that._updateInfo('Uploading', true);
                //once the file is ready,start the visualizer
                that._start();
            }
        };
        document.querySelector(".demo-music").onclick = function () {
            document.querySelector("#loadurl").value = "http://orlfnhziv.bkt.clouddn.com/My%20Truth.m4a";
            that.fileName = "My Truth～ロンド・カプリチオーソ";
            document.querySelector(".loadurl-btn").click();
        };

        var drag = false;

        document.querySelector(".layout-process").onmousedown = function (e) {
            var layout = document.querySelector(".layout"),
                layout_process = document.querySelector(".layout-process"),
                layoutLeft = layout.offsetLeft - layout_process.offsetWidth / 2,
                pointerLeft = (e.pageX - layoutLeft - layout_process.offsetHeight / 2) / (layout_process.offsetWidth - layout_process.offsetHeight),
                $pointerLeft = (pointerLeft < 0) ? 0 : (pointerLeft > 1) ? 1 : pointerLeft;
            if (that.audio) that.audio.currentTime = $pointerLeft * that.audio.duration;
            drag = true;
        };
        document.body.onmousemove = function (e) {
            if (!drag) return false;
            var layout = document.querySelector(".layout"),
                layout_process = document.querySelector(".layout-process"),
                layoutLeft = layout.offsetLeft - layout_process.offsetWidth / 2,
                pointerLeft = (e.pageX - layoutLeft - layout_process.offsetHeight / 2) / (layout_process.offsetWidth - layout_process.offsetHeight),
                $pointerLeft = (pointerLeft < 0) ? 0 : (pointerLeft > 1) ? 1 : pointerLeft;
            if (that.audio) that.audio.currentTime = $pointerLeft * that.audio.duration;
        };
        document.body.onmouseup = function (e) {
            if (!drag) return false;
            var layout = document.querySelector(".layout"),
                layout_process = document.querySelector(".layout-process"),
                layoutLeft = layout.offsetLeft - layout_process.offsetWidth / 2,
                pointerLeft = (e.pageX - layoutLeft - layout_process.offsetHeight / 2) / (layout_process.offsetWidth - layout_process.offsetHeight),
                $pointerLeft = (pointerLeft < 0) ? 0 : (pointerLeft > 1) ? 1 : pointerLeft;
            if (that.audio) that.audio.currentTime = $pointerLeft * that.audio.duration;
            drag = false;
        };

        //listen the drag & drop
        document.querySelector('.dragContainer').addEventListener("dragenter", function () {
            that._updateInfo('Drop it on the container', true);
        });
        document.querySelector('.dragContainer').addEventListener("dragover", function (e) {
            e.stopPropagation();
            e.preventDefault();
            //set the drop mode
            e.dataTransfer.dropEffect = 'copy';
        });
        document.querySelector('.dragContainer').addEventListener("dragleave", function () {
            that._updateInfo(that.info, false);
        });
        document.querySelector('.dragContainer').addEventListener("drop", function (e) {
            e.stopPropagation();
            e.preventDefault();
            if (that.audioContext === null) {
                return;
            }
            document.querySelector('.fileWrapper').style.display = "none";
            document.querySelector('.layout').style.display = "none";
            that._updateInfo('Uploading', true);
            //get the dropped file
            that.file = e.dataTransfer.files[0];
            that.url = URL.createObjectURL(that.file);
            document.querySelector('.layout').style.display = "block";
            if (that.status === 1) {
                document.querySelector('.fileWrapper').style.display = "block";
                that.forceStop = true;
            }
            that.fileName = that.file.name.replace(/.m4a|.mp3|.wma|.wav|.flac/i, "");
            //once the file is ready,start the visualizer
            that._start();
        }, true);

    },
    _start: function () {
        //read and decode the file into audio array buffer

        this._visualize(this.audioContext);
    },
    _visualize: function (audioContext) {
        var that = this;
        //connect the source to the analyser

        if (document.querySelector("audio")) document.body.removeChild(document.querySelector("audio"));
        var _audio = this.audio = new Audio();
        _audio.src = this.url;
        _audio.crossOrigin = "anonymous";
        document.body.appendChild(_audio);
        _audio.onerror = function () {
            var code = this.error.code;
            document.querySelector('.fileWrapper').style.display = "block";
            document.querySelector('.layout').style.display = "none";
            if (code === 3 || code === 4) {
                that._updateInfo('!Fail to decode the file', false);
            }
        };

        var analyser = this.audioContext.createAnalyser();
        var audioBufferSouceNode = this.audioBufferSouceNode = this.audioContext.createMediaElementSource(this.audio);


        audioBufferSouceNode.connect(analyser);


        analyser.connect(audioContext.destination);
        //then assign the buffer to the buffer source node

        //play the source
        if (!audioBufferSouceNode.start) {
            audioBufferSouceNode.start = audioBufferSouceNode.noteOn;//in old browsers use noteOn method
            audioBufferSouceNode.stop = audioBufferSouceNode.noteOff; //in old browsers use noteOff method
        }

        //stop the previous sound if any
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            cancelAnimationFrame(this.progressId);
        }

        this.status = 1;

        document.querySelector('.player').style.display = "block";

        this.audio.onended = function () {
            that._audioEnd(that);
            cancelAnimationFrame(that.animationId);
            cancelAnimationFrame(that.progressId);

            that.audio = null;
            //document.body.removeChild(that.audio);
        };

        this._progress();
        this._updateInfo('Playing ' + this.fileName, false);
        this.info = 'Playing ' + this.fileName;
        document.querySelector('.fileWrapper').style.display = "none";
        document.querySelector('.layout').style.display = "block";
        document.querySelector('.layout-title').innerText = this.fileName;


        this.audio.play();
        this._drawSpectrum(analyser);
    },
    _progress: function () {
        var that = this;
        var pointer = document.querySelector(".layout-process"), context = pointer.getContext('2d');
        var shining = 0.5;
        var shine = true;
        var time = 0;
        var _audio = this.audio;

        function fixLength(num, length) {
            return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
        }

        var duration = "", currentTime = "", $ELAPSED = document.querySelector(".layout-time-ELAPSED"),
            $REMAINED = document.querySelector(".layout-time-REMAINED");
        var _REMAINED = $REMAINED.querySelector("span");
        var _ELAPSED = $ELAPSED.querySelector("span");

        if (!_ELAPSED) {
            _ELAPSED = document.createElement("span");
            $ELAPSED.appendChild(_ELAPSED);
        }

        if (!_REMAINED) {
            _REMAINED = document.createElement("span");
            $REMAINED.insertBefore(_REMAINED, $REMAINED.childNodes[0]);
        }

        if (this.ShowFPS) {
            this.FPS[1] = 0;
            var last = Date.now();
            if (!this.drawMeter_fps) {
                this.progress_fps = document.createElement("p");
                this.progress_fps.style.color = "#F90";
                document.querySelector(".FPS").appendChild(this.progress_fps);
            }
        }


        var progress_init = function () {
            pointer.width = pointer.offsetWidth;
            pointer.height = pointer.offsetHeight;

            context.clearRect(0, 0, pointer.offsetWidth, pointer.offsetHeight);

            context.beginPath();
            context.lineWidth = pointer.offsetHeight * 0.05;
            context.strokeStyle = "#fff";
            context.moveTo(pointer.offsetHeight / 2, (pointer.offsetHeight - context.lineWidth) / 2);
            context.lineTo(pointer.offsetWidth - pointer.offsetHeight / 2, (pointer.offsetHeight - context.lineWidth) / 2);
            context.stroke();
            context.restore();

            context.save();
            context.beginPath();
            context.fillStyle = "rgba(136,235,255,0.3)";
            context.strokeStyle = '#88ebff';


            if (shine) {
                shining += 0.01;
                if (shining >= 1) shine = false;
            } else {
                shining -= 0.01;
                if (shining <= 0.6) shine = true;
            }

            var arc = {
                x: pointer.offsetHeight / 2 + _audio.currentTime / _audio.duration * (pointer.offsetWidth - pointer.offsetHeight),
                y: pointer.offsetHeight / 2,
                r: pointer.offsetHeight / 2
            };

            context.translate(arc.x * (1 - shining), arc.y * (1 - shining));
            context.scale(shining, shining);
            context.arc(arc.x, arc.y, arc.r, 0, 2 * Math.PI, false);
            context.closePath();
            context.fill();
            context.stroke();
            context.restore();

            context.beginPath();
            context.fillStyle = "#fff";
            context.arc(arc.x, arc.y, arc.r / 1.5 - arc.r / 3.75, 0, 2 * Math.PI, false);
            context.fill();

            context.save();
            context.translate(arc.x, arc.r);
            context.rotate(time * 2 * Math.PI / 180);//设定每次旋转的度数
            context.translate(-arc.x, -arc.r);
            context.beginPath();
            context.lineWidth = 5;
            context.strokeStyle = '#fff';
            context.arc(arc.x, arc.y, arc.r / 1.5 - arc.r / 7.5, -45 * Math.PI / 180, 45 * Math.PI / 180);
            context.stroke();
            context.beginPath();
            context.strokeStyle = "#fff";
            context.arc(arc.x, arc.y, arc.r / 1.5 - arc.r / 7.5, -135 * Math.PI / 180, 135 * Math.PI / 180, true);
            context.stroke();
            context.restore();
            time += 1;


            if (that.ShowFPS) {
                var offset = Date.now() - last;
                that.FPS[0] += 1;
                if (offset >= 1000) {
                    last += offset;
                    that.progress_fps.innerText = "pointer: " + that.FPS[0];
                    that.FPS[0] = 0;
                }
            }

            var _duration = fixLength(Math.floor((_audio.duration - _audio.currentTime) / 60), 2) + "：" + fixLength(Math.floor((_audio.duration - _audio.currentTime) % 60), 2),
                _currentTime = fixLength(Math.floor(_audio.currentTime / 60), 2) + "：" + fixLength(Math.floor(_audio.currentTime % 60), 2);
            if (duration !== _duration) {
                duration = _duration;
                _REMAINED.innerText = duration;
            }
            if (currentTime !== _currentTime) {
                currentTime = _currentTime;
                _ELAPSED.innerText = currentTime;
            }

            that.progressId = requestAnimationFrame(progress_init);
        };
        setTimeout(function () {
            pointer.width = pointer.offsetWidth;
            pointer.height = pointer.offsetHeight;
            that.progressId = requestAnimationFrame(progress_init);
        }, 50);
    },
    drawRoundedRect: function(cxt, opt) {
        var x = opt.x,
            y = opt.y,
            w = opt.w,
            h = opt.h,
            r = opt.r;
        cxt.beginPath();
        cxt.moveTo(x + r, y);
        cxt.arcTo(x + w, y, x + w, y + h, r);
        cxt.arcTo(x + w, y + h, x, y + h, r);
        cxt.arcTo(x, y + h, x, y, r);
        cxt.arcTo(x, y, x + w, y, r);
        cxt.fill();
        cxt.closePath();
    },
    _drawSpectrum: function (analyser) {
        var that = this,
            canvas = document.querySelector('.player');
        canvas.height = document.body.clientHeight - 5;
        canvas.width = document.body.clientWidth;

        var cwidth = canvas.width,
            cheight = canvas.height,
            meterNum = 300; //count of the meters

        window.onresize = function () {
            cheight = that.clientHeight = canvas.height = document.body.clientHeight;
            cwidth = that.clientWidth = canvas.width = document.body.clientWidth;
        };


        if (this.ShowFPS) {
            this.FPS[1] = 0;
            var last = Date.now();
            if (!this.drawMeter_fps) {
                this.drawMeter_fps = document.createElement("p");
                this.drawMeter_fps.style.color = "#F90";
                document.querySelector(".FPS").appendChild(this.drawMeter_fps);
            }
        }

        var drawMeter = function () {
            var array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            if (that.status === 0) {
                //fix when some sounds end the value still not back to zero
                for (var i = array.length - 1; i >= 0; i--) {
                    array[i] = 0;
                }

            }

            var cxt = canvas.getContext('2d');
            var step = Math.round(array.length / meterNum); //sample limited data from the total array
            var hslStep = 100 / meterNum;
            cxt.clearRect(0, 0, cwidth, cheight);
            for (var i = 0; i < meterNum; i++) {
                var value = 0, TRE = 0;
                if (i < (meterNum / 2)) {
                    value = array[i * step];
                    TRE = array[array.length / 2 + i * step];
                } else {
                    value = array[(meterNum - i) * step];
                    TRE = array[array.length / 2 + (meterNum - i) * step];
                }


                cxt.save();//将当前以左上角坐标为(0,0)的上下文环境进行保存，这样是为了在接下来中要进行画布偏移后，可以进行还原当前的环境
                cxt.translate(that.clientWidth / 2, that.clientHeight / 2);
                cxt.rotate(i * 1.2 * Math.PI / 180);//设定每次旋转的度数


                cxt.beginPath();
                var r = 0;
                if (that.clientHeight >= that.clientWidth) {
                    r = that.clientWidth / 2;
                } else {
                    r = that.clientHeight / 2;
                }
                var grd = cxt.createRadialGradient(0, (r - TRE) * .7, 1, 0, (r - TRE) * .7, 5);
                if (Math.floor(310 + hslStep * i) < 360) {
                    grd.addColorStop(0, "hsla(" + Math.floor(310 + hslStep * i) + ",90%,50%,1)");
                    grd.addColorStop(1, "hsla(" + Math.floor(310 + hslStep * i) + ",90%,50%,0)");
                } else {
                    grd.addColorStop(0, "hsla(" + Math.floor(-50 + hslStep * i) + ",90%,50%,1)");
                    grd.addColorStop(1, "hsla(" + Math.floor(-50 + hslStep * i) + ",90%,50%,0)");
                }
                cxt.fillStyle = grd;
                cxt.arc(0, (r - TRE) * .7, 4, 0, 2 * Math.PI, false);


                cxt.closePath();
                cxt.fill();
                cxt.restore();
                cxt.save();

                cxt.beginPath();
                cxt.translate(that.clientWidth / 2, that.clientHeight / 2);
                cxt.rotate(Math.PI / 2 + (i * 1.2 * Math.PI / 180));//设定每次旋转的度数

                if (Math.floor(310 + hslStep * i) < 360) {
                    cxt.fillStyle = "hsl(" + Math.floor(310 + hslStep * i) + ",90%,50%)";
                } else {
                    cxt.fillStyle = "hsl(" + Math.floor(-50 + hslStep * i) + ",90%,50%)";
                }

                that.drawRoundedRect(cxt, { x: r * .7 + 8, y: 0, w: value * .6 + 5, h: 4, r: 2});


                cxt.restore();//将当前的点还原为（0,0）,其实在save中就是将上下文环境保存到栈中，在restore下面对其进行还原

            }


            if (that.ShowFPS) {
                var offset = Date.now() - last;
                that.FPS[1] += 1;
                if (offset >= 1000) {
                    last += offset;
                    that.drawMeter_fps.innerText = "drawMeter: " + that.FPS[1];
                    that.FPS[1] = 0;
                }
            }

            that.animationId = requestAnimationFrame(drawMeter);
        };
        this.animationId = requestAnimationFrame(drawMeter);


    },
    _audioEnd: function (instance) {
        if (this.forceStop) {
            this.forceStop = false;
            this.status = 1;
            return;
        }
        this.status = 0;
        //pointer进度重置为0
        var text = 'AfterEffect player by chau (powered by HTML5 Audio API)';
        document.querySelector('.fileWrapper').style.display = "block";
        document.querySelector('.layout').style.display = "none";
        document.querySelector('.player').style.display = "none";
        document.querySelector('.info').innerHTML = text;
        instance.info = text;
        document.querySelector("#uploadedFile").value = '';
    },
    _updateInfo: function (text, processing) {
        var infoBar = document.querySelector('.info'),
            dots = '...',
            i = 0,
            that = this;
        infoBar.innerText = text + dots.substring(0, i++);
        if (this.infoUpdateId !== null) {
            clearTimeout(this.infoUpdateId);
        }
        if (processing) {
            //animate dots at the end of the info text
            var animateDot = function () {
                if (i > 3) {
                    i = 0
                }
                infoBar.innerHTML = text + dots.substring(0, i++);
                that.infoUpdateId = setTimeout(animateDot, 250);
            };
            this.infoUpdateId = setTimeout(animateDot, 250);
        }

    }
};
new Visualizer();
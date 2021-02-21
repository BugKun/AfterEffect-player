import AudioAnalyser from "./lib/AudioAnalyser"
import fixLength from "./util/fixLength"

const requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame,
    cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.msCancelAnimationFrame;


class Drawer extends AudioAnalyser {
    constructor() {
        super();
        this.canvas = this.canvas || document.createElement("canvas");
        this.ctx = this.canvas.getContext('2d');
        this.canvasWidth = 300;
        this.canvasHeight = 300;
        this.FPS = 0;
        this.radius = 0;
        this.drawRenderID = null;
        this.shine = true;
        this.shining = 0.5;
        this.rotateTime = 0;
        this.progressBar = {};
    }

    drawerInit(node, file, options) {
        this.getSize(node);
        this.appendToNode();
        this.draw();
        return this;
    }

    isSupport() {
        let supported = super.isSupport();
        if (supported.state) {
            supported.list = [];
        }
        if (!this.canvas.getContext) supported.list.push("canvas");
        if (!requestAnimationFrame) supported.list.push("requestAnimationFrame");
        if (!cancelAnimationFrame) supported.list.push("cancelAnimationFrame");

        if (supported.list.length > 0) {
            supported.state = false;
            return supported;
        }

        return { state: true };
    }

    getSize(node = this.node) {
        if (node.clientWidth > 300) {
            this.canvas.width = this.canvasWidth = node.clientWidth;
        } else if (node.clientWidth === 0) {
            throw new Error("no Width");
        }
        if (node.clientHeight > 300) {
            this.canvas.height = this.canvasHeight = node.clientHeight;
        } else if (node.clientHeight === 0) {
            throw new Error("no Height");
        }

        return { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight };
    }

    appendToNode(node = this.node) {
        node.appendChild(this.canvas);
    }

    draw() {
        const analyser = super.getAnalyser();

        let FPS = 0,
            FPS_last = Date.now();

        const drawRender = () => {

            const content = this.drawFrequencyRender(analyser);
            this.drawProgressRender(content);
            this.drawTitle(content);
            this.drawTime(content);

            let FPS_now = Date.now(),
                FPS_offset = FPS_now - FPS_last;
            FPS += 1;
            if (FPS_offset >= 1000) {
                FPS_last += FPS_offset;
                this.FPS = FPS;
                if (typeof this.options.watchFPS === "function") this.options.watchFPS(FPS, FPS_now);
                FPS = 0;
            }

            if (this.audio.ended) {
                cancelAnimationFrame(this.drawRenderID);
            } else {
                this.drawRenderID = requestAnimationFrame(drawRender);
            }
        };

        this.drawRenderID = requestAnimationFrame(drawRender);
    }

    drawRoundedRect(cxt, opt) {
        const x = opt.x,
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
    }

    drawFrequencyRender(analyser) {
        const { frequencyLeft, frequencyRight } = analyser.getByteFrequency(),
            { canvasWidth, canvasHeight } = (this.options.DynamicResolution) ? this.getSize() : { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight },
            cxt = this.ctx;


        if (this.options.DynamicResolution) this.getSize();

        const r = this.radius = (canvasHeight < canvasWidth) ? canvasHeight / 2 : canvasWidth / 2,
            nike = 1 / r + r / 40, // 对勾（耐克）函数
            meterNum = 2 * Math.PI * r / nike;

        //console.log(meterNum);

        let step = frequencyLeft.length / meterNum; //sample limited data from the total array
        let hslStep = 100 / meterNum;

        cxt.clearRect(0, 0, canvasWidth, canvasHeight);
        cxt.save(); //将当前以左上角坐标为(0,0)的上下文环境进行保存，这样是为了在接下来中要进行画布偏移后，可以进行还原当前的环境


        for (let i = 0; i < meterNum; i++) {
            let value = 0,
                TRE = 0;
            if (i < (meterNum / 2)) {
                const valueStep = Math.round(i * step); //提取中低频
                value = frequencyLeft[valueStep];

                const TREStep = Math.round(frequencyLeft.length / 2 + i * step), // 提取高频
                    TREStepFix = (TREStep < frequencyLeft.length) ? TREStep : frequencyLeft.length - 1;
                TRE = frequencyLeft[TREStepFix];
            } else {
                const valueStep = Math.round((meterNum - i) * step), //提取中低频
                    valueStepFix = (valueStep < 0) ? 0 : valueStep;
                value = frequencyRight[valueStepFix];

                const TREStep = Math.round(frequencyRight.length / 2 + (meterNum - i) * step), // 提取高频
                    TREStepFix = (TREStep < frequencyRight.length) ? TREStep : frequencyRight.length - 1;
                TRE = frequencyRight[TREStepFix];
            }


            cxt.translate(canvasWidth / 2, canvasHeight / 2);
            cxt.rotate(360 / meterNum * i * Math.PI / 180); //设定每次旋转的度数



            const PWL = 255, //最大电平 255
                circlePosition = .7,
                TRELimit = .5,
                TREMeter = r - TRE * r / PWL * TRELimit,
                coefficient = r / 526;

            cxt.beginPath();

            const grd = cxt.createRadialGradient(0, TREMeter * circlePosition, 1 * coefficient, 0, TREMeter * circlePosition, 5 * coefficient);

            if (Math.floor(310 + hslStep * i) < 360) {
                grd.addColorStop(0, "hsla(" + Math.floor(310 + hslStep * i) + ",90%,50%,1)");
                grd.addColorStop(1, "hsla(" + Math.floor(310 + hslStep * i) + ",90%,50%,0)");
            } else {
                grd.addColorStop(0, "hsla(" + Math.floor(-50 + hslStep * i) + ",90%,50%,1)");
                grd.addColorStop(1, "hsla(" + Math.floor(-50 + hslStep * i) + ",90%,50%,0)");
            }
            cxt.fillStyle = grd;
            cxt.arc(0, TREMeter * circlePosition, 4 * coefficient, 0, 2 * Math.PI, false);


            cxt.closePath();
            cxt.fill();
            cxt.restore();
            cxt.save();

            cxt.beginPath();
            cxt.translate(canvasWidth / 2, canvasHeight / 2);

            cxt.rotate((90 + 360 / meterNum * i) * Math.PI / 180); //设定每次旋转的度数

            if (Math.floor(310 + hslStep * i) < 360) {
                cxt.fillStyle = "hsl(" + Math.floor(310 + hslStep * i) + ",90%,50%)";
            } else {
                cxt.fillStyle = "hsl(" + Math.floor(-50 + hslStep * i) + ",90%,50%)";
            }

            const ring = {
                x: 8 * coefficient,
                w: 5 * coefficient
            };

            this.drawRoundedRect(cxt, { x: r * circlePosition + ring.x, y: 0, w: value * r * (1 - circlePosition) / PWL + ring.w, h: 4 * coefficient, r: 2 * coefficient });


            cxt.restore(); //将当前的点还原为（0,0）,其实在save中就是将上下文环境保存到栈中，在restore下面对其进行还原
            cxt.save(); //将当前以左上角坐标为(0,0)的上下文环境进行保存，这样是为了在接下来中要进行画布偏移后，可以进行还原当前的环境

        }

        return r;
    }

    drawTitle(r) {
        const { canvasWidth, canvasHeight } = { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight },
        context = this.ctx,
            title = this.options.title || "";

        let titleFontSize = r * .1;
        context.font = `${ titleFontSize }px normal`;
        let titleWidth = context.measureText(title).width;

        if (titleWidth > r) {
            titleFontSize = r / titleWidth * titleFontSize;
            context.font = `${ titleFontSize }px normal`;
            titleWidth = context.measureText(title).width;
        }
        context.fillText(title, (canvasWidth - titleWidth) / 2, canvasHeight / 2 - r * .3);
        context.restore();
        context.save();
    }

    drawProgressRender(r) {
        const { canvasWidth, canvasHeight } = { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight },
        context = this.ctx,
            coefficient = r / 526,
            progressBarHeight = this.progressBar.height = canvasHeight * 0.004,
            progressBarTop = this.progressBar.top = (canvasHeight - progressBarHeight) / 2, // canvasHeight / 2 - progressBarHeight /2
            progressBarWidth = this.progressBar.width = r * 1.2,
            progressBarStart = this.progressBar.start = (canvasWidth - progressBarWidth) / 2,
            progressBarEnd = this.progressBar.end = (canvasWidth + progressBarWidth) / 2;


        context.beginPath();
        context.lineWidth = progressBarHeight;
        context.strokeStyle = "#fff";
        context.moveTo(progressBarStart, progressBarTop);
        context.lineTo(progressBarEnd, progressBarTop);
        context.stroke();
        context.closePath();
        context.restore();
        context.save();

        context.beginPath();
        context.fillStyle = "rgba(136,235,255,0.3)";
        context.strokeStyle = '#88ebff';
        context.save();

        if (this.shine) {
            this.shining += 0.01;
            if (this.shining >= 1) this.shine = false;
        } else {
            this.shining -= 0.01;
            if (this.shining <= 0.6) this.shine = true;
        }

        const arc = {
            x: progressBarStart + this.audio.currentTime / this.audio.duration * r * 1.2,
            y: progressBarTop,
            r: r / 10
        };

        this.progressBar.pionterRadius = arc.r;

        context.translate(arc.x * (1 - this.shining), arc.y * (1 - this.shining));
        context.scale(this.shining, this.shining);
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

        context.translate(arc.x, arc.y);
        context.rotate(this.rotateTime * 2 * Math.PI / 180); // 设定每次旋转的度数
        context.translate(-arc.x, -arc.y);
        context.beginPath();
        context.lineWidth = 5 * coefficient;
        context.strokeStyle = '#fff';


        context.arc(arc.x, arc.y, arc.r / 1.5 - arc.r / 7.5, -45 * Math.PI / 180, 45 * Math.PI / 180);
        context.stroke();
        context.beginPath();
        context.strokeStyle = "#fff";
        context.arc(arc.x, arc.y, arc.r / 1.5 - arc.r / 7.5, -135 * Math.PI / 180, 135 * Math.PI / 180, true);
        context.stroke();
        context.restore();
        context.save();
        this.rotateTime += 1;

    }

    drawTime(r) {
        const { canvasWidth, canvasHeight } = { canvasWidth: this.canvasWidth, canvasHeight: this.canvasHeight },
        context = this.ctx;

        const Elapsed = "ELAPSED",
            ElapsedFontSize = r * .04;
        context.font = `${ ElapsedFontSize }px normal`;
        const ElapsedWidth = context.measureText(Elapsed).width;
        context.fillText(Elapsed, canvasWidth / 2 - r * .6, canvasHeight / 2 + r * .3 - ElapsedFontSize / 2);

        const ElapsedTimeFontSize = r * .09,
            audioCurrentTime = this.audio.currentTime,
            ElapsedMinutess = fixLength(Math.floor(audioCurrentTime / 60), 2),
            ElapsedSeconds = fixLength(Math.floor(audioCurrentTime) % 60, 2),
            ElapsedTime = `${ ElapsedMinutess }：${ ElapsedSeconds }`;
        context.font = `${ ElapsedTimeFontSize }px normal`;
        const ElapsedTimeWidth = context.measureText(ElapsedTime).width;
        context.fillText(ElapsedTime, canvasWidth / 2 - r * (0.6 - 0.05) + ElapsedWidth, canvasHeight / 2 + r * .3);


        const Remained = "REMAINED",
            RemainedFontSize = r * .04;
        context.font = `${ RemainedFontSize }px normal`;
        const RemainedWidth = context.measureText(Remained).width;

        context.save();

        const RemainedTimeFontSize = r * .09,
            audioDuration = this.audio.duration,
            timeBetween = audioDuration - audioCurrentTime,
            RemainedMinutess = fixLength(Math.floor(timeBetween / 60), 2),
            RemainedSeconds = fixLength(Math.floor(timeBetween) % 60, 2),
            RemainedTime = `${ RemainedMinutess }：${ RemainedSeconds }`;
        context.font = `${ RemainedTimeFontSize }px normal`;
        const RemainedTimeWidth = context.measureText(RemainedTime).width;
        context.fillText(RemainedTime, canvasWidth / 2 + r * .04, canvasHeight / 2 + r * .3);

        context.restore();
        context.fillText(Remained, canvasWidth / 2 + r * (0.04 + 0.045) + RemainedTimeWidth, canvasHeight / 2 + r * .3 - RemainedFontSize / 2);


        context.save();
    }
}

export default Drawer;
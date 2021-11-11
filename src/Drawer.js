import AudioAnalyser from "./lib/AudioAnalyser"
import Color from "./util/color"
import * as PIXI from './pixi.js'
let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}
PIXI.utils.sayHello(type)

class Drawer extends AudioAnalyser {
    constructor() {
        super();
        this.app = null
    }

    initDrawer(options) {
        // The application will create a renderer using WebGL, if possible,
        // with a fallback to a canvas render. It will also setup the ticker
        // and the root stage PIXI.Container
        this.options.render = {
            width: window.innerWidth,
            height: window.innerHeight,
            antialias: true,
            autoDensity: true,
            resolution: 2,
            backgroundAlpha: 0,
            // forceCanvas: true, // prevents selection of WebGL renderer, even if such is present, this option only is available when using pixi.js-legacy or @pixi/canvas-renderer modules, otherwise it is ignored.(less than version 5)
            ...options
        }
        this.app = new PIXI.Application(this.options.render);

         // The application will create a canvas element for you that you
        // can then insert into the DOM
        const analyser = super.getAnalyser();
        this.analyser = analyser
        this.mainRender(analyser)
        return this;
    }

    // 画圆角矩形
    drawRoundedRect(opt) {
        const {width, height, radius, color} = opt
        var graphics = new PIXI.Graphics();
        graphics.beginFill(color);
        graphics.drawRoundedRect(0, 0, width, height, radius);
        return graphics;
    }

    // 画中心渐变的圆形
    drawBlurredCircle({hue, radius}) {
        const canvas = document.createElement('canvas');
        canvas.width = radius;
        canvas.height = radius;
        const cxt = canvas.getContext('2d')
        canvas.width = radius * 2;
        canvas.height = radius * 2;
        cxt.beginPath();
        var grd=cxt.createRadialGradient(radius, radius, 0, radius, radius, radius);
        grd.addColorStop(0, "hsla(" + hue + ",90%,50%,1)");
        grd.addColorStop(1, "hsla(" + hue + ",90%,50%,0)");
        cxt.arc(radius, radius, radius, 0, 2 * Math.PI);
        cxt.fillStyle = grd;
        cxt.fill();
        cxt.closePath();
        const graphics = new PIXI.Sprite.from(canvas);
        canvas.remove()
        return graphics;
    }

    // 画播放器进度条上的按钮
    drawPlayerPointer(size) {
        const container = new PIXI.Container();
        const ringRadius = size * 0.037

        const ring = new PIXI.Graphics();
        ring.beginFill(0x88EBFF, 0.3);
        ring.lineStyle(1, 0x88ebff, 1);
        ring.drawCircle(0, 0, ringRadius);
        ring.endFill();
        container.addChild(ring);

        const circle = new PIXI.Graphics();
        circle.beginFill(0xFFFFFF);
        circle.drawCircle(0, 0, ringRadius * 0.5);
        circle.endFill();
        container.addChild(circle);

        const semicircle1 = new PIXI.Graphics();
        const arcRadius = ringRadius * 0.75
        const lineWidth = size * 0.0034
        semicircle1.lineStyle(lineWidth, 0xFFFFFF);
        const arcRight = {
            r: arcRadius, // 圆的半径
            sAngle: -45 * Math.PI / 180, // 起始角，以弧度计。（弧的圆形的三点钟位置是 0 度）。
            eAngle: 45 * Math.PI / 180, // 结束角，以弧度计。
        }
        semicircle1.arc(0, 0, arcRight.r, arcRight.sAngle, arcRight.eAngle);
        semicircle1.endFill();
        container.addChild(semicircle1);

        const semicircle2 = new PIXI.Graphics();
        const arcLeft = {
            r: arcRadius,
            sAngle: -135 * Math.PI / 180,
            eAngle: 135 * Math.PI / 180,
            counterclockwise: true // 规定应该逆时针还是顺时针绘图。False = 顺时针，true = 逆时针。
        }
        semicircle2.lineStyle(lineWidth, 0xFFFFFF);
        semicircle2.arc(0, 0, arcLeft.r, arcLeft.sAngle, arcLeft.eAngle, arcLeft.counterclockwise);
        semicircle2.endFill();
        container.addChild(semicircle2);

        return container
    }

    // 渲染播放器的环
    ringRender(size) {
        const container = new PIXI.Container();
        const graphics = new PIXI.Graphics();

        const roundBoxWidth = size * 0.125;
        const halfSize = size / 2

        var radius = halfSize - roundBoxWidth,
            // meterNum = 2;
            meterNum = halfSize / 360 * 200;

        console.log(radius, 'radius')

        let hslStep = 100 / meterNum;

        // 每次旋转的角度
        const angle = 360 / meterNum / 180 * Math.PI
        // console.log(meterNum)

        let blurredCircles = []
        let roundBoxes = []
        for(let i = 0; i < meterNum; i++) {
            // 选定圆环的颜色
            const hue = (Math.floor(310 + angle * i) < 360)? Math.floor(310 + hslStep * i) % 360 : Math.floor(-50 + hslStep * i) % 360
            const color = new Color(`hsl(${hue}, 90%, 50%)`)
            // 画往内收缩的圆形
            const blurredCircle = this.drawBlurredCircle({hue: hue, radius: size * 0.005})
            // 画往外展开的圆角矩形
            const roundBox = this.drawRoundedRect({color: Number(color.toString('hex').replace('#', '0x')), width: roundBoxWidth, height: size * 0.0042, radius: size * 0.0021})
            const rotation = 0 + angle * i;
            const radian = rotation
            // 根据圆的半径和角度求坐标
            roundBox.x = halfSize + radius * Math.cos(radian);
            roundBox.y = halfSize + radius * Math.sin(radian) - roundBox.height / 2;
            roundBox.rotation = rotation;
            blurredCircle.x = halfSize + radius * Math.cos(radian);
            blurredCircle.y = halfSize + radius * Math.sin(radian);
            blurredCircle.rotation = rotation;
            // 加入逐帧渲染的队列
            roundBoxes.push(roundBox)
            blurredCircles.push(blurredCircle)

            graphics.addChild(roundBox)
            graphics.addChild(blurredCircle)
        }
        // 中心旋转90度
        graphics.pivot.set(halfSize, halfSize);
        graphics.rotation = 90 / 180 * Math.PI;
        graphics.position.x = halfSize
        graphics.position.y = halfSize

        container.addChild(graphics)

        return {roundBoxes, blurredCircles, container}
    }

    // 中间播放面板
    controllPanelRender(size, options) {
        const container = new PIXI.Container();

        const pointer = this.drawPlayerPointer(size)

        const progressXStartPosition = pointer.width / 4;
        const progressYPosition = size * 0.2
        const progressXEndPosition = size * 0.7 - progressXStartPosition

        pointer.x = progressXStartPosition;
        pointer.y = progressYPosition;
        pointer.rotation = 0;
        pointer.zIndex = 2;
        container.addChild(pointer)


        const progressLine = new PIXI.Graphics();
        progressLine.lineStyle(2, 0xffffff)
        progressLine.moveTo(progressXStartPosition, progressYPosition);
        progressLine.lineTo(progressXEndPosition, progressYPosition);
        container.addChild(progressLine)

        const progressTextXStartPosition = progressXStartPosition + size * 0.02
        const progressTextYPosition = progressYPosition + size * 0.05
        const progressTextXEndPosition = progressXEndPosition - size * 0.02
        const progressTextYEndPosition = progressXStartPosition + size * 0.05
        const sizeprogressTextLabelSize = size * 0.03
        const progressTextContentSize = size * 0.04
        const progressTextColor = 0xffffff
        const progressTextTitleSize = size * 0.06

        const title = new PIXI.Text(options.title, {
            fill: progressTextColor,
            fontSize: progressTextTitleSize,
        })
        title.x = (progressXEndPosition + progressXStartPosition - title.width) / 2;
        title.y = 0;
        container.addChild(title)

        const elapsed = new PIXI.Text('ELAPSED', {
            fill: progressTextColor,
            fontSize: sizeprogressTextLabelSize
        })
        elapsed.x = progressTextXStartPosition;
        elapsed.y = progressTextYPosition;
        container.addChild(elapsed)

        const elapsedTime = new PIXI.Text('00: 00', {
            fill: progressTextColor,
            fontSize: progressTextContentSize
        })
        elapsedTime.x = progressTextXStartPosition + elapsed.width + size * 0.02;
        elapsedTime.y = progressTextYPosition - (elapsedTime.style.fontSize - elapsed.style.fontSize) / 2;
        container.addChild(elapsedTime)

        const remained = new PIXI.Text('REMAINED', {
            fill: progressTextColor,
            fontSize: sizeprogressTextLabelSize
        })
        remained.x = progressTextXEndPosition - remained.width;
        remained.y = progressTextYPosition;
        container.addChild(remained)

        const remainedTime = new PIXI.Text('00: 00', {
            fill: progressTextColor,
            fontSize: progressTextContentSize
        })
        remainedTime.x = progressTextXEndPosition - remained.width - remainedTime.width - size * 0.01;
        remainedTime.y = progressTextYPosition - (remainedTime.style.fontSize - remained.style.fontSize) / 2;
        remainedTime.zOrder = 3;
        container.addChild(remainedTime)


        return {pointer, container, remainedTime, elapsedTime}
    }

    convertTime(seconds) {
        return `${String(seconds / 60 | 0).padStart(2, '0')}:${String(seconds % 60 | 0).padStart(2, '0')}`
    }

    tickerStop() {
        const app = this.app
        app.ticker.stop()
    }

    mainRender() {
        const app = this.app
        while(app.stage.children[0]) {
            app.stage.removeChild(app.stage.children[0]);
        }
        const {height: rootHeight, width: rootWidth} = this.options.render
        const size = Math.min(rootHeight, rootWidth)
        const {container: ringContanier, roundBoxes, blurredCircles} = this.ringRender(size)
        ringContanier.x = rootWidth / 2 - ringContanier.width / 2
        ringContanier.y = rootHeight / 2 - ringContanier.height / 2

        const {container: controllPanelContanier, pointer: playerPointer, remainedTime, elapsedTime} = this.controllPanelRender(size, {...this.options, title: this.options.title})
        controllPanelContanier.x = rootWidth / 2 - controllPanelContanier.width / 2
        controllPanelContanier.y = rootHeight / 2 - controllPanelContanier.height / 2

        app.stage.addChild(ringContanier)
        app.stage.addChild(controllPanelContanier)

        const roundBoxWidth = size * 0.125;
        const halfSize = size / 2;
        const radius = halfSize - roundBoxWidth;
        app.ticker.add(() => {
            const FPS = Math.round(app.ticker.FPS)
            let FPS_now = Date.now();
            if (typeof this.options.watchFPS === "function") this.options.watchFPS(FPS, FPS_now);

            const { frequencyLeft, frequencyRight } = this.getByteFrequency()
            const meterNum = roundBoxes.length
            let step = frequencyLeft.length / meterNum; //sample limited data from the total array
            for(let i =0; i < meterNum; i++) {
                let roundBoxesFrequency
                if(i < (meterNum / 2)) {
                    roundBoxesFrequency = frequencyLeft[i * step | 0]
                } else {
                    roundBoxesFrequency = frequencyRight[(meterNum - i) * step | 0]
                }
                roundBoxes[i].width = roundBoxesFrequency / 2.55

                let blurredCirclesFrequency
                if(i < (meterNum / 2)) {
                    blurredCirclesFrequency = frequencyLeft[(frequencyLeft.length / 2 + i * step) | 0]
                } else {
                    blurredCirclesFrequency = frequencyRight[(frequencyLeft.length / 2 + (meterNum - i) * step) | 0]
                }
                blurredCircles[i].x = halfSize + ((radius) * 0.95 - blurredCirclesFrequency) * Math.cos(blurredCircles[i].rotation)
                blurredCircles[i].y = halfSize + ((radius) * 0.95 - blurredCirclesFrequency) * Math.sin(blurredCircles[i].rotation) - blurredCircles[i].height / 2


            }
            playerPointer.x = this.audio.currentTime / this.audio.duration * (size * 0.7 - playerPointer.width / 4)
            playerPointer.rotation += 0.05
            remainedTime.text = this.convertTime(this.audio.duration - this.audio.currentTime)
            elapsedTime.text = this.convertTime(this.audio.currentTime)
        })
        app.ticker.start()
    }

    redoMainRender() {
        const analyser = this.analyser || super.getAnalyser();
        this.mainRender(analyser)
    }
}

export default Drawer;


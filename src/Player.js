import Drawer from "./Drawer"


class Player extends Drawer{
    constructor(node, file, options) {
        super();

        this.node = null;
        this.dragging = false;

        this.listenMousePosition();

        if(node && file) {
            this.init(node, file, options);
        }
    }

    init(node, file, options){
        this.node = node;

        this.options.DynamicResolution = true;

        if(typeof options === "object") this.options = {...this.options, ...options};

        super.setAudio(file);
        this.drawerInit(node, file, options);

        return this;
    }

    changeAudio(file){
        super.setAudio(file);
        return this;
    }

    play(){
        if(this.audio) {
            this.audio.play();
        }else{
            throw new Error("no audio");
        }
        return this;
    }

    pause(){
        if(this.audio) {
            this.audio.pause();
        }else{
            throw new Error("no audio");
        }
        return this;
    }

    listenMousePosition(){
        const canvas = this.canvas,
            body = document.body;

        canvas.addEventListener("mousedown", e => {
            if(this.audio && this.audio.ended) return;
            const vertical = e.pageY > (this.progressBar.top - this.progressBar.pionterRadius) && e.pageY < (this.progressBar.top + this.progressBar.pionterRadius),
                horizontal = e.pageX > this.progressBar.start && e.pageX < this.progressBar.end;
            if(vertical && horizontal){
                this.dragging = true;
                const skipPoint = (e.pageX - this.progressBar.start) / this.progressBar.width * this.audio.duration;
                this.audio.currentTime = skipPoint;
            }
        });

        body.addEventListener('mousemove', e => {
            if(!this.dragging) return;
            const skipPoint = (e.pageX - this.progressBar.start) / this.progressBar.width * this.audio.duration;
            this.audio.currentTime = skipPoint;
        });

        body.addEventListener('mouseup', e => {
            if(!this.dragging) return;
            this.dragging = false;
            if(this.audio && this.audio.ended) return;
            const skipPoint = (e.pageX - this.progressBar.start) / this.progressBar.width * this.audio.duration;
            this.audio.currentTime = skipPoint;
        });

        body.addEventListener('mouseleave', e => {
            if(!this.dragging) return;
            this.dragging = false;
            if(this.audio && this.audio.ended) return;
            const skipPoint = (e.pageX - this.progressBar.start) / this.progressBar.width * this.audio.duration;
            this.audio.currentTime = skipPoint;
        });
    }
}

export default Player;

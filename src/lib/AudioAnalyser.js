const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext,
    AudioNode = window.AudioNode || window.webkitAudioNode || window.mozAudioNode || window.msAudioNode;


class AudioAnalyser {
    constructor(file, options) {
        this.audioContext = (AudioContext)? new AudioContext() : null;
        this.audioNode = null;
        this.analyser = null;
        this.audio = null;
        this.options = {};
        if(file) {
            this.setAudio(file, options);
        }
    }

    setAudio(file, options = this.options) {
        const supported = this.isSupport();
        if(!supported.state) {
            const warning = `Sorry,you browser seems not to support ${ supported.list.join(", ") }. Please try to use other browsers.`;
            throw new Error(warning);
            return warning;
        }

        if(typeof options === "object") this.options = {...this.options, ...options};

        this.checkType(file);

        return this;
    }

    isSupport() {
        let supported = {
                list:[]
            };

        if(!AudioContext) supported.list.push("AudioContext");

        if(supported.list.length > 0){
            supported.state = false;
            return supported;
        }

        return { state: true };
    }

    checkType(file){
        console.log(file);

        const checkTypeErr = new Error("Input is a illegal param which only is [URL] or [audio Element] or [AudioNode].");
        if(typeof file === "string"){
            if(/(blob\:)?(http|https|ftp):\/\/[^\s]*/.test(file)){
                this.loadMusic(file);
            }else{
                throw new Error("This URL is illegal");
            }
        }else if(typeof file === "object"){
            if(file.nodeType === 1){
                if(file.tagName === "AUDIO"){
                    file.crossOrigin = "anonymous";
                    this.audio = file;
                    this.getAnalyser();
                }else{
                    throw checkTypeErr;
                }
            }else{
                if(file instanceof AudioNode){
                    this.audioBufferSouceNode = file;
                    this.audioContext = file.context;
                    this.getAnalyser();
                }else {
                    throw checkTypeErr;
                }
            }
        }else{
            throw checkTypeErr;
        }

        return this;
    }

    loadMusic(file){
        if(!this.audio){
            this.audio = new Audio();
            this.audio.crossOrigin = "anonymous";
            this.audio.style.display = "none";
            this.audio.onerror = e => {
                throw  new Error(e);
            }
            if(this.options.onended) this.audio.onended = this.options.onended;
        }
        this.audio.src = file;

        return this;
    }

    getAudio(){
        return this.audio;
    }

    getAudioContext(){
        return this.audioContext;
    }

    getAnalyser(){
        if(!this.audioContext) this.audioContext = new AudioContext();
        if(!this.audioNode) this.audioNode = this.audioContext.createMediaElementSource(this.audio);// audioBufferSouceNode

        const audioContext = this.audioContext,
            audioNode = this.audioNode,
            analyserL = audioContext.createAnalyser(),
            analyserR = audioContext.createAnalyser();
        console.log(audioNode.channelCount);
        audioContext.createGain = audioContext.createGain || audioContext.createGainNode;
        const splitter = audioContext.createChannelSplitter(2),  // The number of splitted channels
            merger = audioContext.createChannelMerger(2),  // The number of merged channels
            gainL = audioContext.createGain(),  // for Left  Channel
            gainR = audioContext.createGain();  // for Right Channel

        audioNode.connect(splitter);         // OscillatorNode (Monaural input) -> Stereo
        splitter.connect(analyserL, 0, 0);        // ChannelSplitterNode -> GainNode (Left  Channel)
        splitter.connect(analyserR, 1, 0);        // ChannelSplitterNode -> GainNode (Right Channel)
        audioNode.connect(audioContext.destination);  // ChannelMergerNode -> AudioDestinationNode (Output)



        this.analyser = {
            left: analyserL,
            right: analyserR
        };

        return this;
    }

    getByteFrequency(){
        const analyser = this.analyser;

        let frequencyLeft = new Uint8Array(analyser.left.frequencyBinCount);
        analyser.left.getByteFrequencyData(frequencyLeft);

        let frequencyRight = new Uint8Array(analyser.right.frequencyBinCount);
        analyser.right.getByteFrequencyData(frequencyRight);

        return {
            frequencyLeft,
            frequencyRight
        };
    }
}

export default AudioAnalyser;

const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext,
    AudioNode = window.AudioNode || window.webkitAudioNode || window.mozAudioNode || window.msAudioNode;


class AudioAnalyser {
    constructor() {
        this.audioContext = (AudioContext)? new AudioContext() : null;
        this.audioNode = null;
        this.analyser = null;
    }

    initAudio(audio) {
        this.audio = audio
        this.getAnalyser()
    }

    getAnalyser() {
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

        return this.analyser;
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

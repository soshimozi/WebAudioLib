import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';

export default class IIRFilterNode extends AudioGraphNode {
    constructor(audiolib, cutoff, resonance, type) {
        super(audiolib, 1, 1);

        this.cutoff = new AudioParameter(this, 1, isNaN(cutoff) ? 221000 : cutoff);

        this.freq = 0;
        this.damp = 0;
        this.prevCut = 0;
        this.prevReso = 0;

        this.sin	= Math.sin,
        this.min	= Math.min,
        this.pow	= Math.pow;

        this.f	= [0.0, 0.0, 0.0, 0.0];

        this.resonance = !resonance ? 0.1 : resonance; // 0.0 - 1.0
        this.samplerate = audiolib.device.sampleRate;
        this.type = type || 0;        

        // Same number of output channels as input channels
        this.linkNumberOfOutputChannels(0, 0);
    }

    calcCoeff () {
        this.freq = 2 * this.sin(Math.PI * this.min(0.25, this.cutoff.getValue() / (this.samplerate * 2)));
        this.damp = this.min(2 * (1 - this.pow(this.resonance, 0.25)), this.min(2, 2 / this.freq - this.freq * 0.5));
    }       
    
    generate() {
        let output = this.outputs[0];    
        let sample = this.inputs[0];
        
        var f = this.f;

        if (this.prevCut !== this.cutoff.getValue() || this.prevReso !== this.resonance){
            this.calcCoeff();
            this.prevCut = this.cutoff.getValue();
            this.prevReso = this.resonance;
        }

        f[3] = sample - this.damp * f[2];
        f[0] = f[0] + this.freq * f[2];
        f[1] = f[3] - f[0];
        f[2] = this.freq * f[1] + f[2];

        f[3] = sample - this.damp * f[2];
        f[0] = f[0] + this.freq * f[2];
        f[1] = f[3] - f[0];
        f[2] = this.freq * f[1] + f[2];

        output.samples[0] = f[this.type];
    }
}
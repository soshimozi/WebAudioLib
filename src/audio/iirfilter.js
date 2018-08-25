import Effect from './effect';

/**
 * Creates a IIRFilter effect.
 * Adapted from Corban Brook's dsp.js
 * 
 * @effect
 *
 * @arg =!sampleRate
 * @arg =!cutoff
 * @arg =!resonance
 * @arg =!type
 *
 * @param type:UInt units:Hz default:44100 sampleRate Sample Rate the apparatus operates on.
 * @param type:Float units:Hz min:40.0 default:20000 cutoff The cutoff frequency of the IIRFilter.
 * @param type:Float min:0.0 max:1.0 default:0.1 resonance The resonance of the IIRFilter.
 * @param type:UInt default:0 type The type of the filter (LowPass, HighPass, BandPass, Notch).
*/
export default class extends Effect {
    constructor (sampleRate, cutoff, resonance, type) {
        super();

        this.freq = 0;
        this.damp = 0;
        this.prevCut = 0;
        this.prevReso = 0;

        this.sin	= Math.sin,
        this.min	= Math.min,
        this.pow	= Math.pow;

        this.f	= [0.0, 0.0, 0.0, 0.0];

        this.cutoff = isNaN(cutoff) ? 20000 : cutoff; // > 40
        this.resonance = !resonance ? 0.1 : resonance; // 0.0 - 1.0
        this.samplerate = isNaN(sampleRate) ? 44100 : sampleRate;
        this.type = type || 0;

        
    }

    calcCoeff () {
        this.freq = 2 * this.sin(Math.PI * this.min(0.25, this.cutoff / (this.samplerate * 2)));
        this.damp = this.min(2 * (1 - this.pow(this.resonance, 0.25)), this.min(2, 2 / this.freq - this.freq * 0.5));
    }    
    
    pushSample (sample) {
        var f = this.f;

        if (this.prevCut !== this.cutoff || this.prevReso !== this.resonance){
            this.calcCoeff();
            this.prevCut = this.cutoff;
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

        return f[this.type];
    }

    getMix (type) {
        return this.f[type || this.type];
    }
}
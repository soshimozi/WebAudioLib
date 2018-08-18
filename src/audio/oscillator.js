import Sink from './core/sink';
import Generator from './generator';

const FullPI = Math.PI * 2;

class Oscillator extends Generator {

    constructor(sampleRate, freq, ws) {
        super();

        this.phaseOffset    = 0;
        this.pulseWidth     = 0.5;
        this.fm             = 0;
        this.waveShape      = ws || 'sine';
        this.mix            = 1;

        /* Phase of the Oscillator */
        this.phase          = 0;

        /* The relative of phase of the Oscillator (pulsewidth, phase offset, etc applied). */
        this._p             = 0;

        this.frequency	= isNaN(freq) ? 440 : freq;
        this.waveTable	= new Float32Array(1);
        this.sampleRate = sampleRate;

        this.shapeFunctions = {
            sine: this.sine,
            triangle: this.triangle,
            sawtooth: this.sawtooth,
            square: this.square,
            invSawtooth: this.invSawtooth,
            pulse: this.pulse,
            wavetable: this.wavetable
        };
    } 

    generate() {
        /**
         * Moves the Oscillator's phase forward by one sample.
        */
        var	f	= +this.frequency,
            pw	= this.pulseWidth,
            p	= this.phase;
        f += f * this.fm;
        this.phase	= (p + f / this.sampleRate / 2) % 1;
        p		= (this.phase + this.phaseOffset) % 1;
        this._p		= p < pw ? p / pw : (p-pw) / (1-pw);
    }

    /**
     * Returns the output signal sample of the Oscillator.
     *
     * @return {Float} The output signal sample.
    */
	getMix () {
		return this.shapeFunctions[this.waveShape].apply(this);
	}
    
    /**
     * Returns the relative phase of the Oscillator (pulsewidth, phaseoffset, etc applied).
     *
     * @return {Float} The relative phase.
    */
	get getPhase  () {
		return this._p;
    }
    
    /**
     * Resets the Oscillator phase (AND RELATIVE PHASE) to a specified value.
     *
     * @arg {Float} phase The phase to reset the values to. (Optional, defaults to 0).
    */
	reset (p) {
		this.phase = this._p = isNaN(p) ? 0 : p;
    }
    
    /**
     * Specifies a wavetable for the Oscillator.
     *
     * @method Oscillator
     *
     * @arg {Array<Float>} wavetable The wavetable to be assigned to the Oscillator.
     * @return {Boolean} Succesfulness of the operation.
    */
	setWavetable (wt) {
		this.waveTable = wt;
		return true;
    }
    
    /**
     * Returns sine wave output of the Oscillator.
     *
     * Phase for the zero crossings of the function: 0.0, 0.5
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	sine () {
		return Math.sin(this._p * FullPI);
    }
    
    /**
     * Returns triangle wave output of the Oscillator, phase zero representing the top of the triangle.
     *
     * Phase for the zero crossings of the function: 0.25, 0.75
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	triangle () {
		return this._p < 0.5 ? 4 * this._p - 1 : 3 - 4 * this._p;
    }
    
    /**
     * Returns square wave output of the Oscillator, phase zero being the first position of the positive side.
     *
     * Phase for the zero crossings of the function: 0.0, 0.5
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	square () {
		return this._p < 0.5 ? -1 : 1;
    }
    
    /**
     * Returns sawtooth wave output of the Oscillator, phase zero representing the negative peak.
     *
     * Phase for the zero crossings of the function: 0.5
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	sawtooth () {
		return 1 - this._p * 2;
    }
    
    /**
     * Returns invert sawtooth wave output of the Oscillator, phase zero representing the positive peak.
     *
     * Phase for the zero crossings of the function: 0.5
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	invSawtooth () {
		return this._p * 2 - 1;
    }
    
    /**
     * Returns pulse wave output of the Oscillator, phase zero representing slope starting point.
     *
     * Phase for the zero crossings of the function: 0.125, 0.325
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	pulse () {
		return this._p < 0.5 ?
			this._p < 0.25 ?
				this._p * 8 - 1 :
				1 - (this._p - 0.25) * 8 :
			-1;
    }
    
    /**
     * Returns wavetable output of the Oscillator.
     *
     * Requires sink.js
     *
     * @method Oscillator
     *
     * @return {Float} Sample.
    */
	wavetable () {
		return Sink.interpolate(this.waveTable, this._p * this.waveTable.length);
	}


    /**
     * Creates a new wave shape and attaches it to Oscillator.prototype by a specified name.
     *
     * @arg {String} name The name of the wave shape.
     * @arg {Function} algorithm The algorithm for the wave shape. If omitted, no changes are made.
     * @return {Function} The algorithm assigned to Oscillator.prototype by the specified name.
    */

    WaveShape (name, algorithm) {
        if (algorithm) {
            this.shapeFunctions[name] = algorithm;
        }
        return this.shapeFunctions[name];
    }


    /**
     * Creates a new wave shape that mixes existing wave shapes into a new waveshape and attaches it to Oscillator.prototype by a specified name.
     *
     * @arg {String} name The name of the wave shape.
     * @arg {Array} waveshapes Array of the wave shapes to mix, wave shapes represented as objects where .shape is the name of the wave shape and .mix is the volume of the wave shape.
     * @return {Function} The algorithm created.
    */

    createMixWave (name, waveshapes) {
        var	l = waveshapes.length,
            smpl, i;
        return this.WaveShape(name, function () {
            smpl = 0;
            for (i=0; i<l; i++) {
                smpl += this.shapeFunctions[waveshapes[i].shape]() * waveshapes[i].mix;
            }
            return smpl;
        });
    }
}

module.exports = Oscillator;
import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';
import Sink from '../core/sink';


const FullPI = Math.PI * 2;
export default class OscillatorNode extends AudioGraphNode {

    constructor(audiolib, frequency, ws) {
        super(audiolib, 1, 1);

        this.fm = new AudioParameter(this, 0, 0);
        this.phase = 0;      
        
        this.phaseOffset    = 0;
        this.pulseWidth     = 0.5;
        this.waveShape      = ws || 'sine';
        this.mix            = 1;

        /* Phase of the Oscillator */
        this.phase          = 0;

        /* The relative of phase of the Oscillator (pulsewidth, phase offset, etc applied). */
        this._p             = 0;

        this.frequency	= isNaN(frequency) ? 440 : frequency;
        this.waveTable	= new Float32Array(1);
        this.sampleRate = audiolib.device.sampleRate;    
        
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

    generate() {
        this.movePhaseForward();

        let output = this.outputs[0];
        output.samples[0] = this.shapeFunctions[this.waveShape].apply(this);
    }

    movePhaseForward() {
        /**
         * Moves the Oscillator's phase forward by one sample.
        */
       var	f	= +this.frequency,
       pw	= this.pulseWidth,
       p	= this.phase;
       f += f * this.fm.getValue();
       this.phase	= (p + f / this.sampleRate / 2) % 1;
       p		= (this.phase + this.phaseOffset) % 1;
       this._p		= p < pw ? p / pw : (p-pw) / (1-pw);        

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
    
}
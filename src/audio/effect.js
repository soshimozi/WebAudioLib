export default class {
    constructor() {
        this.type           = 'effect';
        this.sink           = true;
        this.source         = true;
        this.mix            = 0.5;
        this.channelCount   = 1;
        this.params         = {};
    }


    /**
     * Applies the effect to a buffer of audio data and optionally puts the result on a separate output channel.
     *
     * @method Effect
     *
     * @arg {Array<Float>} buffer The buffer to apply the effect to.
     * @arg {UInt} min:1 !channelCount The amount of channels the buffer has.
     * @arg {Array<Float>} default:buffer out The optional output buffer.
     * @return {Array<Float>} The output buffer.
    */
    append (buffer, channelCount, out) {
        var	l	= buffer.length,
            i, n;
        out		= out || buffer;
        channelCount	= channelCount || this.channelCount;
        for (i=0; i<l; i+=channelCount) {
            for (n=0; n<channelCount; n++) {
                this.pushSample(buffer[i + n], n);
                out[i + n] = this.getMix(n) * this.mix + buffer[i + n] * (1 - this.mix);
            }
        }
        return out;
    }

    /**
     * Sets a parameter of the effect to a certain value, taking into account all the other changes necessary to keep the effect sane.
     *
     * @method Effect
     *
     * @arg {String} param The parameter to change.
     * @arg value The value to set the parameter to.
    */
    setParam (param, value) {
        this.params[param] = value;
    }
    /**
    * Pushes a sample to the effect, moving it one sample forward in sample time.
    *
    * @method Effect
    *
    * @arg {Float} The sample to push to the effect.
    * @arg {UInt} min:1 !channel The channel to push to. This is only applicable to multi-channel effects.
    */
    pushSample () {
        throw new Error("Error Not Implemented")
    }
    /**
    * Retrieves the current output of the effect.
    *
    * @method Effect
    *
    * @arg {UInt} default:0 !channel The channel to retrieve the output of. This is only applicable to multi-channel effects.
    * @return {Float} The current output of the effect.
    */
    getMix() {
        throw new Error("Error Not Implemented")
    }
    /**
    * Resets the component to it's initial state, if possible.
    *
    * @method Effect
    */
    reset() {
        throw new Error("Error Not Implemented")
    }    
}
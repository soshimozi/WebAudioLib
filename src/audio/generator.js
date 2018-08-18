export default class {

    constructor() {
        this.type               = 'generator';
        this.source             = true;
        this.mix                = 1;
        this.generatedBuffer    = null;
        this.channelCount       = 1;
    }

    /**
     * Generates the buffer full of audio data and optionally puts the result on a separate output channel.
     *
     * @method Generator
     *
     * @arg {Array<Float>} buffer The buffer to apply the effect to.
     * @arg {UInt} min:1 !channelCount The amount of channels the buffer has.
     * @arg {Array<Float>} default:buffer !out The optional output buffer.
     * @return {Array<Float>} The output buffer.
    */
   append (buffer, channelCount, out) {
        var	l	= buffer.length,
            i, n;
        out		= out || buffer;
        channelCount	= channelCount || this.channelCount;
        for (i=0; i<l; i+=channelCount) {
            this.generate();
            for (n=0; n<channelCount; n++) {
                out[i + n] = this.getMix(n) * this.mix + buffer[i + n];
            }
        }
        return out;
    }

    generate() {
        throw new Error("Error Not Implemented");
    }

    getMix() {
        throw new Error("Error Not Implemented");
    }

    reset () {
        throw new Error("Error Not Implemented");
    }

}
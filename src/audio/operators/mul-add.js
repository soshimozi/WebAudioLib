import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';

/*
 * Multiply and add values
 *
 * **Inputs**
 *
 * - Audio
 * - Multiply audio
 * - Add audio
 *
 * **Outputs**
 *
 * - MulAdded audio
 *
 * **Parameters**
 *
 * - mul The value to multiply by.  Linked to input 1.
 * - add The value to add.  Linked to input 2.
 *
 */
export default class MulAdd extends AudioGraphNode {
    /*
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audiolib object.
    * @param {Number} [mul=1] The initial value to multiply by.
    * @param {Number} [add=0] The initial value to add.
    */    
    constructor(audiolib, mul, add) {
        super(audiolib, 3, 1);
        this.linkNumberOfOutputChannels(0, 0);
        this.mul = new AudioParameter(this, 1, mul || 1);
        this.add = new AudioParameter(this, 2, add || 0);
    }

    /**
     * Process samples
     */
    generate() {
        var input = this.inputs[0];
        var output = this.outputs[0];

        var mul = this.mul.getValue();
        var add = this.add.getValue();

        var numberOfChannels = input.samples.length;
        for (var i = 0; i < numberOfChannels; i++) {
            output.samples[i] = input.samples[i] * mul + add;
        }
    }
}
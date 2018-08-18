import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';

/*
 * Multiply values
 *
 * **Inputs**
 *
 * - Audio 1
 * - Audio 2
 *
 * **Outputs**
 *
 * - Multiplied audio
 *
 * **Parameters**
 *
 * - value The value to multiply by.  Linked to input 1.
 *
 */
export default class Multiply extends AudioGraphNode {

    /*
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audioli object.
    * @param {Number} [value=1] The initial value to multiply by.
    */    
    constructor(audiolib, value) {
        super(audiolib, 2, 1);
        this.linkNumberOfOutputChannels(0, 0);
        this.value = new AudioParameter(this, 1, value || 1);    
    }

    /**
     * Process samples
     */
    generate() {
        var value = this.value.getValue();
        var input = this.inputs[0];
        var numberOfChannels = input.samples.length;
        for (var i = 0; i < numberOfChannels; i++) {
            this.outputs[0].samples[i] = input.samples[i] * value;
        }
    }
}

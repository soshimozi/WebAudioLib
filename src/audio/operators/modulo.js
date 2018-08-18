import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';

/**
 * Modulo values
 *
 * **Inputs**
 *
 * - Audio 1
 * - Audio 2
 *
 * **Outputs**
 *
 * - Moduloed audio
 *
 * **Parameters**
 *
 * - value The value to modulo by.  Linked to input 1.
 *
 */
export default class Modulo extends AudioGraphNode {
    /*
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audiolib object.
    * @param {Number} [value=1] The initial value to modulo by.
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
        var input = this.inputs[0];
        var output = this.outputs[0];

        var value = this.value.getValue();

        var numberOfChannels = input.samples.length;
        for (var i = 0; i < numberOfChannels; i++) {
            output.samples[i] = input.samples[i] % value;
        }
    }
}

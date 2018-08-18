import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';

/**
 * Subtract values
 *
 * **Inputs**
 *
 * - Audio 1
 * - Audio 2
 *
 * **Outputs**
 *
 * - Subtracted audio
 *
 * **Parameters**
 *
 * - value The value to subtract.  Linked to input 1.
 *
 */
export default class Subtract extends AudioGraphNode {
    /*
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audiolib object.
    * @param {Number} [value=0] The initial value to subtract.
    */
    constructor(audiolib, value) {
        super(audiolib, 2, 1);
        this.linkNumberOfOutputChannels(0, 0);
        this.value = new AudioParameter(this, 1, value || 0);
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
            output.samples[i] = input.samples[i] - value;
        }
    }
}

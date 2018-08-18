import {AudioGraphNode} from '../core/audio-node';

/**
 * Reciprocal (1/x) of values
 *
 * **Inputs**
 *
 * - Audio
 *
 * **Outputs**
 *
 * - Reciprocal audio
 */
export default class Reciprocal extends AudioGraphNode {
    /*
    *
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audiolet object.
    */
    constructor(audiolib) {
        super(audiolib, 1, 1);
        this.linkNumberOfOutputChannels(0, 0);
    }

    /**
     * Process samples
     */
    generate() {
        var input = this.inputs[0];
        var output = this.outputs[0];

        var numberOfChannels = input.samples.length;
        for (var i = 0; i < numberOfChannels; i++) {
            output.samples[i] = 1 / input.samples[i];
        }
    }
}
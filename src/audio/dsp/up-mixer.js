import {AudioGraphNode} from '../core/audio-node';

/**
 * Upmix an input to a constant number of output channels
 *
 * **Inputs**
 *
 * - Audio
 *
 * **Outputs**
 *
 * - Upmixed audio
 *
 */
export default class UpMixer extends AudioGraphNode {
    /*
    * @constructor
    * @extends AudioletNode
    * @param {Audiolet} audiolet The audiolet object.
    * @param {Number} outputChannels The number of output channels.
    */
    constructor (audioLib, outputChannels) {
        super(audioLib, 1, 1);
        this.outputs[0].numberOfChannels = outputChannels;
    }

    generate() {
        var input = this.inputs[0];
        var output = this.outputs[0];
    
        var numberOfInputChannels = input.samples.length;
        var numberOfOutputChannels = output.samples.length;
    
        if (numberOfInputChannels == numberOfOutputChannels) {
            output.samples = input.samples;
        }
        else {
            for (var i = 0; i < numberOfOutputChannels; i++) {
                output.samples[i] = input.samples[i % numberOfInputChannels];
            }
        }
    }    
}

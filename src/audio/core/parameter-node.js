import {AudioGraphNode} from '../core/audio-node';
import AudioParameter from '../core/audio-parameter';
/**
 * A type of AudioletNode designed to allow AudioletGroups to exactly replicate
 * the behaviour of AudioletParameters.  By linking one of the group's inputs
 * to the ParameterNode's input, and calling `this.parameterName =
 * parameterNode` in the group's constructor, `this.parameterName` will behave
 * as if it were an AudioletParameter contained within an AudioletNode.
 *
 * **Inputs**
 *
 * - Parameter input
 *
 * **Outputs**
 *
 * - Parameter value
 *
 * **Parameters**
 *
 * - parameter The contained parameter.  Linked to input 0.
 *
 */
export default class ParameterNode extends AudioGraphNode {
    /*
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audiolib object.
    * @param {Number} value The initial static value of the parameter.
    */
    constructor(audiolib, value) {
        super(audiolib, 1, 1);
        this.parameter = new AudioParameter(this, 0, value);
    }

    /**
     * Process samples
     */
    generate() {
        this.outputs[0].samples[0] = this.parameter.getValue();
    }
}
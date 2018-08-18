export default class {
    /*
    * @constructor
    * @param {AudioGraphNode} node The node which the parameter is associated with.
    * @param {Number} [inputIndex] The index of the AudioInput to link to.
    * @param {Number} [value=0] The initial static value to store.
    */
    constructor(node, inputIndex, value) {
        this.node = node;
        if (typeof inputIndex != 'undefined' && inputIndex != null) {
            this.input = node.inputs[inputIndex];
        }
        else {
            this.input = null;
        }
        this.value = value || 0;
    }

    /**
     * Check whether the static value should be used.
     *
     * @return {Boolean} True if the static value should be used.
     */
    isStatic() {
        return (this.input.samples.length == 0);
    }

    /**
     * Check whether the dynamic values should be used.
     *
     * @return {Boolean} True if the dynamic values should be used.
     */
    isDynamic() {
        return (this.input.samples.length > 0);
    }

    /**
     * Set the stored static value
     *
     * @param {Number} value The value to store.
     */
    setValue(value) {
        this.value = value;
    }

    /**
     * Get the stored static value
     *
     * @return {Number} The stored static value.
     */
    getValue() {
        if (this.input != null && this.input.samples.length > 0) {
            return this.input.samples[0];
        }
        else {
            return this.value;
        }
    }

}
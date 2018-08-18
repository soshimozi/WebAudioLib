/**
 * Class representing a single input of an AudioGraphNode
 *
 */
export default class {
    /*
    * @constructor
    * @param {AudioGraphNode} node The node which the input belongs to.
    * @param {Number} index The index of the input.
    */
    constructor(node, idx) {
        this.node = node;
        this.idx = idx;
        this.connectedFrom = [];
        this.samples = [];
    }

    /**
     * Connect the input to an output
     *
     * @param {AudioOutput} output The output to connect to.
     */    
    connect(output) {
        this.connectedFrom.push(output);
    }

    /**
     * Disconnect the input from an output
     *
     * @param {AudioOutput} output The output to disconnect from.
     */    
    disconnect(output) {
        var numberOfStreams = this.connectedFrom.length;

        for (var i = 0; i < numberOfStreams; i++) {
            if (output == this.connectedFrom[i]) {
                this.connectedFrom.splice(i, 1);
                break;
            }
        }

        if (this.connectedFrom.length == 0) {
            this.samples = [];
        }
    }    
}
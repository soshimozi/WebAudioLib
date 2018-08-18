import AudioInput from './audio-input';
import AudioOutput from './audio-output';

/**
 * The basic building block of Audio applications.  Nodes are connected
 * together to create a processing graph which governs the flow of audio data.
 * AudioGraphNodes can contain any number of inputs and outputs which send and
 * receive one or more channels of audio data.  Audio data is created and
 * processed using the generate function, which is called whenever new data is
 * needed.
 *
 */
class AudioGraphNodeClass {
    /*
    * @constructor
    * @param {audiolib} audiolib The audiolib object.
    * @param {Number} numberOfInputs The number of inputs.
    * @param {Number} numberOfOutputs The number of outputs.
    */
    constructor(audiolib, numInputs, numOutputs) {

        this.audiolib = audiolib;

        this.inputs = [];
        for(let i=0; i< numInputs; i++) {
            this.inputs.push(new AudioInput(this, i))
        }

        this.outputs = [];
        for(let i=0; i< numOutputs; i++) {
            this.outputs.push(new AudioOutput(this, i))
        }        
    }

    connect (node, output, input) {
        console.log('node', node);
        console.log('type', typeof node);

        if (node instanceof AudioGroup) {
            // Connect to the pass-through node rather than the group
            node = node.inputs[input || 0];
            input = 0;
        }

        var outputPin = this.outputs[output || 0];
        var inputPin = node.inputs[input || 0];

        console.log('about to connect pins');
        outputPin.connect(inputPin);
        inputPin.connect(outputPin);
    
        this.audiolib.device.dirty = true;
    }    

    disconnect(node, output, input) {
        if (node instanceof AudioGroup) {
            node = node.inputs[input || 0];
            input = 0;
        }
    
        var outputPin = this.outputs[output || 0];
        var inputPin = node.inputs[input || 0];
        inputPin.disconnect(outputPin);
        outputPin.disconnect(inputPin);
    
        this.audiolib.device.dirty = true;
    }

    setNumberOfOutputChannels (output, numberOfChannels) {
        this.outputs[output].numberOfChannels = numberOfChannels;
    }    

    linkNumberOfOutputChannels (output, input) {
        this.outputs[output].linkNumberOfChannels(this.inputs[input]);
    }

    
    tick () {
        this.createInputSamples();
        this.createOutputSamples();
    
        this.generate();
    }    

    visit(nodes) {
        if (nodes.indexOf(this) == -1) {
            nodes.push(this);
            nodes = this.visitParents(nodes);
        }
        return nodes;
    }    

    visitParents(nodes) {
        var numberOfInputs = this.inputs.length;
        for (var i = 0; i < numberOfInputs; i++) {
            var input = this.inputs[i];
            var numberOfStreams = input.connectedFrom.length;
            for (var j = 0; j < numberOfStreams; j++) {
                nodes = input.connectedFrom[j].node.visit(nodes);
            }
        }
        return nodes;
    }  
    
    generate () {
    }    

    createInputSamples() {
        var numberOfInputs = this.inputs.length;
        for (var i = 0; i < numberOfInputs; i++) {
            var input = this.inputs[i];
    
            var numberOfInputChannels = 0;
    
            for (var j = 0; j < input.connectedFrom.length; j++) {
                var output = input.connectedFrom[j];
                for (var k = 0; k < output.samples.length; k++) {
                    var sample = output.samples[k];
                    if (k < numberOfInputChannels) {
                        input.samples[k] += sample;
                    }
                    else {
                        input.samples[k] = sample;
                        numberOfInputChannels += 1;
                    }
                }
            }
    
            if (input.samples.length > numberOfInputChannels) {
                input.samples = input.samples.slice(0, numberOfInputChannels);
            }
        }
    }

    createOutputSamples() {
        var numberOfOutputs = this.outputs.length;
        // Copy the inputs buffers straight to the output buffers
        for (var i = 0; i < numberOfOutputs; i++) {
            var input = this.inputs[i];
            var output = this.outputs[i];
            if (input && input.samples.length != 0) {
                // Copy the input buffer straight to the output buffers
                output.samples = input.samples;
            }
            else {
                // Create the correct number of output samples
                var numberOfChannels = output.getNumberOfChannels();
                if (output.samples.length == numberOfChannels) {
                    continue;
                }
                else if (output.samples.length > numberOfChannels) {
                    output.samples = output.samples.slice(0, numberOfChannels);
                    continue;
                }
    
                for (var j = output.samples.length; j < numberOfChannels; j++) {
                    output.samples[j] = 0;
                }
            }
        }
    }

    remove() {
        // Disconnect inputs
        var numberOfInputs = this.inputs.length;
        for (var i = 0; i < numberOfInputs; i++) {
            var input = this.inputs[i];
            var numberOfStreams = input.connectedFrom.length;
            for (var j = 0; j < numberOfStreams; j++) {
                var outputPin = input.connectedFrom[j];
                var output = outputPin.node;
                output.disconnect(this, outputPin.index, i);
            }
        }
    
        // Disconnect outputs
        var numberOfOutputs = this.outputs.length;
        for (var i = 0; i < numberOfOutputs; i++) {
            var output = this.outputs[i];
            var numberOfStreams = output.connectedTo.length;
            for (var j = 0; j < numberOfStreams; j++) {
                var inputPin = output.connectedTo[j];
                var input = inputPin.node;
                this.disconnect(input, i, inputPin.index);
            }
        }
    }    
    
}

/**
 * A specialized type of AudioGraphNode where values from the inputs are passed
 * straight to the corresponding outputs in the most efficient way possible.
 * PassThroughNodes are used in AudioGroups to provide the inputs and
 * outputs, and can also be used in analysis nodes where no modifications to
 * the incoming audio are made.
 */
class PassThroughNodeClass extends AudioGraphNodeClass {
    /*
    * @constructor
    * @extends AudioGraphNode
    * @param {AudioLib} audiolib The audiolib object.
    * @param {Number} numberOfInputs The number of inputs.
    * @param {Number} numberOfOutputs The number of outputs.
    */    
    constructor(audiolib, numInputs, numOutputs) {
        super(audiolib, numInputs, numOutputs);
    }    

    /**
     * Create output samples for each channel, copying any input samples to
     * the corresponding outputs.
     */
    createOutputSamples() {
        var numberOfOutputs = this.outputs.length;
        // Copy the inputs buffers straight to the output buffers
        for (var i = 0; i < numberOfOutputs; i++) {
            var input = this.inputs[i];
            var output = this.outputs[i];
            if (input && input.samples.length != 0) {
                // Copy the input buffer straight to the output buffers
                output.samples = input.samples;
            }
            else {
                // Create the correct number of output samples
                var numberOfChannels = output.getNumberOfChannels();
                if (output.samples.length == numberOfChannels) {
                    continue;
                }
                else if (output.samples.length > numberOfChannels) {
                    output.samples = output.samples.slice(0, numberOfChannels);
                    continue;
                }

                for (var j = output.samples.length; j < numberOfChannels; j++) {
                    output.samples[j] = 0;
                }
            }
        }
    }

}

/**
 * A container for collections of connected AudioGraphNodes.  Groups make it
 * possible to create multiple copies of predefined networks of nodes,
 * without having to manually create and connect up each individual node.
 *
 * From the outside groups look and behave exactly the same as nodes.
 * Internally you can connect nodes directly to the group's inputs and
 * outputs, allowing connection to nodes outside of the group.
 *
*/
class AudioGroupClass extends AudioGraphNodeClass {

    /*
    * @constructor
    * @param {AudioGraph} audioGraph The audioGraph object.
    * @param {Number} numberOfInputs The number of inputs.
    * @param {Number} numberOfOutputs The number of outputs.
    */    
    constructor(audiolib, numInputs, numOutputs) {
        super(audiolib, numInputs, numOutputs);

        this.audiolib = audiolib;

        this.inputs = [];
        for (var i = 0; i < numInputs; i++) {
            this.inputs.push(new PassThroughNode(audiolib, 1, 1));
        }
    
        this.outputs = [];
        for (var i = 0; i < numOutputs; i++) {
            this.outputs.push(new PassThroughNode(audiolib, 1, 1));
        }        
    }

    /**
     * Connect the group to another node or group
     *
     * @param {AudioGraphNode|AudioGroup} node The node to connect to.
     * @param {Number} [output=0] The index of the output to connect from.
     * @param {Number} [input=0] The index of the input to connect to.
     */
    connect(node, output, input) {
        this.outputs[output || 0].connect(node, 0, input);
    }

    /**
     * Disconnect the group from another node or group
     *
     * @param {AudioGraphNode|AudioGroup} node The node to disconnect from.
     * @param {Number} [output=0] The index of the output to disconnect.
     * @param {Number} [input=0] The index of the input to disconnect.
     */
    disconnect (node, output, input) {
        this.outputs[output || 0].disconnect(node, 0, input);
    }

    /**
     * Remove the group completely from the processing graph, disconnecting all
     * of its inputs and outputs
     */
    remove() {
        var numberOfInputs = this.inputs.length;
        for (var i = 0; i < numberOfInputs; i++) {
            this.inputs[i].remove();
        }

        var numberOfOutputs = this.outputs.length;
        for (var i = 0; i < numberOfOutputs; i++) {
            this.outputs[i].remove();
        }
    }    

}

export const AudioGraphNode = AudioGraphNodeClass;
export const AudioGroup = AudioGroupClass;
export const PassThroughNode = PassThroughNodeClass;
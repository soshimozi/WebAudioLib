import Sink from '../audio/core/sink';

import {Note} from '../music';
import Oscillator from '../audio/oscillator';
import IIRFilter from '../audio/iirfilter';
import Distortion from '../audio/distortion';
import AudioLib from '../audio/core/audio-lib';
import OscillatorNode from '../audio/dsp/oscillator-node';
import {PassThroughNode} from '../audio/core/audio-node';
import IIRFilterNode from '../audio/dsp/iir-filter';
import ParameterNode from '../audio/core/parameter-node';

export default class {

    constructor() {
        this.message = "Hello World from controller";
        this.isReady = false;

        this.lfoWaveShape = 'sine';
        this.oscillator2WaveShape = 'sine';
        this.oscillatorWaveShape = 'sine';

        this.waveShapes = [
            {
                display: 'Sine',
                value: 'sine',
                url: require('../images/sine.png')
            },
            {
                display: 'Sawtooth',
                value: 'sawtooth',
                url: require('../images/sawtooth.png')

            },
            {
                display: 'Triangle',
                value: 'triangle',
                url: require('../images/triangle.png')

            },
            {
                display: 'Square',
                value: 'square',
                url: require('../images/square.png')

            }
        ];

        this.mod = {
            frequency: 5,
            waveShape: 'sine'
        }

        this.disabled = undefined;
        this.person = {};
        this.language_list = [{'name': 'english', 'url': 'https://raw.githubusercontent.com/stevenrskelton/flag-icon/master/png/16/country-4x3/gb.png'},{'name': 'italian', 'url': 'https://raw.githubusercontent.com/stevenrskelton/flag-icon/master/png/16/country-4x3/it.png'}];
                  
        let nt = Note.fromLatin('Bb3');

        console.log('freq: ', nt.frequency);
        console.log(nt.scale('minor pentatonic'));
        console.log(nt.add('fifth').frequency);
        console.log('Sink:', Sink);

        let audioLib = new AudioLib();
        let sine = new OscillatorNode(audioLib, nt.frequency);

        console.log('output', audioLib.output);
        
        sine.connect(audioLib.output);        

        // let audiocb = (buffer, channelCount) => {

        //     for(let i=0; i<buffer.length; i+=channelCount) {

        //         this.lfoOscillator.generate();
        //         this.oscillator.fm = this.lfoOscillator.getMix();
        //         this.oscillator2.fm = this.lfoOscillator.getMix();

        //         this.oscillator.generate();
        //         this.oscillator2.generate();

        //         for(let n=0; n<channelCount; n++) {
        //             mixer.inputs[0] = this.oscillator.getMix(n) * this.oscillator.mix;
        //             mixer.inputs[1] = this.oscillator2.getMix(n) * this.oscillator2.mix;

        //             mixer.generate();

        //             //let sample =  buffer[i + n];
        //             let sample = 0;

        //             sample += mixer.getMix();
        //             filter.pushSample(sample);
        //             sample = filter.getMix();
                
        //             distortion.pushSample(sample);
        //             sample = distortion.getMix();

        //             buffer[i + n] += sample;
        //         }
        //     }
        // };

        // // TODO: move into service or factory
        // //let device = new Sink(function() {}, 2, 2048);

        // this.oscillator = new Oscillator(device.sampleRate, nt.frequency);
        // this.oscillator2 = new Oscillator(device.sampleRate, nt.subtract('major sixth').frequency, 'sawtooth');
        // this.lfoOscillator = new Oscillator(device.sampleRate, this.mod.frequency);

        // let distortion = new Distortion(device.deviceRate);

        // let filter = new IIRFilter(device.sampleRate, nt.frequency, 0.9, 0);

        // this.oscillator.mix = .1;
        // this.oscillator2.mix = .1;

        // var mixer = new Mixer(Sink.bufferSize, Sink.channelCount);



        //let s = new Sink(audiocb, 2, 2048);

        //let ag = new AudioLib();

        //console.log('ag', ag);

        this.webAudioKnobImage = require('../images/LittlePhatty.png');
    
    }

    updateVoices() {
        //this.lfoOscillator.reset();
        //this.lfoOscillator.frequency = this.mod.frequency;

        console.log('freq: ', this.mod.frequency);
    }

    changeLfoWaveform() {
        //this.lfoOscillator.reset();
        //this.lfoOscillator.waveShape = this.lfoWaveShape;
    }

    changeOscillatorWaveform() {
        //this.oscillator.reset();
        //this.oscillator.waveShape = this.oscillatorWaveShape;
    }

    changeOscillator2Waveform() {
        //this.oscillator2.reset();
        //this.oscillator2.waveShape = this.oscillator2WaveShape;
    }
}

// class AudioLib {
//     constructor(numberOfChannels, bufferSize, sampleRate) {
//         this.output = new AudioDevice(this, numberOfChannels, bufferSize, sampleRate);
//     }
// }

// /**
//  * Audio output device.  Uses sink.js to output to a range of APIs.
//  *
//  */
// class AudioDevice extends AudioGraphNode {

//     /*
//     * @constructor
//     * @param {AudioLib} audioLib The audioLib object.
//     * @param {Number} [sampleRate=44100] The sample rate to run at.
//     * @param {Number} [numberOfChannels=2] The number of output channels.
//     * @param {Number} [bufferSize=8192] A fixed buffer size to use.   
//     */
//     constructor(audioLib, numberOfChannels, bufferSize, sampleRate) {
//         super(audioLib, 1, 0);
        
//         this.sink = new Sink((buffer, numberOfChannels) => this.tick(buffer, numberOfChannels), numberOfChannels, bufferSize, sampleRate);
    
//         // Re-read the actual values from the sink.  Sample rate especially is
//         // liable to change depending on what the soundcard allows.
//         this.sampleRate = this.sink.sampleRate;
//         this.numberOfChannels = this.sink.channelCount;
//         this.bufferSize = this.sink.preBufferSize;

//         this.writePosition = 0;
//         this.buffer = null;
//         this.paused = false;

//         this.dirty = true;
//         this.nodes = [];        
//     }

//     tick(buffer, numberOfChannels) {
//         if (!this.paused) {
//             var input = this.inputs[0];
    
//             var samplesNeeded = buffer.length / numberOfChannels;
//             for (var i = 0; i < samplesNeeded; i++) {
//                 if (this.dirty) {
//                     this.nodes = this.visit([]);
//                     this.dirty = false;
//                 }
    
//                 // Tick in reverse order up to, but not including this node
//                 for (var j = this.nodes.length - 1; j > 0; j--) {
//                     this.nodes[j].tick();
//                 }
//                 // Cut down tick to just sum the input samples 
//                 this.createInputSamples();
    
//                 for (var j = 0; j < numberOfChannels; j++) {
//                     buffer[i * numberOfChannels + j] = input.samples[j];
//                 }
    
//                 this.writePosition += 1;
//             }
//         }
//     }

//     /**
//      * Get the current output position
//      *
//      * @return {Number} Output position in samples.
//      */
//     getPlaybackTime() {
//         return this.sink.getPlaybackTime();
//     }

//     /**
//      * Get the current write position
//      *
//      * @return {Number} Write position in samples.
//      */
//     getWriteTime() {
//         return this.writePosition;
//     }

//     pause() {
//         this.paused = true;
//     }
    
//     play() {
//         this.paused = false; 
//     }
    
// }

// class AudioOutput {
//     constructor(node, idx) {
//         this.node = node;
//         this.idx = idx;
//         this.inbound = [];
//         this.sampleBuffer = [];

//         this.input = null;
//         this.numberOfChannels = 1;
//     }

//     connect(output) {
//         this.inbound.push(output);
//     }

//     disconnect(input) {
//         var numberOfStreams = this.connectedTo.length;
//         for (var i = 0; i < numberOfStreams; i++) {
//             if (input == this.connectedTo[i]) {
//                 this.connectedTo.splice(i, 1);
//                 break;
//             }
//         }
//     }    

//     /**
//      * Link the output to an input, forcing the output to always contain the
//      * same number of channels as the input.
//      *
//      * @param {AudioletInput} input The input to link to.
//      */
//     linkNumberOfChannels(input) {
//         this.inbound = input;
//     }

//     /**
//      * Unlink the output from its linked input
//      */
//     unlinkNumberOfChannels() {
//         this.inbound = null;
//     }

//     /**
//      * Get the number of output channels, taking the value from the input if the
//      * output is linked.
//      *
//      * @return {Number} The number of output channels.
//      */
//     getNumberOfChannels() {
//         if (this.inbound && this.inbound.connectedFrom.length) {
//             return (this.inbound.samples.length);
//         }
//         return (this.numberOfChannels);
//     }    
// }

// class AudioInput {
//     constructor(node, idx) {
//         this.node = node;
//         this.idx = idx;
//         this.inbound = [];
//         this.sampleBuffer = [];
//     }

//     connect(output) {
//         this.inbound.push(output);
//     }

//     disconnect(output) {
//         var numberOfStreams = this.inbound.length;

//         for (var i = 0; i < numberOfStreams; i++) {
//             if (output == this.inbound[i]) {
//                 this.inbound.splice(i, 1);
//                 break;
//             }
//         }

//         if (this.inbound.length == 0) {
//             this.samples = [];
//         }
//     }    
// }

// class AudioGraphNode {
//     constructor(audioLib, numInputs, numOutputs) {

//         this.audioLib = audioLib;

//         this.inputs = [];
//         for(let i=0; i< numInputs; i++) {
//             this.inputs.push(new AudioInput())
//         }

//         this.outputs = [];
//         for(let i=0; i< numOutputs; i++) {
//             this.outputs.push(new AudioOutput())
//         }        
//     }

//     connect (node, output, input) {
//         if (node instanceof AudioGroup) {
//             // Connect to the pass-through node rather than the group
//             node = node.inputs[input || 0];
//             input = 0;
//         }
//         var outputPin = this.outputs[output || 0];
//         var inputPin = node.inputs[input || 0];
//         outputPin.connect(inputPin);
//         inputPin.connect(outputPin);
    
//         this.audioLib.device.dirty = true;
//     }    

//     disconnect(node, output, input) {
//         if (node instanceof AudioGroup) {
//             node = node.inputs[input || 0];
//             input = 0;
//         }
    
//         var outputPin = this.outputs[output || 0];
//         var inputPin = node.inputs[input || 0];
//         inputPin.disconnect(outputPin);
//         outputPin.disconnect(inputPin);
    
//         this.audioLib.device.dirty = true;
//     }

//     setNumberOfOutputChannels (output, numberOfChannels) {
//         this.outputs[output].numberOfChannels = numberOfChannels;
//     }    

//     linkNumberOfOutputChannels (output, input) {
//         this.outputs[output].linkNumberOfChannels(this.inputs[input]);
//     }

    
//     tick () {
//         this.createInputSamples();
//         this.createOutputSamples();
    
//         this.generate();
//     }    

//     visit(nodes) {
//         if (nodes.indexOf(this) == -1) {
//             nodes.push(this);
//             nodes = this.visitParents(nodes);
//         }
//         return nodes;
//     }    

//     visitParents(nodes) {
//         var numberOfInputs = this.inputs.length;
//         for (var i = 0; i < numberOfInputs; i++) {
//             var input = this.inputs[i];
//             var numberOfStreams = input.connectedFrom.length;
//             for (var j = 0; j < numberOfStreams; j++) {
//                 nodes = input.connectedFrom[j].node.visit(nodes);
//             }
//         }
//         return nodes;
//     }  
    
//     generate () {
//     }    

//     createInputSamples() {
//         var numberOfInputs = this.inputs.length;
//         for (var i = 0; i < numberOfInputs; i++) {
//             var input = this.inputs[i];
    
//             var numberOfInputChannels = 0;
    
//             for (var j = 0; j < input.connectedFrom.length; j++) {
//                 var output = input.connectedFrom[j];
//                 for (var k = 0; k < output.samples.length; k++) {
//                     var sample = output.samples[k];
//                     if (k < numberOfInputChannels) {
//                         input.samples[k] += sample;
//                     }
//                     else {
//                         input.samples[k] = sample;
//                         numberOfInputChannels += 1;
//                     }
//                 }
//             }
    
//             if (input.samples.length > numberOfInputChannels) {
//                 input.samples = input.samples.slice(0, numberOfInputChannels);
//             }
//         }
//     }

//     createOutputSamples() {
//         var numberOfOutputs = this.outputs.length;
//         // Copy the inputs buffers straight to the output buffers
//         for (var i = 0; i < numberOfOutputs; i++) {
//             var input = this.inputs[i];
//             var output = this.outputs[i];
//             if (input && input.samples.length != 0) {
//                 // Copy the input buffer straight to the output buffers
//                 output.samples = input.samples;
//             }
//             else {
//                 // Create the correct number of output samples
//                 var numberOfChannels = output.getNumberOfChannels();
//                 if (output.samples.length == numberOfChannels) {
//                     continue;
//                 }
//                 else if (output.samples.length > numberOfChannels) {
//                     output.samples = output.samples.slice(0, numberOfChannels);
//                     continue;
//                 }
    
//                 for (var j = output.samples.length; j < numberOfChannels; j++) {
//                     output.samples[j] = 0;
//                 }
//             }
//         }
//     }

//     remove() {
//         // Disconnect inputs
//         var numberOfInputs = this.inputs.length;
//         for (var i = 0; i < numberOfInputs; i++) {
//             var input = this.inputs[i];
//             var numberOfStreams = input.connectedFrom.length;
//             for (var j = 0; j < numberOfStreams; j++) {
//                 var outputPin = input.connectedFrom[j];
//                 var output = outputPin.node;
//                 output.disconnect(this, outputPin.index, i);
//             }
//         }
    
//         // Disconnect outputs
//         var numberOfOutputs = this.outputs.length;
//         for (var i = 0; i < numberOfOutputs; i++) {
//             var output = this.outputs[i];
//             var numberOfStreams = output.connectedTo.length;
//             for (var j = 0; j < numberOfStreams; j++) {
//                 var inputPin = output.connectedTo[j];
//                 var input = inputPin.node;
//                 this.disconnect(input, i, inputPin.index);
//             }
//         }
//     }    
    
// }

// /**
//  * A specialized type of AudioGraphNode where values from the inputs are passed
//  * straight to the corresponding outputs in the most efficient way possible.
//  * PassThroughNodes are used in AudioGroups to provide the inputs and
//  * outputs, and can also be used in analysis nodes where no modifications to
//  * the incoming audio are made.
//  */
// class PassThroughNode extends AudioGraphNode {
//     /*
//     * @constructor
//     * @extends AudioGraphNode
//     * @param {AudioLib} audioLib The audiolib object.
//     * @param {Number} numberOfInputs The number of inputs.
//     * @param {Number} numberOfOutputs The number of outputs.
//     */    
//     constructor(audioLib, numInputs, numOutputs) {
//         super(audioLib, numInputs, numOutputs);
//     }

//     /**
//      * Create output samples for each channel, copying any input samples to
//      * the corresponding outputs.
//      */
//     createOutputSamples() {
//         var numberOfOutputs = this.outputs.length;
//         // Copy the inputs buffers straight to the output buffers
//         for (var i = 0; i < numberOfOutputs; i++) {
//             var input = this.inputs[i];
//             var output = this.outputs[i];
//             if (input && input.samples.length != 0) {
//                 // Copy the input buffer straight to the output buffers
//                 output.samples = input.samples;
//             }
//             else {
//                 // Create the correct number of output samples
//                 var numberOfChannels = output.getNumberOfChannels();
//                 if (output.samples.length == numberOfChannels) {
//                     continue;
//                 }
//                 else if (output.samples.length > numberOfChannels) {
//                     output.samples = output.samples.slice(0, numberOfChannels);
//                     continue;
//                 }

//                 for (var j = output.samples.length; j < numberOfChannels; j++) {
//                     output.samples[j] = 0;
//                 }
//             }
//         }
//     }

// }

// class AudioParameter {
//     /*
//     * @constructor
//     * @param {AudioGraphNode} node The node which the parameter is associated with.
//     * @param {Number} [inputIndex] The index of the AudioletInput to link to.
//     * @param {Number} [value=0] The initial static value to store.
//     */
//     constructor(node, inputIndex, value) {
//         this.node = node;
//         if (typeof inputIndex != 'undefined' && inputIndex != null) {
//             this.input = node.inputs[inputIndex];
//         }
//         else {
//             this.input = null;
//         }
//         this.value = value || 0;
//     }

//     /**
//      * Check whether the static value should be used.
//      *
//      * @return {Boolean} True if the static value should be used.
//      */
//     isStatic() {
//         return (this.input.samples.length == 0);
//     }

//     /**
//      * Check whether the dynamic values should be used.
//      *
//      * @return {Boolean} True if the dynamic values should be used.
//      */
//     isDynamic() {
//         return (this.input.samples.length > 0);
//     }

//     /**
//      * Set the stored static value
//      *
//      * @param {Number} value The value to store.
//      */
//     setValue(value) {
//         this.value = value;
//     }

//     /**
//      * Get the stored static value
//      *
//      * @return {Number} The stored static value.
//      */
//     getValue() {
//         if (this.input != null && this.input.samples.length > 0) {
//             return this.input.samples[0];
//         }
//         else {
//             return this.value;
//         }
//     }

// }

// /**
//  * A container for collections of connected AudioGraphNodes.  Groups make it
//  * possible to create multiple copies of predefined networks of nodes,
//  * without having to manually create and connect up each individual node.
//  *
//  * From the outside groups look and behave exactly the same as nodes.
//  * Internally you can connect nodes directly to the group's inputs and
//  * outputs, allowing connection to nodes outside of the group.
//  *
// */
// class AudioGraphGroup extends AudioGraphNode {

//     /*
//     * @constructor
//     * @param {AudioGraph} audioGraph The audioGraph object.
//     * @param {Number} numberOfInputs The number of inputs.
//     * @param {Number} numberOfOutputs The number of outputs.
//     */    
//     constructor(audioLib, numInputs, numOutputs) {
//         super(audioLib, numInputs, numOutputs);

//         this.audioLib = audioLib;

//         this.inputs = [];
//         for (var i = 0; i < numInputs; i++) {
//             this.inputs.push(new PassThroughNode(audioLib, 1, 1));
//         }
    
//         this.outputs = [];
//         for (var i = 0; i < numOutputs; i++) {
//             this.outputs.push(new PassThroughNode(audioLib, 1, 1));
//         }        
//     }

//     /**
//      * Connect the group to another node or group
//      *
//      * @param {AudioGraphNode|AudioGraphGroup} node The node to connect to.
//      * @param {Number} [output=0] The index of the output to connect from.
//      * @param {Number} [input=0] The index of the input to connect to.
//      */
//     connect(node, output, input) {
//         this.outputs[output || 0].connect(node, 0, input);
//     }

//     /**
//      * Disconnect the group from another node or group
//      *
//      * @param {AudioGraphNode|AudioGraphGroup} node The node to disconnect from.
//      * @param {Number} [output=0] The index of the output to disconnect.
//      * @param {Number} [input=0] The index of the input to disconnect.
//      */
//     disconnect (node, output, input) {
//         this.outputs[output || 0].disconnect(node, 0, input);
//     }

//     /**
//      * Remove the group completely from the processing graph, disconnecting all
//      * of its inputs and outputs
//      */
//     remove() {
//         var numberOfInputs = this.inputs.length;
//         for (var i = 0; i < numberOfInputs; i++) {
//             this.inputs[i].remove();
//         }

//         var numberOfOutputs = this.outputs.length;
//         for (var i = 0; i < numberOfOutputs; i++) {
//             this.outputs[i].remove();
//         }
//     }    

// }

// class NewOscillator extends AudioGraphNode {
//     constructor(audioLib, frequency) {
//         super(audioLib, 1, 1);
//     }
// }

class Jack extends Float32Array {
    constructor(sz) {
        super(sz);
    }
}

class Mixer {
    constructor(bufferSize, channels) {
        this.channels = channels || 1;
        this.bufferSize = bufferSize || 1024

        this.inputs = [];

        this.inputs.push(new Float32Array(this.bufferSize * channels));
        this.inputs.push(new Float32Array(this.bufferSize * channels));
        //this.inputs.push(new Float32Array(this.bufferSize * channels));

        this.output = new Float32Array(this.bufferSize * channels);

        this.sample = 0;
    }

    generate() {

        this.sample = 0;
        for(let j=0; j<this.inputs.length; j++) {
            this.sample += this.inputs[j];
        }

    }

    getMix() {
        return this.sample;
    }
}


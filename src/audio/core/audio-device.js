import {AudioGraphNode} from './audio-node';
import Sink from './sink';

/**
 * Audio output device.  Uses sink.js to output to a range of APIs.
 *
 */
class AudioDevice extends AudioGraphNode {
    
    /*
    * @constructor
    * @param {AudioLib} audiolib The audiolib object.
    * @param {Number} [sampleRate=44100] The sample rate to run at.
    * @param {Number} [numberOfChannels=2] The number of output channels.
    * @param {Number} [bufferSize=8192] A fixed buffer size to use.   
    */
    constructor(audiolib, numberOfChannels, bufferSize, sampleRate) {
        super(audiolib, 1, 0);
        
        this.sink = new Sink((buffer, numberOfChannels) => this.tick(buffer, numberOfChannels), numberOfChannels, bufferSize, sampleRate);
    
        // Re-read the actual values from the sink.  Sample rate especially is
        // liable to change depending on what the soundcard allows.
        this.sampleRate = this.sink.sampleRate;
        this.numberOfChannels = this.sink.channelCount;
        this.bufferSize = this.sink.preBufferSize;

        this.writePosition = 0;
        this.buffer = null;
        this.paused = false;

        this.dirty = true;
        this.nodes = [];        
    }

    tick(buffer, numberOfChannels) {
        if (!this.paused) {
            var input = this.inputs[0];
    
            var samplesNeeded = buffer.length / numberOfChannels;
            for (var i = 0; i < samplesNeeded; i++) {
                if (this.dirty) {
                    this.nodes = this.visit([]);
                    this.dirty = false;
                }
    
                // Tick in reverse order up to, but not including this node
                for (var j = this.nodes.length - 1; j > 0; j--) {
                    this.nodes[j].tick();
                }
                // Cut down tick to just sum the input samples 
                this.createInputSamples();
    
                for (var j = 0; j < numberOfChannels; j++) {
                    buffer[i * numberOfChannels + j] = input.samples[j];
                }
    
                this.writePosition += 1;
            }
        }
    }

    /**
     * Get the current output position
     *
     * @return {Number} Output position in samples.
     */
    getPlaybackTime() {
        return this.sink.getPlaybackTime();
    }

    /**
     * Get the current write position
     *
     * @return {Number} Write position in samples.
     */
    getWriteTime() {
        return this.writePosition;
    }

    pause() {
        this.paused = true;
    }
    
    play() {
        this.paused = false; 
    }
    
}

module.exports = AudioDevice;
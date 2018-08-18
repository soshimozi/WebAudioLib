import AudioDestination from './audio-destination';

/**
 * The base audiolib object.  Contains an output node which pulls data from
 * connected nodes.
 *
 */
export default class {
    /*
    * @constructor
    * @param {Number} [sampleRate=44100] The sample rate to run at.
    * @param {Number} [numberOfChannels=2] The number of output channels.
    * @param {Number} [bufferSize] Block size.  If undefined uses a sane default.
    */    
    constructor(numberOfChannels, bufferSize, sampleRate) {
        this.output = new AudioDestination(this, numberOfChannels, bufferSize, sampleRate);
    }
}
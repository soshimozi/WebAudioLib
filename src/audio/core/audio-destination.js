import {AudioGroup} from './audio-node';
import AudioDevice from './audio-device';
import UpMixer from '../dsp/up-mixer';
import Scheduler from './scheduler';

/**
 * Group containing all of the components for the Audiolet output chain.  The
 * chain consists of:
 *
 *     Input => Scheduler => UpMixer => Output
 *
 * **Inputs**
 *
 * - Audio
 *
 */
export default class AudioDestination extends AudioGroup {
    /*
    * @constructor
    * @extends AudioGroup
    * @param {AudioLib} audioLib The audioLib object.
    * @param {Number} [sampleRate=44100] The sample rate to run at.
    * @param {Number} [numberOfChannels=2] The number of output channels.
    * @param {Number} [bufferSize=8192] A fixed buffer size to use.
    */
    constructor(audiolib, sampleRate, numberOfChannels, bufferSize) {
        super(audiolib, 1, 0);

        console.log('audiolib: ', audiolib);
        
        this.device = new AudioDevice(audiolib, sampleRate, numberOfChannels, bufferSize);

        audiolib.device = this.device; // Shortcut
        
        this.scheduler = new Scheduler(audiolib);
        audiolib.scheduler = this.scheduler; // Shortcut

        this.upMixer = new UpMixer(audiolib, this.device.numberOfChannels);

        this.inputs[0].connect(this.scheduler);
        this.scheduler.connect(this.upMixer);
        this.upMixer.connect(this.device);
    }
}
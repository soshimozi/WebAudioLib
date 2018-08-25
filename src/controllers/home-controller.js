import Sink from '../audio/core/sink';

import {Note, Interval} from '../music';
import Oscillator from '../audio/oscillator';
import IIRFilter from '../audio/iirfilter';
import Distortion from '../audio/distortion';
import AudioLib from '../audio/core/audio-lib';
import OscillatorNode from '../audio/dsp/oscillator-node';
import {PassThroughNode} from '../audio/core/audio-node';
import IIRFilterNode from '../audio/dsp/iir-filter';
import ParameterNode from '../audio/core/parameter-node';
import KeySpline from '../audio/key-spline';
import Bezier from '../audio/bezier';

export default class {

    constructor() {
        this.message = "Hello World from controller";
        this.isReady = false;

        //this.lfoWaveShape = 'sine';
        //this.oscillator2WaveShape = 'sine';
        //this.oscillatorWaveShape = 'sine';

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
                display: 'Inverse Sawtooth',
                value: 'invSawtooth',
                url: require('../images/invSawtooth.png')

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
            waveShape: 'sine',
            selected: this.waveShapes[0],
            mix: 5
        }

        this.osc1 = {
            detune: 0,
            selected: this.waveShapes[0]
        };

        this.osc2 = {
            detune: 0,
            selected: this.waveShapes[0]
        }        

        this.noteOffTime = null;
        this.disabled = undefined;
        this.person = {};
        this.language_list = [{'name': 'english', 'url': 'https://raw.githubusercontent.com/stevenrskelton/flag-icon/master/png/16/country-4x3/gb.png'},{'name': 'italian', 'url': 'https://raw.githubusercontent.com/stevenrskelton/flag-icon/master/png/16/country-4x3/it.png'}];
                  
        let nt = this.nt = Note.fromLatin('A4');

        console.log('freq: ', nt.frequency);
        console.log(nt.scale('minor pentatonic'));
        console.log(nt.add('fifth').frequency);
        console.log('Sink:', Sink);

        const easing = {
             "ease": [0.25, 0.1, 0.25, 1.0],
             "linear":      [0.00, 0.0, 1.00, 1.0],
             "ease-in":     [0.42, 0.0, 1.00, 1.0],
             "ease-out":    [0.00, 0.0, 0.58, 1.0],
             "ease-in-out": [0.42, 0.0, 0.58, 1.0]             
        };

        var spline = new KeySpline(0.04, 0.02, 0.99, 0.01);
        console.log('spline', spline);

        console.log("0:", spline.get(0));
        console.log(".25:", spline.get(.25));
        console.log(".50:", spline.get(.50));
        console.log(".75:", spline.get(.75));
        console.log("1.0:", spline.get(1.0));

        const e = new Bezier(0.04, 0.02, 0.99, 0.01);
        console.log(1 - e(0));
        console.log(1 - e(.25));
        console.log(1 - e(.5));
        console.log(1 - e(.75));
        console.log(1 - e(.9));
        console.log(1 - e(1.0));

    

        //let audioLib = new AudioLib();
        //let sine = new OscillatorNode(audioLib, nt.frequency);
        
        //sine.connect(audioLib.output);        

        this.paused = true;

        this.logged = false;

        this.noteOn = false;

        let audiocb = (buffer, channelCount) => {

            if(!this.noteOn) return;

            for(let i=0; i<buffer.length; i+=channelCount) {

                this.lfoOscillator.generate();

                this.oscillator.fm = 0;
                this.oscillator2.fm = 0;

                if(this.lfoOscillator.frequency > 0) {
                    this.oscillator.fm = (this.mod.mix/10.0) * this.lfoOscillator.getMix();
                    this.oscillator2.fm = (this.mod.mix/10.0) *  this.lfoOscillator.getMix();
                }

                this.oscillator.generate();
                this.oscillator2.generate();

                for(let n=0; n<channelCount; n++) {

                    var mix1 = this.oscillator.mix;
                    var mix2 = this.oscillator2.mix;
                    var masterMix = 1;

                    if(this.noteOffTime !== null) {
                        let x = (this.noteOffTime - Date.now()) / 250;

                        if(x <= 0)  { 
                            this.noteOn = false;
                            masterMix = 0;
                        }
                        else
                            masterMix = 1 - e(x);
                    }

                    let sample = 0;
                    sample += ((this.oscillator.getMix(n) * mix1) + (this.oscillator2.getMix(n) * mix2)); //mixer.getMix();
                    filter.pushSample(sample);
                    sample = filter.getMix();
                
                    sample *= masterMix;
                    //distortion.pushSample(sample);
                    //sample = distortion.getMix();

                    buffer[i + n] += sample;
                }
            }
        };

        let device = this.device = new Sink(audiocb, 2, 2048);

        this.oscillator = new Oscillator(device.sampleRate, nt.frequency);
        this.oscillator2 = new Oscillator(device.sampleRate, nt.add('major seventh').frequency);
        this.lfoOscillator = new Oscillator(device.sampleRate, this.mod.frequency);

        let distortion = new Distortion(device.deviceRate);

        let filter = this.filter = new IIRFilter(device.sampleRate, nt.frequency, 0.9, 0);

        this.oscillator.mix = 1;
        this.oscillator2.mix = 1;

        this.webAudioKnobImage = require('../images/LittlePhatty.png');
    
    }

    onNote(n) {
        let notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#","A", "A#", "B"];

        console.log('n:', n);

        let oct = 4;

        let noteName;
        if(n[1] >= 12) {
            oct++;

            console.log('n[1]: ', n[1]);

            if(n[1] == 24) {
                oct++;
                noteName = notes[0];
            } else {
                noteName = notes[n[1] - 12];
            }
        } else {
            noteName = notes[n[1]];
        }


        noteName = noteName + oct;
        let note = Note.fromLatin(noteName);

        // here we would determine octave based on offset and such
        //this.oscillator.frequency = note.frequency; 
        //this.oscillator2.frequency = note.frequency;

        this.centerFrequency = note.frequency;
        let originalNote = note;

        for(var i=0;i<Math.abs(this.osc1.detune);i++) {
            if(this.osc1.detune < 0) {
                note = note.subtract("octave");
            } else {
                note = note.add("octave");
            }
        }

        this.oscillator.frequency = note.frequency; 

        note = originalNote;
        for(var i=0;i<Math.abs(this.osc2.detune);i++) {
            if(this.osc2.detune < 0) {
                note = note.subtract("octave");
            } else {
                note = note.add("octave");
            }
        }

        this.oscillator2.frequency = note.frequency;
        this.filter.cutoff = this.centerFrequency;

        if(n[0]) {
            this.noteOn = true
            this.noteOffTime = null;
        } else {
            this.noteOffTime = Date.now() + 150;
        }
    }

    updateVoices() {
    }

    changeLfoWaveform() {
        this.lfoOscillator.reset();
        this.lfoOscillator.waveShape = this.lfoWaveShape;
    }

    changeOscillatorWaveform() {
        this.oscillator.reset();
        this.oscillator.waveShape = this.oscillatorWaveShape;
    }

    changeOscillator2Waveform() {
        this.oscillator2.reset();
        this.oscillator2.waveShape = this.oscillator2WaveShape;
    }

    pause() {
        this.paused = true;

        console.log('selected', this.mod.selected);
    }

    play() {
        this.paused = false;
    }

    lfoFrequencyChanged() {
        this.lfoOscillator.reset();
        this.lfoOscillator.frequency = this.mod.frequency;
    }
    
    lfoWaveShapeChanged() {
        this.lfoOscillator.reset();
        this.lfoOscillator.waveShape = this.mod.selected.value;
    }

    osc1DetuneChanged() {
        this.oscillator.reset();
        this.oscillator.frequency = this.nt.add(new Interval([this.osc1.detune, 0])).frequency;
    }

    osc1WaveShapeChanged() {
        this.oscillator.reset();
        this.oscillator.waveShape = this.osc1.selected.value;
    }

    osc2DetuneChanged() {
        this.oscillator2.reset();
        this.oscillator2.frequency = this.nt.subtract('major sixth').add(new Interval([this.osc2.detune, 0])).frequency;
    }

    osc2WaveShapeChanged() {
        this.oscillator2.reset();
        this.oscillator2.waveShape = this.osc2.selected.value;
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


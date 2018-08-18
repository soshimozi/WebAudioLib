class Sink {
    constructor(readFn, channelCount, bufferSize, sampleRate) {
        this.sampleRate = 44100;
        this.channelCount = 2;
        this.bufferSize = 4096;
    
        this.writePosition = 0;
        this.previousHit = 0;
        this.ringOffset = 0;
    
        this.channelMode = 'interleaved';
        this.isReady = false;
        
        this.channelCount	= isNaN(channelCount) || channelCount === null ? this.channelCount: channelCount;
        this.bufferSize		= isNaN(bufferSize) || bufferSize === null ? this.bufferSize : bufferSize;
        this.sampleRate		= isNaN(sampleRate) || sampleRate === null ? this.sampleRate : sampleRate;
        this.readFn		= readFn;
        this.activeRecordings	= [];
        this.previousHit	= +new Date();

        this._listeners = {};

		let soundData	= null,
		    outBuffer	= null,
            zeroBuffer	= null;
                
        let context = this.context;
        let node = context.createScriptProcessor(this.bufferSize, this.channelCount, this.channelCount);

        let bufferFill = (e) => {
            var	outputBuffer	= e.outputBuffer,
                channelCount	= outputBuffer.numberOfChannels,
                i, n, l		= outputBuffer.length,
                size		= outputBuffer.size,
                channels	= new Array(channelCount),
                tail;
    
            this.ready();
            
            soundData	= soundData && soundData.length === l * channelCount ? soundData : new Float32Array(l * channelCount);
            zeroBuffer	= zeroBuffer && zeroBuffer.length === soundData.length ? zeroBuffer : new Float32Array(l * channelCount);
            soundData.set(zeroBuffer);
    
            for (i=0; i<channelCount; i++) {
                channels[i] = outputBuffer.getChannelData(i);
            }
    
            this.process(soundData, this.channelCount);
    
            for (i=0; i<l; i++) {
                for (n=0; n < channelCount; n++) {
                    channels[n][i] = soundData[i * this.channelCount + n];
                }
            }
        }
    
        this.sampleRate = context.sampleRate;
    
        node.onaudioprocess = bufferFill;
        node.connect(context.destination);
    
        this._context	= context;
        this._node		= node;
        this._callback	= bufferFill;        
    }  

    process(soundData, channelCount) {
		this.emit('preprocess', arguments);

		if (this.ringBuffer) {
			(this.channelMode === 'interleaved' ? this.ringSpin : this.ringSpinInterleaved).apply(this, arguments);
		}

		if (this.channelMode === 'interleaved') {
			this.emit('audioprocess', arguments);

			if (this.readFn) {
				this.readFn.apply(this, arguments);
			}
		} else {
			var	soundDataSplit	= Sink.deinterleave(soundData, this.channelCount),
				args		= [soundDataSplit].concat([].slice.call(arguments, 1));
			this.emit('audioprocess', args);

			if (this.readFn) {
				this.readFn.apply(this, args);
			}

			Sink.interleave(soundDataSplit, this.channelCount, soundData);
		}
		this.emit('postprocess', arguments);
		this.previousHit = +new Date();
		this.writePosition += soundData.length / channelCount;
    }
    
    ready () {
		if (this.isReady) return;

		this.isReady = true;
		this.emit('ready', []);
    }    
    
	kill () {
		this._node.disconnect(0);
		this._node = this._context = null;
		this.emit('kill');
	}

	getPlaybackTime () {
		return this._context.currentTime * this.sampleRate;
    }    

    /**
     * Emits an event.
     *
     * @method EventEmitter
     *
     * @arg {String} name The name of the event to emit.
     * @arg {Array} args The arguments to pass to the event handlers.
    */
    emit (name, args) {
        if (this._listeners[name]) {
            for (var i=0; i<this._listeners[name].length; i++) {
                this._listeners[name][i].apply(this, args);
            }
        }
        return this;
    }

    /**
    * Adds an event listener to an event.
    *
    * @method EventEmitter
    *
    * @arg {String} name The name of the event.
    * @arg {Function} listener The event listener to attach to the event.
    */
    on (name, listener) {
        this._listeners[name] = this._listeners[name] || [];
        this._listeners[name].push(listener);
        return this;
    }

    /**
    * Adds an event listener to an event.
    *
    * @method EventEmitter
    *
    * @arg {String} name The name of the event.
    * @arg {Function} !listener The event listener to remove from the event. If not specified, will delete all.
    */    
    off (name, listener) {
        if (this._listeners[name]) {
            if (!listener) {
                delete this._listeners[name];
                return this;
            }

            for (var i=0; i<this._listeners[name].length; i++) {
                if (this._listeners[name][i] === listener) {
                    this._listeners[name].splice(i--, 1);
                }
            }

            if (!this._listeners[name].length) {
                delete this._listeners[name];
            }
        }
        return this;        
    }

    static interleave(buffers, channelCount, buffer) {
        channelCount		= channelCount || buffers.length;
        var	l		= buffers[0].length,
            bufferCount	= buffers.length,
            i, n;
        buffer			= buffer || new Float32Array(l * channelCount);
        for (i=0; i<bufferCount; i++) {
            for (n=0; n<l; n++) {
                buffer[i + n * channelCount] = buffers[i][n];
            }
        }
        return buffer;
    }

    static deinterleave(buffer, channelCount) {
        var	l	= buffer.length,
            size	= l / channelCount,
            ret	= [],
            i, n;
        for (i=0; i<channelCount; i++){
            ret[i] = new Float32Array(size);
            for (n=0; n<size; n++){
                ret[i][n] = buffer[n * channelCount + i];
            }
        }
        return ret;
    }

    /**
     * Mixes two or more buffers down to one.
     *
     * @static Sink
     * @name mix
     *
     * @arg {Buffer} buffer The buffer to append the others to.
     * @arg {Buffer} bufferX The buffers to append from.
     *
     * @return {Buffer} The mixed buffer.
    */    
    static mix (buffer) {
        var	buffers	= [].slice.call(arguments, 1),
            l, i, c;
        for (c=0; c<buffers.length; c++){
            l = Math.max(buffer.length, buffers[c].length);
            for (i=0; i<l; i++){
                buffer[i] += buffers[c][i];
            }
        }
        return buffer;    
    }

    /**
     * Resets a buffer to all zeroes.
     *
     * @static Sink
     * @name resetBuffer
     *
     * @arg {Buffer} buffer The buffer to reset.
     *
     * @return {Buffer} The 0-reset buffer.
    */
    static resetBuffer (buffer) {
        var	l	= buffer.length,
            i;
        for (i=0; i<l; i++){
            buffer[i] = 0;
        }
        return buffer;
    }
    
    /**
     * Copies the content of a buffer to another buffer.
     *
     * @static Sink
     * @name clone
     *
     * @arg {Buffer} buffer The buffer to copy from.
     * @arg {Buffer} !result The buffer to copy to.
     *
     * @return {Buffer} A clone of the buffer.
    */
    
    static clone (buffer, result) {
        var	l	= buffer.length,
            i;
        result = result || new Float32Array(l);
        for (i=0; i<l; i++){
            result[i] = buffer[i];
        }
        return result;
    }
    
    /**
     * Creates an array of buffers of the specified length and the specified count.
     *
     * @static Sink
     * @name createDeinterleaved
     *
     * @arg {Number} length The length of a single channel.
     * @arg {Number} channelCount The number of channels.
     * @return {Array} The array of buffers.
    */
    
    static createDeinterleaved (length, channelCount) {
        var	result	= new Array(channelCount),
            i;
        for (i=0; i<channelCount; i++){
            result[i] = new Float32Array(length);
        }
        return result;
    }
    
    static memcpy (src, srcOffset, dst, dstOffset, length) {
        src	= src.subarray || src.slice ? src : src.buffer;
        dst	= dst.subarray || dst.slice ? dst : dst.buffer;
    
        src	= srcOffset ? src.subarray ?
            src.subarray(srcOffset, length && srcOffset + length) :
            src.slice(srcOffset, length && srcOffset + length) : src;
    
        if (dst.set) {
            dst.set(src, dstOffset);
        } else {
            for (var i=0; i<src.length; i++) {
                dst[i + dstOffset] = src[i];
            }
        }
    
        return dst;
    }
    
    static memslice (buffer, offset, length) {
        return buffer.subarray ? buffer.subarray(offset, length) : buffer.slice(offset, length);
    }
    
    static mempad (buffer, out, offset) {
        out = out.length ? out : new (buffer.constructor)(out);
        Sink.memcpy(buffer, 0, out, offset);
        return out;
    }
    
    static linspace (start, end, out) {
        var l, i, n, step;
        out	= out.length ? (l=out.length) && out : Array(l=out);
        step	= (end - start) / --l;
        for (n=start+step, i=1; i<l; i++, n+=step) {
            out[i] = n;
        }
        out[0]	= start;
        out[l]	= end;
        return out;
    }
    
    static ftoi (input, bitCount, output) {
        var i, mask = Math.pow(2, bitCount - 1);
    
        output = output || new (input.constructor)(input.length);
    
        for (i=0; i<input.length; i++) {
            output[i] = ~~(mask * input[i]);
        }
    
        return output;
    }

    /**
     * Resamples a sample buffer from a frequency to a frequency and / or from a sample rate to a sample rate.
     *
     * @static Sink
     * @name resample
     *
     * @arg {Buffer} buffer The sample buffer to resample.
     * @arg {Number} fromRate The original sample rate of the buffer, or if the last argument, the speed ratio to convert with.
     * @arg {Number} fromFrequency The original frequency of the buffer, or if the last argument, used as toRate and the secondary comparison will not be made.
     * @arg {Number} toRate The sample rate of the created buffer.
     * @arg {Number} toFrequency The frequency of the created buffer.
     *
     * @return The new resampled buffer.
    */
    static resample (buffer, fromRate /* or speed */, fromFrequency /* or toRate */, toRate, toFrequency) {
        var
            argc		= arguments.length,
            speed		= argc === 2 ? fromRate : argc === 3 ? fromRate / fromFrequency : toRate / fromRate * toFrequency / fromFrequency,
            l		= buffer.length,
            length		= Math.ceil(l / speed),
            newBuffer	= new Float32Array(length),
            i, n;
        for (i=0, n=0; i<l; i += speed) {
            newBuffer[n++] = Sink.interpolate(buffer, i);
        }
        return newBuffer;
    }

    get context() {
        return Sink.context;
    }

}

Sink.context = new AudioContext(/*sampleRate*/);

module.exports = Sink;
import Effect from './effect';
import IIRFilter from './iirfilter';


export default class extends Effect {

    constructor(sampleRate) {
        super();

        this.hpf1	= new IIRFilter(sampleRate, 720.484);
        this.lpf1	= new IIRFilter(sampleRate, 723.431);
        this.hpf2	= new IIRFilter(sampleRate, 1.0);
        this.smpl	= 0.0;

        this.gain = 4;
        this.master = 1;
        this.sampleRate = sampleRate;
        this.filters = [this.hpf1, this.lpf1, this.hpf2];    
    }

	pushSample (s) {
		this.hpf1.pushSample(s);
		this.smpl = this.hpf1.getMix(1) * this.gain;
		this.smpl = Math.atan(this.smpl) + this.smpl;
		if (this.smpl > 0.4) {
			this.smpl = 0.4;
		} else if (this.smpl < -0.4) {
			this.smpl = -0.4;
		}
		this.lpf1.pushSample(this.smpl);
		this.hpf2.pushSample(this.lpf1.getMix(0));
		this.smpl = this.hpf2.getMix(1) * this.master;
		return this.smpl;
    }
    
	getMix () {
		return this.smpl;
	} 
}
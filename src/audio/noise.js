import Sink from './core/sink';
import Generator from './generator';

export default class extends Generator {
    constructor(sampleRate, color) {
        super();

        this.color = color || 'white';
        this.b0 = 0;
        this.b1 = 0,
        this.b2 = 0;
        this.b3 = 0;
        this.b5 = 0;
        this.c1 = null;
        this.c2 = null;
        this.c3 = null;
        this.c4 = null;
        this.q = 15;
        this.q0 = null;
        this.q1 = null;
        this.brownQ = 0; // brown seed
        this.value = 0; //current value of noise generator

        this.reset(sampleRate, color);

        this.functions = {
            white: () => {
                let r = Math.random();
                return (r * this.c1 - this.c4) * this.c3;                
            },
            brown: () => {
                let	w	= this.functions.white();
                this.brownQ	= (this.q1 * w + this.q0 * this.brownQ);
                return 6.2 * this.brownQ;                
            },
            pink: () => {
                let	w	= this.functions.white();
                this.b0 = 0.997 * this.b0 + 0.029591 * w;
                this.b1 = 0.985 * this.b1 + 0.032534 * w;
                this.b2 = 0.950 * this.b2 + 0.048056 * w;
                this.b3 = 0.850 * this.b3 + 0.090579 * w;
                this.b4 = 0.620 * this.b4 + 0.108990 * w;
                this.b5 = 0.250 * this.b5 + 0.255784 * w;
                return 0.55 * (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5);                
            }
        }
    }

    generate() {
        this.value = this.functions[this.color]();
    }

    getMix() {
        return this.value;
    }

    reset(sampleRate, color) {
        this.sampleRate = sampleRate;
        this.color = typeof color === 'string' ? color: this.color;
        this.c1 = (1 << this.q) - 1;
        this.c2 = (~~(this.c1 / 3)) + 1;
        this.c3 = 1 / this.c1;
        this.c1 = this.c2 * 6;
        this.c4 = 3 * (this.c2 - 1);
        this.q0 = Math.exp(-200 * Math.PI / this.sampleRate);
        this.q1 = 1 - this.q0;
    }
}
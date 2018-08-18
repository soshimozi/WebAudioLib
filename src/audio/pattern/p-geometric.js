import Pattern from './pattern';

/**
 * Geometric sequence.  Multiplies a running total by a value on each next
 * call.
 *
 */
export default class PGeometric extends Pattern {
    constructor(start, step, repeats) {
        super();
        this.start = start;
        this.value = start;
        this.step = step;
        this.repeats = repeats;
        this.position = 0;
    }

    /**
     * Generate the next value in the pattern.
     *
     * @return {Number} The next value.
     */
    next() {
        var returnValue;
        if (this.position == 0) {
            returnValue = this.value;
            this.position += 1;
        }
        else if (this.position < this.repeats) {
            var step = this.valueOf(this.step);
            if (step != null) {
                this.value *= step;
                returnValue = this.value;
                this.position += 1;
            }
            else {
                returnValue = null;
            }
        }
        else {
            returnValue = null;
        }
        return (returnValue);
    }

    /**
     * Reset the pattern
     */
    reset() {
        this.value = this.start;
        this.position = 0;
        if (this.step instanceof Pattern) {
            this.step.reset();
        }
    }
}
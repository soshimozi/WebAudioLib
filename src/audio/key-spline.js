const A = (aA1, aA2) => { return 1.0 - 3.0 * aA2 + 3.0 * aA1; };
const B = (aA1, aA2) => { return 3.0 * aA2 - 6.0 * aA1; };
const C = (aA1) => { return 3.0 * aA1};

const CalcBezier = (aT, aA1, aA2) => {
    return ((A(aA1, aA2)* aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
};

const GetSlope = (aT, aA1, aA2) => {
    return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
};



export default class {
    constructor(mX1, mY1, mX2, mY2) {
        this.mX1 = mX1;
        this.mY1 = mY1;
        this.mX2 = mX2;
        this.mY2 = mY2;
    }

    get(aX) {
        if (this.mX1 == this.mY1 && this.mX2 == this.mY2) return aX; // linear
        return CalcBezier(this.GetTForX(aX), this.mY1, this.mY2);
    }

    GetTForX(aX) {
        // Newton raphson iteration
        var aGuessT = aX;
    
        for (var i = 0; i < 4; ++i) {
          var currentSlope = GetSlope(aGuessT, this.mX1, this.mX2);
          if (currentSlope == 0.0) return aGuessT;
          var currentX = CalcBezier(aGuessT, this.mX1, this.mX2) - aX;
          aGuessT -= currentX / currentSlope;
        }
        return aGuessT;
    }    
}
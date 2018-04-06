import "Stomach.js";
import "Intestine.js";
import "Blood.js";

export class AdiposeTissue{
    constructor(myBody)
    {
        this.body = myBody;
        this.fat = (this.body.fatFraction_) * (this.body.bodyWeight_)*1000.0;
    }

    processTick()
    {
        //SimCtl::time_stamp();

        //cout << " BodyWeight: " << body->bodyWeight_ << endl;
        //console.log("BodyWeight " + body.bodyweight + endl);
    }

    setParams()
    {

    }

    lipogenesis(glucoseInMG)
    {
        // one gram of glucose has 4kcal of energy
        // one gram of TAG has 9 kcal of energy
        this.body.bodyWeight_ -= this.fat/1000.0;
        this.fat += (glucoseInMG/1000.0)*4.0/9.0;
        this.body.bodyWeight_ += fat/1000.0;
    }

    consumeFat(kcal)
    {
        this.body.bodyWeight_ -= fat/1000.0;
        this.fat -= kcal/9.0;
        this.body.bodyWeight_ += fat/1000.0;
    }

    addFat(newFatInMG)
    {
        this.body.bodyWeight_ -= this.fat/1000.0;
        this.fat += newFatInMG/1000.0;
        this.body.bodyWeight_ += this.fat/1000.0;
        //cout << "BodyWeight: addFat " << body->bodyWeight_ << " newfat " << newFatInMG << endl;
        //console.log(BodyWeight: addFat " + body->bodyWeight_ + " newfat " + newFatInMG + endl);
    }
}
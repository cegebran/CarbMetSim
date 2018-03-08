class AdiposeTissue{
    constructor(myBody)
    {
        body = myBody;
        fat = (body.fatFraction_) * (body.bodyWeight_)*1000.0;
    }

    processTick()
    {
        //SimCtl::time_stamp();

        //cout << " BodyWeight: " << body->bodyWeight_ << endl;
        //Console.log("BodyWeight " + body.bodyweight + endl);
    }

    setParams()
    {

    }

    lipogenesis(glucoseInMG)
    {
        // one gram of glucose has 4kcal of energy
        // one gram of TAG has 9 kcal of energy
        body.bodyWeight_ -= fat/1000.0;
        fat += (glucoseInMG/1000.0)*4.0/9.0;
        body.bodyWeight_ += fat/1000.0;
    }

    consumeFat(kcal)
    {
        body.bodyWeight_ -= fat/1000.0;
        fat -= kcal/9.0;
        body.bodyWeight_ += fat/1000.0;
    }

    addFat(newFatInMG)
    {
        body.bodyWeight_ -= fat/1000.0;
        fat += newFatInMG/1000.0;
        body.bodyWeight_ += fat/1000.0;
        //cout << "BodyWeight: addFat " << body->bodyWeight_ << " newfat " << newFatInMG << endl;
        //Console.log(BodyWeight: addFat " + body->bodyWeight_ + " newfat " + newFatInMG + endl);
    }
}
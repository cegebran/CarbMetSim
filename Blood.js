
var ONEDAY = 24*60;
var MAXAGE = 120;
var HUNDREDDAYS = 100;

class Blood {
    constructor(myBody){
        this.AgeBins = [];
        this.bin0;

        this.body = myBody;

        this.bin0 = 1;
        this.rbcBirthRate_ = 144.0*60*24 // in millions per day (144 million RBCs take birth every minute)
        this.glycationProbSlope_ = 0.085/10000.0;
        this.glycationProbConst_ = 0;

        // all contents are in units of milligrams of glucose
        this.glucose = 5000.0; //5000.0; //15000.0;
        this.fluidVolume_ = 50.0; // in deciliters

        this.gngSubstrates = 0;
        this.alanine = 0;
        this.branchedAminoAcids = 0;
        this.unbranchedAminoAcids = 0;
        this.glutamine = 0;
        this.insulinLevel = 0;

        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559;
        this.glycolysisMax_ = 5 * glycolysisMin_;

        this.glycolysisToLactate_ = 0.2;

        this.normalGlucoseLevel_ = 100; //mg/dl
        this.highGlucoseLevel_ = 200; //mg/dl
        this.minGlucoseLevel_ = 40; //mg/dl
        this.highLactateLevel_ = 4053.51; //mg
        // 9mmol/l of lactate = 4.5 mmol/l of glucose = 4.5 * 180.1559 * 5 mg of glucose = 4053.51 mg of glucose
        this.lactate = 0; // 450.39 //mg
        // 1 mmol/l of lactate = 0.5mmol/l of glucose = 0.5*180.1559*5 mg of glucose = 450.39 mg of glucose

        // initial number of RBCs
        for(i = 0; i <= MAXAGE; i++){
            var e = new Object();
            e.RBCs = 0.94 * rbcBirthRate_;
            e.glycatedRBCs = 0.06 * rbcBirthRate_;
            AgeBins.push(e);
        }

        this.avgBGLOneDay = 0;
        this.avgBGLOneDaySum = 0;
        this.avgBGLOneDayCount = 0;
    }

    getBGL(){
        var returnValue = glucose / fluidVolume_;
        return returnValue;
    }

    getGNGSubstrates(){
        var returnValue = gngSubstrates + lactate + alanine + glutamine;
        return returnValue;
    }

    updateRBCs(){
        bin0--;

        if(bin0 < 0){
            bin0 = MAXAGE;
        }

        var k = new Object();
        k.RBCs = rbcBirthRate_;
        k.glycatedRBCs = 0;

        AgeBins.splice(bin0, 0, k);

        var start_bin = bin0 + HUNDREDDAYS;

        if(start_btn > MAXAGE){
            start_bin -= (MAXAGE + 1);
        }

        for(i = 0; i <= (MAXAGE-HUNDREDDAYS); i++){
            var j = start_bin + i;

            if(j < 0){
                SimCtl.timeStamp();
                Console.log("RBC bin value negative" + j)
                process.exit();
            }

            if(j > MAXAGE){
                j -= (MAXAGE + 1);
            }

            var kill_rate = (1.0) * (i / (MAXAGE - HUNDREDDAYS));

            var orginalRBCs = AgeBins[j].RBCs;
            var orginalGlycatedRBCs = AgeBins[j].glycatedRBCs;

            var p = new Object();
            p.RBCs = (1.0) * (orginalRBCs * (1.0 - kill_rate));
            p.glycatedRBCs = (1.0) * (orginalGlycatedRBCs * (1.0 - kill_rate));
            AgeBins.splice(j, 0, p);
        }

        var glycation_prob = avgBGLOneDay * glycationProbSlope_ + glycationProbConst_;

        for(i = 0; i <= MAXAGE; i++){
            var AgeBins_i_element_RBCs = AgeBins[i].RBCs;
            var AgeBins_i_element_glycatedRBCs = AgeBins[i].glycatedRBCs;
            var newly_glycated = glycation_prob * AgeBins_i_element;

            var q = new Object();
            q.RBCs = AgeBins_i_element_RBCs - newly_glycated;
            q.glycatedRBCs = AgeBins_i_element_glycatedRBCs

            AgeBins.splite(i, 0, q);
        }

        SimCtl.time_stamp();
        Console.log("New HbAlc: " + currentHbAlc());
    }

    currentHbAlc(){
        var rbcs = 0;
        var glycated_rbcs = 0;

        for(i = 0; i <= MAXAGE; i++){
            var AgeBins_RBCs = AgeBins[i].RBCs;
            var AgeBins_glycatedRBCs = AgeBins[i].glycatedRBCs;

            rbcs += AgeBins_RBCs;
            rbcs += AgeBins_glycatedRBCs;
            glycated_rbcs += AgeBins_glycatedRBCs;
        }

        if(rbcs == 0){
            Consle.log("Error in Bloody::currentHbAlc");
            process.exit();
        }

        return (glycated_rbcs / rbcs);
    }

    processTick(){
        var x;

        var scale = (1.0) * ((1.0 - body.insulinResistance_) * (1000.0 * glycolysisMin_));

        // revisit these lines
        x = (1.0) * (glycolysisMin__(SimCtl.myEngine()));
        x = x * ((body.bodyWeight_)/1000.0);

        if(x > (glycolysisMax_*(body.bodyWeight_))){
            x = glycolysisMax_ * (body.bodyWeight_);
        }

        var toGlycolysis = (1.0) * (x + scale * ((glycolysisMax_*(body.bodyWeight_)) - x ));

        if(toGlycolysis > glucose){
            toGlycolysis = glucose;
        }

        glucose -= toGlycolysis;
        body.blood.lactate += glycolysisToLactate_*toGlycolysis;

        var bgl = (1.0) * (glucose/fluidVolume_);

        // update insulin level

        if(bgl >= highGlucoseLevel_){
            insulinLevel = body.insulinPeakLevel_;
        }else{
            if(bgl < normalGlucoseLevel_){
                insulinLevel = 0;
            }else{
                insulinLevel = (body.insulinPeakLevel_)*(bgl - normalGlucoseLevel_)/(highGlucoseLevel_ - normalGlucoseLevel_);
            }
        }

        // calculating average bgl during a day
        if( avgBGLOneDayCount == ONEDAY){
            avgBGLOneDay = avgBGLOneDaySum / avgBGLOneDayCount;
            avgBGLOneDaySum = 0;
            avgBGLOneDayCount = 0;
            updateRBCs();
            SimCtl.time_stamp();
            Console.log(" Blood::avgBGL " + avgBGLOneDay);
        }

        avgBGLOneDaySum += bgl;
        avgBGLOneDayCount++;
    }

    consumeGNGSubstrates(howmuch){
        var total = (1.0) * (gngSubstrates + lactate + alanine + glutamine);

        if(total < howmuch){
            gngSubstrates = 0;
            lactate = 0;
            alanine = 0;
            glutamine = 0;
            return total;
        }

        var factor = (1.0) * ( (total-howmuch)/total );
        gngSubstrates = gngSubstrates * factor;
        lactate = lactate * factor;
        alanine = alanine * factor;
        glutamine = glutamine * factor;

        return howmuch;
    }

    setParams(){
        // need to implement this method
    }

    removeGlucose(howmuch){
        glucose -= howmuch;

        if( getBGL() <= minGlucoseLevel_){
            SimCtl.time_stamp();
            Console.log(" bgl dips to: " + getBGL());
            process.exit();
        }
    }

    addGlucose(howmuch){
        glucose += howmuch;
    }

    gngFromHighLactate(rate_){
        var x = (1.0) * (rate_ * (lactate/highLactateLevel_));

        if(x > lactate){
            x = lactate
        }

        lactate -= x;
        return x;
    }

    glycolysisMin__ (glycolysisMinParam){
        var returnValue = 1000.0 * glycolysisMinParam;
        return returnValue;
    }
}
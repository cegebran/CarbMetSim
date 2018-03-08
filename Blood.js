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
        this.glycolysisMax_ = 5 * this.glycolysisMin_;

        this.glycolysisToLactate_ = 0.2;

        this.normalGlucoseLevel_ = 100; //mg/dl
        this.highGlucoseLevel_ = 200; //mg/dl
        this.minGlucoseLevel_ = 40; //mg/dl
        this.highLactateLevel_ = 4053.51; //mg
        // 9mmol/l of lactate = 4.5 mmol/l of glucose = 4.5 * 180.1559 * 5 mg of glucose = 4053.51 mg of glucose
        this.lactate = 0; // 450.39 //mg
        // 1 mmol/l of lactate = 0.5mmol/l of glucose = 0.5*180.1559*5 mg of glucose = 450.39 mg of glucose

        // initial number of RBCs
        for(var i = 0; i <= MAXAGE; i++){
            var e = new Object();
            e.RBCs = 0.94 * this.rbcBirthRate_;
            e.glycatedRBCs = 0.06 * this.rbcBirthRate_;
            this.AgeBins.push(e);
        }

        this.avgBGLOneDay = 0;
        this.avgBGLOneDaySum = 0;
        this.avgBGLOneDayCount = 0;
    }

    getBGL(){
        var returnValue = this.glucose / this.fluidVolume_;
        return returnValue;
    }

    getGNGSubstrates(){
        var returnValue = this.gngSubstrates + this.lactate + this.alanine + this.glutamine;
        return returnValue;
    }

    updateRBCs(){
        this.bin0--;

        if(this.bin0 < 0){
            this.bin0 = MAXAGE;
        }

        var k = new Object();
        k.RBCs = this.rbcBirthRate_;
        k.glycatedRBCs = 0;

        this.AgeBins.splice(this.bin0, 0, k);

        var start_bin = this.bin0 + HUNDREDDAYS;

        if(start_bin > MAXAGE){
            start_bin -= (MAXAGE + 1);
        }

        for(var i = 0; i <= (MAXAGE-HUNDREDDAYS); i++){
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

            var orginalRBCs = this.AgeBins[j].RBCs;
            var orginalGlycatedRBCs = this.AgeBins[j].glycatedRBCs;

            var p = new Object();
            p.RBCs = (1.0) * (orginalRBCs * (1.0 - kill_rate));
            p.glycatedRBCs = (1.0) * (this.orginalGlycatedRBCs * (1.0 - this.kill_rate));
            this.AgeBins.splice(j, 0, p);
        }

        var glycation_prob = this.avgBGLOneDay * this.glycationProbSlope_ + this.glycationProbConst_;

        for(i = 0; i <= MAXAGE; i++){
            var AgeBins_i_element_RBCs = this.AgeBins[i].RBCs;
            var AgeBins_i_element_glycatedRBCs = this.AgeBins[i].glycatedRBCs;
            var newly_glycated = this.glycation_prob * AgeBins_i_element_RBCs;

            var q = new Object();
            q.RBCs = AgeBins_i_element_RBCs - newly_glycated;
            q.glycatedRBCs = AgeBins_i_element_glycatedRBCs

            this.AgeBins.splice(i, 0, q);
        }

        // print to the screen
        return "New HbAlc: " + this.currentHbAlc();
    }

    currentHbAlc(){
        var rbcs = 0;
        var glycated_rbcs = 0;

        for(var i = 0; i <= MAXAGE; i++){
            var AgeBins_RBCs = this.AgeBins[i].RBCs;
            var AgeBins_glycatedRBCs = this.AgeBins[i].glycatedRBCs;

            rbcs += AgeBins_RBCs;
            rbcs += AgeBins_glycatedRBCs;
            glycated_rbcs += AgeBins_glycatedRBCs;
        }

        if(rbcs == 0){
            //Error in Bloody::currentHbAlc
            // terminate program (return may not accomplish this)
            return;
        }

        return (glycated_rbcs / rbcs);
    }

    processTick(){
        var x;

        var scale = (1.0) * ((1.0 - body.insulinResistance_) * (1000.0 * this.glycolysisMin_));

        // revisit these lines
        //x = (1.0) * (this.glycolysisMin__(SimCtl.myEngine()));
        x = 1; // placeholder to test other parts

        x = x * ((body.bodyWeight_)/1000.0);

        if(x > (this.glycolysisMax_*(body.bodyWeight_))){
            x = this.glycolysisMax_ * (body.bodyWeight_);
        }

        var toGlycolysis = (1.0) * (x + scale * ((this.glycolysisMax_*(body.bodyWeight_)) - x ));

        if(toGlycolysis > this.glucose){
            toGlycolysis = this.glucose;
        }

        this.glucose -= toGlycolysis;
        //body.blood.lactate += this.glycolysisToLactate_*toGlycolysis;

        var bgl = (1.0) * (this.glucose/this.fluidVolume_);

        // update insulin level

        if(bgl >= this.highGlucoseLevel_){
            this.insulinLevel = body.insulinPeakLevel_;
        }else{
            if(bgl < this.normalGlucoseLevel_){
                this.insulinLevel = 0;
            }else{
                this.insulinLevel = (body.insulinPeakLevel_)*(bgl - this.normalGlucoseLevel_)/(this.highGlucoseLevel_ - this.normalGlucoseLevel_);
            }
        }

        // calculating average bgl during a day
        if( this.avgBGLOneDayCount == ONEDAY){
            this.avgBGLOneDay = this.avgBGLOneDaySum / this.avgBGLOneDayCount;
            this.avgBGLOneDaySum = 0;
            this.avgBGLOneDayCount = 0;
            this.updateRBCs();
            //SimCtl.time_stamp();

            // need to print this to the screen
            //Console.log(" Blood::avgBGL " + this.avgBGLOneDay);
        }

        this.avgBGLOneDaySum += bgl;
        this.avgBGLOneDayCount++;
    }

    consumeGNGSubstrates(howmuch){
        var total = (1.0) * (this.gngSubstrates + this.lactate + this.alanine + this.glutamine);

        if(total < howmuch){
            this.gngSubstrates = 0;
            this.lactate = 0;
            this.alanine = 0;
            this.glutamine = 0;
            return total;
        }

        var factor = (1.0) * ( (total-howmuch)/total );
        this.gngSubstrates = this.gngSubstrates * factor;
        this.lactate = this.lactate * factor;
        this.alanine = this.alanine * factor;
        this.glutamine = this.glutamine * factor;

        return howmuch;
    }

    setParams(){
        // need to implement this method
    }

    removeGlucose(howmuch){
        this.glucose -= howmuch;

        if( this.getBGL() <= this.minGlucoseLevel_){
            //SimCtl.time_stamp();

            // print to the screen
            //Console.log(" bgl dips to: " + this.getBGL());
            
            // exit
            return;
        }
    }

    addGlucose(howmuch){
        this.glucose += howmuch;
    }

    gngFromHighLactate(rate_){
        var x = (1.0) * (rate_ * (this.lactate/this.highLactateLevel_));

        if(x > this.lactate){
            x = this.lactate
        }

        this.lactate -= x;
        return x;
    }

    glycolysisMin__ (glycolysisMinParam){
        var returnValue = 1000.0 * glycolysisMinParam;
        return returnValue;
    }
}

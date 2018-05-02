var firebase = require('firebase');
var async = require('async');

// Constants
const TICKS_PER_DAY = 24 * 60;
const TICKS_PER_HOUR = 60;

// Priority Queue Start
class QElement {
    constructor(firetime, activityID, subID, howmuch){
        this.firetime = firetime;
        this.ID = activityID;
        this.subID = subID;
        this.howmuch = howmuch;
    }

    costs_less(oqe){
        if(this.firetime < oqe.firetime){
            return true;
        }else if(this.firetime > oqe.firetime){
            return false;
        }else if(this.firetime === oqe.firetime){
            return "tie";
        }else{
            return false;
        }
    }
}

class PriorityQueue {
    // An array is used to implement priority
    constructor(){
        this.items = [];
    }
 
    // enqueue function to add element
    // to the queue as per priority
    enqueue(element){
        // creating object from queue element
        //var qElement = new QElement();
        var contain = false;

        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for(var i = 0; i < this.items.length; i++){
            /*if(this.items[i].costs_less(element) === "tie"){
                this.items.splice(i+1,0, element);
            }*/
            if(this.items[i].costs_less(element) === false){
                this.items.splice(i,0, element);
                contain = true;
                break;
            }
        }

        // if the element have the highest priority
        // it is added at the end of the queue
        if(!contain){
            this.items.push(element);
        }
    }
    
    // dequeue method to remove
    // element from the queue
    dequeue(){
        // return the dequeued element
        // and remove it.
        // if the queue is empty
        // returns Underflow
        if(this.isEmpty()){
            return "Underflow";
        }
        return this.items.shift();
    }
    
    // front function
    front(){
        // returns the highest priority element
        // in the Priority queue without removing it.
        if(this.isEmpty()){
            return "No elements in Queue";
        }
        return this.items[0];
        //return this.items[0].ID + ", " + this.items[0].firetime;
    }
    
    // rear function
    rear(){
        // returns the lowest priorty
        // element of the queue
        if(this.isEmpty()){
            return "No elements in Queue";
        }
        return this.items[this.items.length - 1];
        //return this.items[this.items.length - 1].ID + ", " + this.items[this.items.length - 1].firetime;
    }
    
    // isEmpty function
    isEmpty(){
        // return true if the queue is empty.
        return this.items.length == 0;
    }
 
    // printQueue function
    // prints all the element of the queue
    printPQueue(){
        var str = "";
        for(var i = 0; i < this.items.length; i++){
            str += this.items[i].ID + ", " + this.items[i].firetime + " || ";
        }
        return str;
    }
}
// Priority Queue End


// Blood Start
class RBCBin {
    constructor(){
        var RBCs = 0;
        var glycatedRBCs = 0;
    }
}

class Blood {	////////////////////================================================================================
    //private RBCBin[] AgeBins = new RBCBin[MAXAGE+1];// Aging Bins
    /////////////////////==========================================================================
    currentHbA1c() {
        var rbcs = 0;
        var glycated_rbcs = 0;
    
        for(var i = 0; i <= Blood.MAXAGE; i++){
            rbcs += AgeBins[i].RBCs;
            glycated_rbcs += AgeBins[i].glycatedRBCs;
        }
    
        if(rbcs == 0){
            console.log("Error in Bloody::currentHbA1c");
            System.exit(1);
        }
        return glycated_rbcs/rbcs;
    }
    ///////////////////////////////////=========================================================
    updateRBCs(){
        // will be called once a day
        this.bin0--;
        if( this.bin0 < 0 ) this.bin0 = Blood.MAXAGE;
        //New RBCs take birth
        AgeBins[bin0].RBCs = this.rbcBirthRate_;
        AgeBins[bin0].glycatedRBCs = 0;
    
        //console.log("New RBCs: " + AgeBins[bin0].RBCs);
        // Old (100 to 120 days old) RBCs die
        var start_bin = this.bin0 + Blood.HUNDREDDAYS;
        if(start_bin > Blood.MAXAGE) start_bin -= (Blood.MAXAGE + 1);
        //System.out.println("Old RBCs Die");
        for(var i = 0; i < (Blood.MAXAGE-Blood.HUNDREDDAYS); i++){
            var j = start_bin = i;
            if(j < 0){
                this.body.time_stamp();
                console.log(" RBC bin value negative " + j);
                break;
                //System.exit(-1);
            }
            if(j > Blood.MAXAGE) j -= (Blood.MAXAGE + 1);
            var kill_rate = (i)/(Blood.MAXAGE-Blood.HUNDREDDAYS);
            AgeBins[j].RBCs *= (1.0 - kill_rate);
            AgeBins[j].glycatedRBCs *= (1.0 - kill_rate);
            //console.log("bin: " + (start_bin + i) + ", RBCs " + AgeBins[start_bin + i].RBCs + ", Glycated RBCs " + AgeBins[start_bin + i].glycatedRBCs);
        }
    
        //glycate the RBCs
        var glycation_prob = this.avgBGLOneDay * this.glycationProbSlope_ + this.glycationProbConst_;
        //System.out.println("RBCs glycate");
        for(var i = 0; i <= Blood.MAXAGE; i++){
            var newly_glycated = glycation_prob * this.AgeBins[i].RBCs;
            AgeBins[i].RBCs -= newly_glycated;
            AgeBins[i].glycatedRBCs += newly_glycated;
            //System.out.println("bin: " + i + ", RBCs " + AgeBins[i].RBCs + ", Glycated RBCs " + AgeBins[i].glycatedRBCs);
        }
        this.body.time_stamp();
        console.log("New HbA1c: " + this.currentHbA1c());
    }


    // Constructor
    constructor(myBody){
        this.body = myBody;
        //var num = 120;
        //this.AgeBins = Array.apply(null, Array(num)).map(function () { return new RBCBin(); });
        this.bin0 = 1;
        this.rbcBirthRate_ = 144.0*60*24; // in millions per minute
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
        this.insulin = 0;
    
    
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559;
        this.glycolysisMax_ = 5*this.glycolysisMin_;
    
        this.glycolysisToLactate_ = 1;
    
        this.normalGlucoseLevel_ = 100; //mg/dl
        this.highGlucoseLevel_ = 200; //mg/dl
        this.minGlucoseLevel_ = 40; //mg/dl
        this.highLactateLevel_ = 4053.51; // mg
        // 9 mmol/l of lactate = 4.5 mmol/l of glucose = 4.5*180.1559*5 mg of glucose = 4053.51mg of glucose
        this.lactate = 0; //450.39; //mg
        // 1mmol/l of lactate = 0.5mmol/l of glucose = 0.5*180.1559*5 mg of glucose = 450.39 mg of glucose

        // initial number of RBCs
        for(var i = 0; i <= Blood.MAXAGE; i++){
            this.AgeBins[i] = new RBCBin();
            this.AgeBins[i].RBCs = 0.94*this.rbcBirthRate_;
            this.AgeBins[i].glycatedRBCs = 0.06*this.rbcBirthRate_;
        }
        this.avgBGLOneDay = 0;
        this.avgBGLOneDaySum = 0;
        this.avgBGLOneDayCount = 0;
    
        this.glycolysisPerTick;
    }

    processTick(){
        var x; 
    
        var glycolysisMin__ = poissonProcess.sample(1000.0 * this.glycolysisMin_);
    
    
        var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
    
        x = poissonProcess.sample((100.0*this.glycolysisMin_)/100);
        x = x*(this.body.bodyWeight_)/100.0;
    
        if(x > this.glycolysisMax_*(this.body.bodyWeight_)){
            x = this.glycolysisMax_*(this.body.bodyWeight_);
        }
    
        var toGlycolysis = x + scale * ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
    
        if(toGlycolysis > this.glucose) toGlycolysis = this.glucose;
    
        this.glucose -= toGlycolysis;
        this.glycolysisPerTick = toGlycolysis;
        this.body.blood.lactate += glycolysisToLactate_ * toGlycolysis;
        //System.out.println("Glycolysis in blood, blood glucose " + glucose + " mg, lactate " + lactate + " mg")
    
        var bgl = this.glucose/this.fluidVolume_;
    
        if(bgl >= this.highGlucoseLevel_){
            this.insulin = this.body.insulinPeakLevel_;
        }else{
            if(bgl < this.normalGlucoseLevel_){
                this.insulin = 0;
            }else{
                this.insulin = (this.body.insulinPeakLevel_)*(bgl - this.normalGlucoseLevel_)/(this.highGlucoseLevel_ - this.normalGlucoseLevel_);
            }
        }
    
        //calculating average bgl during a day
    
        if(this.avgBGLOneDayCount == Blood.ONEDAY){
            this.avgBGLOneDay = this.avgBGLOneDaySum/this.avgBGLOneDayCount;
            this.avgBGLOneDaySum = 0;
            this.avgBGLOneDayCount = 0;
            this.updateRBCs();
            body.time_stamp();
            console.log(" Blood::avgBGL " + this.avgBGLOneDay);
        }
    
        this.avgBGLOneDaySum += bgl;
        this.avgBGLOneDayCount++;
    
        body.time_stamp();
        console.log("Blood:: glycolysis " + this.glycolysisPertick);
    
        body.time_stamp();
        console.log("Blood:: insulinLevel " + this.insulin);
    
        //BUKET NEW: For the calculation of Incremental AUC
        //if(glcs > 100 && SimCtl::ticks < 120){
        //  SimCtl::AUC = SimCtl::AUC + (glcs-100);
        //}
    }

    setParams(){
        for(var [key, value] of this.body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BLOOD.value).entries()){
            switch(key){
                case "rbcBirthRate_" : { this.rbcBirthRate_ = value; break; }
                case "glycationProbSlope_" : { this.glycationProbSlope_ = value; break; }
                case "glycationProbConst_" : { this.glycationProbConst_ = value; break; }
                case "minGlucoseLevel_" : { this.minGlucoseLevel_ = value; break; }
                case "normalGlucoseLevel_" : { this.normalGlucoseLevel_ = value; break; }
                case "highGlucoseLevel_" : { this.highGlucoseLevel_ = value; break; }
                case "highLactateLevel_" : { this.highLactateLevel_ = value; break; }
                case "glycolysisMin_" : { this.glycolysisMin_ = value; break; }
                case "glycolysisMax_" : { this.glycolysisMax_ = value; break; }
            }
        }
    }

    getBGL() { return this.glucose/this.fluidVolume_; }

    removeGlucose(howmuch){
        this.glucose -= howmuch;
        //System.out.println("Glucose consumed " + howmuch + " ,glucose left " + glucose);
        if(this.getBGL() <= this.minGlucoseLevel_){
            body.time_stamp();
            console.log(" bgl dips to: " + this.getBGL());
            System.exit(-1);
        }
    }

    addGlucose(howmuch){
        this.glucose += howmuch;
        //SimCtl.time_stamp();
        //System.out.println(" BGL: " + getBGL());
    }

    getGNGSubstrates(){ 
        return (this.gngSubstrates + this.lactate + this.alanine + this.glutamine);
    }

    consumeGNGSubstrates(howmuch){
        var total = this.gngSubstrates + this.lactate + this.alanine + this.glutamine;
        if(total < howmuch){
            this.gngSubstrates = 0;
            this.lactate = 0;
            this.alanine = 0;
            this.glutamine = 0;
            return total;
        }
        var factor = (total - howmuch)/total;
        this.gngSubstrates *= factor;
        this.lactate *= factor;
        this.alanine *= factor;
        this.glutamine *= factor;
        return howmuch;
    }

    gngFromHighLactate(rate_){
        // Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate
        // concentration. High lactate concentration (e.g. due to high glycolytic activity) would 
        // cause gluconeogenesis to happen even if insulin concentration is high. But then 
        // Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
    
        // rate_ is in units of mg per kg per minute
        var x = 3*rate_ * this.lactate/this.highLactateLevel_;
    
        if( x > this.lactate ) x = this.lactate;
    
        this.lactate -= x;
        return x;
    }
}

Blood.ONEDAY = 24*60;
Blood.MAXAGE = 120*24*60;
Blood.HUNDREDDAYS = 100;
// Blood End


// Brain Start
class Brain{
    constructor(myBody){
        this.glucoseOxidized_ = 1.08;
        this.glucoseToAlanine_ = 0;
        this.bAAToGlutamine_ = 0;
        this.body = myBody;
        this.oxidationPerTick;
    }

    processTick(){
        var glucoseOxidized__ = poissonProcess.sample(1000.0 * this.glucoseOxidized_);
        
        var g = (glucoseOxidized__)/1000;
        this.oxidationPerTick = g;
        this.body.blood.removeGlucose(g + this.glucoseToAlanine_);
        this.body.blood.alanine += this.glucoseToAlanine_;

        //Brain generate glutamine from branched amino acids.
        if(this.body.blood.branchedAminoAcids > this.bAAToGlutamine_){
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += this.bAAToGlutamine_;
        }else{
            this.body.blood.glutamine += 
            this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
        
        this.body.time_stamp();
        console.log("Brain Oxidation" + this.bAAToGlutamine_ );
    }

    setParams(){
        for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.BRAIN.value).entries()){
            switch(key){
                case "glucoseOxidized_" : {this.glucoseOxidized_ = value; break;}
                case "glucoseToAlanine_" : {this.glucoseToAlanine_ = value; break;}
                case "bAAToGlutamine_" : {this.bAAToGlutamine_ = value; break;}
            }
        }
    }
}
// Brain End


// Heart Start
class Heart {
    constructor(mybody){
    	this.body = mybody;
        this.lactateOxidized_ = 0;
        this.basalGlucoseAbsorbed_ = 14; //mg per minute
        //Skeletal Muscle Glycolysis, Oxidation, and Storage of an Oral Glucose Load- Kelley et.al.
        
        this.Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
        this.Glut4VMAX_ = 0; //mg per kg per minute
        this.oxidationPerTick;
    }
    
    processTick(){
        var basalAbsorption = poissonProcess.sample(this.basalGlucoseAbsorbed_);
        this.body.blood.removeGlucose(basalAbsorption);
        
        //var lactateOxidized__ = poissonProcess(1000 * this.lactateOxidized_);
        
        this.body.blood.removeGlucose(basalAbsorption);
        
        this.oxidationPerTick = basalAbsorption;
        
        //Absorption via GLUT4
        
        var bgl = this.body.blood.getBGL();
        var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin)*(this.body.bodyWeight_);
        var g = scale*this.Glut4VMAX_*bgl/(bgl + this.Glut4Km_);
        
        this.body.blood.removeGlucose(g);
        
        this.oxidationPerTick += g;
        
        this.body.time_stamp();

        /*
        if( this.body.blood.lactate >= this.lactateOxidized_ ) {
            this.body.blood.lactate -= this.lactateOxidized_;
        } else {
            this.body.blood.lactate = 0;
        }
        */
        console.log("Heart:: Oxidation " + this.oxidationPerTick);
        
    }
    setParams(){
    for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.ADIPOSE_TISSUE.value).entries()){
            switch(key){
    			case "lactateOxidized_" : { this.lactateOxidized_ = value; break; }
    			case "basalGlucoseAbsorbed_" : { this.basalGlucoseAbsorbed_ = value; break; }
    			case "Glut4Km_" : { this.Glut4Km_ = value; break; }
    			case "Glut4VMAX_" : { this.Glut4VMAX_ = value; break; }
    		}
    	}
    }
}
// Heart End


// Intestine Start
class Chyme{
    constructor(){
        this.origRAG = "";
        this.origSAG = "";
        this.RAG = "";
        this.SAG = "";
        this.ts = 0;
    }
}

class Intestine{
    constructor(MyBody){
        this.body = MyBody;

        this.RAG_Mean_ = 5;
        this.RAG_StdDev_ = 5;
        this.SAG_Mean_ = 60;
        this.SAG_StdDev_ = 20;
        
        this.protein = 0; // mg
        this.glucoseInLumen = 0; // in milligrams
        this.glucoseInEnterocytes = 0; // in milligrams
        
        // Carb digestion parameters
        // support only normal distribution for RAG/SAG digestion so far.
        this.fluidVolumeInEnterocytes_ = 3; //dl
        this.fluidVolumeInLumen_ = 4; //dl
        
        //Michaelis Menten parameters for glucose transport
        this.Glut2Km_In_ = 100*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut2VMAX_In_ = 700; //mg
        this.Glut2Km_Out_ = 100*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut2VMAX_Out_ = 700; //mg
        //active transport rate
        this.sglt1Rate_ = 30; //mg per minute
        
        this.peakGlucoseConcentrationInLumen = 200*180.1559/10.0; // mg/dl equivalent of 200mmol/l
        
        this.aminoAcidsAbsorptionRate_ = 1; //mg per minute
        this.glutamineOxidationRate_ = 1; // mg per minute
        this.glutamineToAlanineFraction_ = 0.5;
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559;
        this.glycolysisMax_ = 5*this.glycolysisMin_;
        
        this.glycolysisPerTick = 0;
        this.toPortalVeinPerTick = 0;
        this.chyme = Array.apply(null, Array(40)).map(function () { return new Chyme(); });

    }

    addChyme(rag, sag, proteinInChyme, fat){
    	var c = new Chyme();
    	c.RAG = rag;
    	c.SAG = sag;
    	c.origRAG = rag;
    	c.origSAG = sag;
    	c.ts = body.ticks;
    	this.chyme.push(c);

    	this.protein += proteinInChyme;

        // very simple processing of fat for now
        this.body.adiposeTissue.addFat(fat);
    }
    
    erf(x){
        // erf(x) = 2/sqrt(pi) * integrate(from=0, to=x, e^-(t^2) ) dt
        // with using Taylor expansion, 
        //        = 2/sqrt(pi) * sigma(n=0 to +inf, ((-1)^n * x^(2n+1))/(n! * (2n+1)))
        // calculationg n=0 to 50 bellow (note that inside sigma equals x when n = 0, and 50 may be enough)
        var m = 1.00;
        var s = 1.00;
        var sum = x * 1.0;
        for(var i = 1; i < 50; i++){
            m *= i;
            s *= -1;
            sum += (s * Math.pow(x, 2.0 * i + 1.0)) / (m * (2.0 * i + 1.0));
        }  
        return 2 * sum / Math.sqrt(3.14159265358979);
    }

    processTick(){
        for(var i = 0; i < this.chyme.length; i++){
            var RAGConsumed = 0;
            var t = this.body.ticks - this.chyme[i].ts;
            
            if(t === 0){
                RAGConsumed = this.chyme[i].origRAG * 0.5 * (1 + this.erf((t = this.RAG_Mean_) / (this.RAG_StdDev_ * Math.sqrt(2))));
            }else{
                RAGConsumed = this.chyme[i].origRAG * 0.5 * (this.erf((t - this.RAG_Mean_) / (this.RAG_StdDev_ * Math.sqrt(2))) - this.erf((t - 1 - this.RAG_Mean_) / (this.RAG_StfDev * Math.sqrt(2))));
            }
            
            if(this.chyme[i].RAG < RAGConsumed){
                RAGConsumed = this.chyme[i].RAG;
            }
            
            if(this.chyme[i].RAG < 0.01 * (this.chyme[i].origRAG)){
                RAGConsumed = this.chyme[i].RAG;
            }
                
                
            this.chyme[i].RAG -= RAGConsumed;
            this.glucoseInLumen += RAGConsumed;
                
            var SAGConsumed = 0;
                
            if(t === 0){
                SAGConsumed = this.chyme[i].origSAG * 0.5 * (1 + this.erf((t - this.SAG_Mean_) / (this.SAG_StdDev_ * Math.sqrt(2))));
            }else{
                SAGConsumed = this.chyme[i].origSAG * 0.5 * (this.erf((t - this.SAG_Mean_) / (this.SAG_StdDev_ * Math.sqrt(2))) - this.erf((t - 1 - this.SAG_Mean_) / (this.SAG_StdDev_ * Math.sqrt(2))));
            }

            if(this.chyme[i].SAG < SAGConsumed){
                SAGConsumed = this.chyme[i].SAG;
            }
            
            if(this.chyme[i].SAG < 0.01 * this.chyme[i].origSAG){
                SAGConsumed = this.chyme[i].SAG;
            }
            
            this.chyme[i].SAG -= SAGConsumed;
            this.glucoseInLumen += SAGConsumed;
            
            this.body.time_stamp();
            console.log("Chyme:: RAG " + this.chyme[i].RAG + "SAG " + this.chyme[i].SAG + " origRAG " + this.chyme[i].origRAG + " origSAG " + this.chyme[i].origSAG + " glucoseInLumen " + this.glucoseInLumen + " RAGConsumed " + this.RAGConsumed + " SAGConsumed " + this.SAGConsumed);
            
            if(this.chyme[i].RAG === 0 && this.chyme[i].SAG === 0){
                this.chyme.pop[i];
            }
        }
        
        this.absorbGlucose();
        this.absorbAminoAcids();
        
        this.body.time_stamp();
        console.log("Intestine:: Glycolysis " + this.glycolysisPerTick);
        this.body.time_stamp();
        console.log("Intestine:: ToPortalVein " + this.toPortalVeinPerTick);
    }

    absorbGlucose(){
        var x; // to hold the random samples
        var activeAbsorption = 0;
        var passiveAbsorption = 0;
        
        var glLumen = 0;
        var glEnterocytes = 0;
        var glPortalVein = 0;
        
        //static std::poisson_distribution<int> basalAbsorption__ (1000.0*this.sglt1Rate_);
        //static std::poisson_distribution<int> Glut2VMAX_In__ (1000.0*Glut2VMAX_In_);
        //static std::poisson_distribution<int> this.Glut2VMAX_Out__ (1000.0*Glut2VMAX_Out_);
        //static std::poisson_distribution<int> this.glycolysisMin__ (1000.0*this.glycolysisMin_); 
        // first, absorb some glucose from intestinal lumen
        
        if(this.glucoseInLumen > 0){
            if (this.fluidVolumeInLumen_ <= 0){
                console.log("Intestine::absorb Glucose");
                //cout << "Intestine.absorbGlucose" << endl;
                exit(-1);
            }
        
            // Active transport first
            activeAbsorption = (1.0)*(poissonProcess.sample(1000.0 * this.sglt1Rate_))/1000.0;
            
            if(activeAbsorption >= this.glucoseInLumen){
                activeAbsorption = this.glucoseInLumen;
                this.glucoseInEnterocytes += activeAbsorption;
    	        this.glucoseInLumen = 0;
            }else{
                this.glucoseInEnterocytes += activeAbsorption;
    	        this.glucoseInLumen -= activeAbsorption;
        
                //passive transport via GLUT2s now
                glLumen = this.glucoseInLumen/this.fluidVolumeInLumen_;
                glEnterocytes = this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
                var diff = (1.0)*(glLumen - glEnterocytes);
                
                if(diff > 0){
                    // glucose concentration in lumen decides the number of GLUT2s available for transport.
                    // so, Vmax depends on glucose concentration in lumen
                    x = (1.0)*((poissonProcess.sample(1000.0*Glut2VMAX_In_)))/1000.0;
                    var effectiveVmax = (1.0) *(x*glLumen/this.peakGlucoseConcentrationInLumen);
        
                    if (effectiveVmax > this.Glut2VMAX_In_){
                        effectiveVmax = this.Glut2VMAX_In_;
                    }
                    
                    passiveAbsorption = effectiveVmax*diff/(diff + this.Glut2Km_In_);
        
                    if (passiveAbsorption > this.glucoseInLumen){
                        passiveAbsorption = this.glucoseInLumen;
                    }
                    
                    this.glucoseInEnterocytes += passiveAbsorption;
                    this.glucoseInLumen -= passiveAbsorption;
                }
            }
        }
        
        //release some glucose to portal vein via Glut2s
        glEnterocytes = this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
        glPortalVein = this.body.portalVein.getConcentration();
        
        this.toPortalVeinPerTick = 0;
        
        var diff = (1.0)*(glEnterocytes - glPortalVein);
        
        if(diff > 0){
            x = (1.0)*(poissonProcess.sample(1000.0*Glut2VMAX_Out_)/1000.0);
            this.toPortalVeinPerTick = x*diff/(diff + this.Glut2Km_Out_);
            
            if(this.toPortalVeinPerTick > this.glucoseInEnterocytes ){
                this.toPortalVeinPerTick = this.glucoseInEnterocytes;
            }
            
            this.glucoseInEnterocytes -= this.toPortalVeinPerTick;
            body.portalVein.addGlucose(this.toPortalVeinPerTick);
        }
        
        // Modeling the glucose consumption by enterocytes: glycolysis to lactate.
        
        //Glycolysis. Depends on insulin level. Consumed glucose becomes lactate (Ref: Gerich).
        
        var scale = (1.0)*((1.0 - this.body.insulinResistance_)*(this.body.blood.insulin));
        
        x = (1.0)*(poissonProcess.sample(1000.0*this.glycolysisMin_));
        x *= this.body.bodyWeight_/1000.0;
        if(x > this.glycolysisMax_*(this.body.bodyWeight_)){
            x = this.glycolysisMax_*(this.body.bodyWeight_);
        }
        
        this.glycolysisPerTick = x + scale * ((this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if(this.glycolysisPerTick > this.glucoseInEnterocytes){
            this.body.blood.removeGlucose(this.glycolysisPerTick - this.glucoseInEnterocytes);
            this.glucoseInEnterocytes = 0;
        }else{
            this.glucoseInEnterocytes -= this.glycolysisPerTick;
        }
            
        this.body.blood.lactate += this.glycolysisPerTick;
        
        // log all the concentrations (in mmol/l)
        // peak concentrations should be 200mmol/l (lumen), 100mmol/l(enterocytes), 10mmol/l(portal vein)
        
        glLumen = (10.0/180.1559)*this.glucoseInLumen/this.fluidVolumeInLumen_; // in mmol/l
        glEnterocytes = (10.0/180.1559)*this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
        x = this.body.portalVein.getConcentration();
        glPortalVein = (10.0/180.1559)*x;

        this.body.time_stamp();
        console.log("Intestine:: glLumen: " + glLumen + " glEntero " + glEnterocytes + " glPortal " + glPortalVein + ", activeAbsorption " + activeAbsorption + " passiveAbsorption " + passiveAbsorption);
    }

    //The BCAAs, leucine, isoleucine, and valine, represent 3 of the 20 amino acids that are used in the formation of proteins. Thus, on average, the BCAA content of food proteins is about 15% of the total amino acid content."Interrelationship between Physical Activity and Branched-Chain Amino Acids"

    //The average content of glutamine in protein is about %3.9. "The Chemistry of Food" By Jan Velisek
    //Do we consider the dietary glutamine? I did not consider in my code but I can add if we need it.

    //Looks like cooking destroys dietary glutamine. So, no need to consider diet as source of glutamine.
    //-Mukul

    absorbAminoAcids(){
        var absorbedAA = (1.0) * poissonProcess.sample(this.aminoAcidsAbsorptionRate_)/1000.0;

        if(this.protein < absorbedAA){
            absorbedAA = this.protein;
        }
        
        this.body.portalVein.addAminoAcids(absorbedAA);
        this.protein -= absorbedAA;
        
        //Glutamine is oxidized
        var g = (1.0) * poissonProcess.sample(this.glutamineOxidationRate_*1000)/1000;
        if(this.body.blood.glutamine < g){
                this.body.blood.alanine += this.glutamineToAlanineFraction_*(this.body.blood.glutamine);
                this.body.blood.glutamine = 0;
        }else{
            this.body.blood.glutamine -= g;
            this.body.blood.alanine += this.glutamineToAlanineFraction_*g;
        }
    }

    /*setParams()
    {
        for( ParamSet::iterator itr = body.metabolicParameters[body.bodyState][INTESTINE].begin();
            itr != body.metabolicParameters[body.bodyState][INTESTINE].end(); itr++)
        {
            if(itr.first.compare("aminoAcidAbsorptionRate_") == 0)
            {
                this.aminoAcidsAbsorptionRate_ = itr.second;
            }
            if(itr.first.compare("glutamineOxidationRate_") == 0)
            {
                this.glutamineOxidationRate_ = itr.second;
            }
            if(itr.first.compare("glutamineToAlanineFraction_") == 0)
            {
                this.glutamineToAlanineFraction_ = itr.second;
            }
            if(itr.first.compare("Glut2VMAX_In_") == 0)
            {
                this.Glut2VMAX_In_ = itr.second;
            }
            if(itr.first.compare("Glut2Km_In_") == 0)
            {
                this.Glut2Km_In_ = itr.second;
            }
            if(itr.first.compare("Glut2VMAX_Out_") == 0)
            {
                this.Glut2VMAX_Out_ = itr.second;
            }
            if(itr.first.compare("Glut2Km_Out_") == 0)
            {
                this.Glut2Km_Out_ = itr.second;
            }
            if(itr.first.compare("sglt1Rate_") == 0)
            {
                this.sglt1Rate_ = itr.second;
            }
            if(itr.first.compare("fluidVolumeInLumen_") == 0)
            {
                this.fluidVolumeInLumen_ = itr.second;
            }
            if(itr.first.compare("fluidVolumeInEnterocytes_") == 0)
            {
                this.fluidVolumeInEnterocytes_ = itr.second;
            }
            if(itr.first.compare("glycolysisMin_") == 0)
            {
                this.glycolysisMin_ = itr.second;
            }
            if(itr.first.compare("glycolysisMax_") == 0)
            {
                this.glycolysisMax_ = itr.second;
            }
            if(itr.first.compare("RAG_Mean_") == 0)
            {
                    this.RAG_Mean_ = itr.second;
            }
            if(itr.first.compare("RAG_StdDev_") == 0)
            {
                    this.RAG_StdDev_ = itr.second;
            }
            if(itr.first.compare("SAG_Mean_") == 0)
            {
                    this.SAG_Mean_ = itr.second;
            }
            if(itr.first.compare("SAG_StdDev_") == 0)
            {
                    this.SAG_StdDev_ = itr.second;
            }        
        }
    }*/
}
// Intestine End


// Liver Start
class Liver {
    constructor(body_){
    	this.body = body_;
	    this.glycogen = 100000.0; // equivalent of 100g of glucose
	    this.glycogenMax_ = 120000.0; // 120 g of glucose
	    
	    this.glycogenToGlucose_ = 2*0.9007795;
	    this.glucoseToGlycogen_ =this.glycogenToGlucose_; // for now

	    this.glycolysisMin_ = 0.297; //mg per kg per minute
	    this.glycolysisMax_ = 2.972;
	    
	    this.glycolysisToLactateFraction_ = 1; // by default glycolysis just generates all lactate
	    
	    // 2.5 micromol per kg per minute = 2.5*180.1559/1000 mg per kg per minute = 0.45038975 mg per kg per minute
	    this.gluconeogenesisRate_ = 1.8*0.45038975;
	    this.gngFromLactateRate_ = this.gluconeogenesisRate_; //by default
	    
	    this.glucoseToNEFA_ = 0;
	    
	    this.normalGlucoseLevel_ = 100; //mg/dl
	    this.fluidVolume_ = 10; //dl
	    this.glucose = this.normalGlucoseLevel_*this.fluidVolume_;
	    this.Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
	    this.Glut2VMAX_ = 50; //mg per kg per minute

    }
    
    //Call private methods
    processTick(){
    	// every thing is stochastic
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        // Now do the real work
        
        var glInPortalVein = this.body.portalVein.getConcentration();

        var glInLiver = this.glucose/this.fluidVolume_;
        
        if(glInLiver < glInPortalVein){
            var diff = glInPortalVein - glInLiver;
            x =  poissonProcess.sample(x*this.Glut2VMAX_);
            var g = x * diff/(diff + this.Glut2Km_);
            
            if(g > this.body.portalVein.getGlucose()){
                //System.out.println("Trying to absorb more glucose from portal vein than what is present there! " + g + " " + body.portalVein.getGlucose());
                g = this.body.portalVein.getGlucose();
            }
            
            this.body.portalVein.removeGlucose(g);
            this.glucose += g;
            console.log("Liver absorbs from portal vein " + g);
        }
        
        this.body.portalVein.releaseAllGlucose();

        glInLiver = this.glucose/this.fluidVolume_;
        var scale = glInLiver/this.normalGlucoseLevel_;
        console.log("scale"+ glInLiver);
        //scale *= (1.0 - body.insulinResistance_);
        scale *= this.body.blood.insulin;



        x = poissonProcess.sample(x*this.glucoseToGlycogen_);
        var toGlycogen = scale * x;
        if(toGlycogen > this.glucose){
            toGlycogen = this.glucose;
        }
        
        this.glycogen += toGlycogen;
       
        if(this.glycogen > this.glycogenMax_){
            this.body.adiposeTissue.lipogenesis(this.glycogen - this.glycogenMax_);
            this.glycogen = this.glycogenMax_;
        }
       
        this.glucose -= toGlycogen;
        
        //System.out.println("After glycogen synthesis in liver, liver glycogen " + glycogen + " mg, live glucose " + glucose + " mg");
        
        //glycogen breakdown (depends on insulin and glucose level)
        
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        glInLiver = this.glucose/this.fluidVolume_;
        
        if(glInLiver > this.normalGlucoseLevel_){
            scale *= this.normalGlucoseLevel_/glInLiver;
        }
        
        x = poissonProcess.sample(x*this.glycogenToGlucose_);
        var fromGlycogen = scale * x;
        
        if(fromGlycogen > this.glycogen){
            fromGlycogen = this.glycogen;
        }
        
        this.glycogen -= fromGlycogen;
        this.glucose += fromGlycogen;
        
        scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
        
        x =  poissonProcess.sample(x*this.glycolysisMin_);
        if(x > this.glycolysisMax_*(this.body.bodyWeight_)){
            x = this.glycolysisMax_*(this.body.bodyWeight_);
        }

        var toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if(toGlycolysis > this.glucose){
            toGlycolysis = this.glucose;
        }
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis*this.glycolysisToLactateFraction_;
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        x = poissonProcess.sample(x*this.gluconeogenesisRate_);
        var gng = x *scale;
        this.glucose += this.body.blood.consumeGNGSubstrates(gng);
        
        //Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate concentration. High lactate concentration (e.g. due to high glycolytic activity) would cause gluconeogenesis to happen even if insulin concentration is high. But then Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
        x = poissonProcess.sample(x*this.gngFromLactateRate_);
        this.glycogen += this.body.blood.gngFromHighLactate(x);

        //System.out.println("After GNG , liver glucose " + glucose + " mg, liver glycogen " + glycogen + " mg, blood glucose " + body.blood.glucose + " mg, blood lactate " + body.blood.lactate + " mg");
              
        console.log(this.body.portalVein.releaseAminoAcids());
        
        glInLiver = this.glucose/this.fluidVolume_;
        console.log( this.fluidVolume_);
        var bgl = this.body.blood.getBGL();
        
        if(glInLiver > bgl){
            var diff = glInLiver - bgl;
            x = poissonProcess.sample(x*this.Glut2VMAX_);
            var g = x*diff/(diff + this.Glut2Km_);
        
            if(g > this.glucose){
                console.log("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1);
            }
            this.glucose -= g;
            this.body.blood.addGlucose(g);
            this.body.time_stamp();
            console.log("Liver released glucose " + g);
        }
        //SimCtl.time_stamp();
         console.log(" Liver:: " + this.glycogen + " " + this.glucose + " " + this.glucose/this.fluidVolume_);
    }
    
    setParams(){
        for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.LIVER.value).entries()){    		
            switch (key){
    		    case "fluidVolume_" : { this.fluidVolume_ = key; break; }
    			case "normalGlucoseLevel_" : { this.normalGlucoseLevel_ = key; break; }
    			case "Glut2Km_" : { this.Glut2Km_ = key; break; }
    			case "Glut2VMAX_" : { this.Glut2VMAX_ = key; break; }
    			case "glucoseToGlycogen_" : { this.glucoseToGlycogen_ = key; break; }
    			case "glycogenToGlucose_" : { this.glycogenToGlucose_ = key; break; }
    			case "glycolysisMin_" : { this.glycolysisMin_ = key; break; }
    			case "glycolysisMax_" : { this.glycolysisMax_ = key; break; }
    			case "glycolysisToLactateFraction_" : { this.glycolysisToLactateFraction_ = key; break; }
    			case "gluconeogenesisRate_" : { this.gluconeogenesisRate_ = key; break; }
    			case "gngFromLactateRate_" : { this.gngFromLactateRate_ = key; break; }
    			case "glucoseToNEFA_" : { this.glucoseToNEFA_ = key; break; }
    		}
    	}
    }
}

Liver.PortalVein = class {
    	
    constructor(body_){
        this.body = body_;
        this.glucose = 0; //mg
        this.branchedAA = 0;	//mg
        this.unbranchedAA = 0; //mg
        this.fluidVolume_ = 5; // dl
    }
        
    processTick(){
        var bgl = this.body.blood.getBGL();
        var glucoseFromBlood = bgl*this.fluidVolume_;
        this.body.blood.removeGlucose(glucoseFromBlood);
        this.glucose += glucoseFromBlood;
            
        //SimCtl.time_stamp();
    }
        
    setParams(){
        for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.PORTAL_VEIN.value).entrySet()){            
            switch(key){
                case "fluidVolume_" : { this.fluidVolume_ = value; break; }
            }
        }
    }
        
    getConcentration(){
        var gl = this.glucose/this.fluidVolume_;
        //SimCtl.time_stamp();
        //System.out.println("GL in Portal Vein: " + gl);
        return gl;
    }
        
    addGlucose(g) {this.glucose += g;}
        
    getGlucose(){return this.glucose;}
        
    removeGlucose(g){
        this.glucose -= g;
        if(this.glucose < 0){
            console.log("PortalVein glucose went negative");
            System.exit(-1);
        }
    }
        
    releaseAllGlucose(){
        this.body.blood.addGlucose(glucose);
        this.glucose = 0;
    }
        
    addAminoAcids(aa){
        this.branchedAA += 0.15*aa;
        this.unbranchedAA += 0.85*aa;
        //SimCtl.time_stamp();
        //System.out.println(" PortalVein: bAA " + branchedAA + ", uAA " + unbranchedAA);
    }
        
    releaseAminoAcids(){
        // 93% unbranched amino acids consumed by liver to make alanine
        this.body.blood.alanine += 0.93*this.unbranchedAA;
        this.body.blood.unbranchedAminoAcids += 0.07*this.unbranchedAA;
        this.unbranchedAA = 0;
        this.body.blood.branchedAminoAcids += this.branchedAA;
        this.branchedAA = 0;
        // who consumes these amino acids from blood other than liver?
        // brain consumes branched amino acids
    }
}
// Liver End


// Portal Vein Start
class PortalVein{
    constructor(body_){
        this.body = body_;
        this.glucose = 0; //mg
        this.branchedAA = 0;	//mg
        this.unbranchedAA = 0; //mg
        this.fluidVolume_ = 5; // dl
    }
    
    processTick(){
        var bgl = this.body.blood.getBGL();
        var glucoseFromBlood = bgl*this.fluidVolume_;
        this.body.blood.removeGlucose(glucoseFromBlood);
        this.glucose += glucoseFromBlood;
        //SimCtl.time_stamp();
    }
    
    setParams(){
        for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.PORTAL_VEIN.value).entrySet()){            
            switch(key){
                case "fluidVolume_" : { this.fluidVolume_ = value; break; }
            }
        }
    }
    
    getConcentration(){
        var gl = this.glucose/this.fluidVolume_;
        //SimCtl.time_stamp();
        //System.out.println("GL in Portal Vein: " + gl);
        return gl;
    }
    
    addGlucose(g) {this.glucose += g;}
    
    getGlucose(){return this.glucose;}
    
    removeGlucose(g){
        this.glucose -= g;
        if(this.glucose < 0){
            console.log("PortalVein glucose went negative");
            System.exit(-1);
        }
    }
    
    releaseAllGlucose(){
        this.body.blood.addGlucose(this.glucose);
        this.glucose = 0;
    }
    
    addAminoAcids(aa){
        this.branchedAA += 0.15*aa;
        this.unbranchedAA += 0.85*aa;
        //SimCtl.time_stamp();
        console.log(" PortalVein: bAA " + this.branchedAA + ", uAA " + this.unbranchedAA);
    }
    
    releaseAminoAcids(){
        // 93% unbranched amino acids consumed by liver to make alanine
        this.body.blood.alanine += 0.93*this.unbranchedAA;
        this.body.blood.unbranchedAminoAcids += 0.07*this.unbranchedAA;
        this.unbranchedAA = 0;
        this.body.blood.branchedAminoAcids += this.branchedAA;
        this.branchedAA = 0;
        // who consumes these amino acids from blood other than liver?
        // brain consumes branched amino acids
    }
}
// Portal Vein End


// Adipose Tissue Start
class AdiposeTissue{
	constructor(myBody){
		this.body = myBody;
    	this.glucoseAbsorbed_ = 0;
        this.bAAToGlutamine_ = 0;
        this.lipolysisRate_ = 0;
        this.fat = (this.body.fatFraction_)*(this.body.bodyWeight_)*1000.0;
	}

	processTick(){
        console.log(this.body.blood.getBGL());
		if(this.body.blood.getBGL() < this.body.blood.normalGlucoseLevel_){
            var lipolysis = this.body.insulinResistance_*this.lipolysisRate_;
            this.body.blood.gngSubstrates += this.lipolysis;
        }else{
            this.body.blood.gngSubstrates += this.lipolysisRate_;
        }
	
		if(this.body.blood.branchedAminoAcids > this.bAAToGlutamine_){
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += this.bAAToGlutamine_;
        }else{
            this.body.blood.glutamine += this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
        
        //System.out.println("Total Glucose Absorbed by Adipose Tissue " + totalGlucoseAbsorption);
        //System.out.println("Glucose_Consumed_in_a_Minute_by_AdiposeTissue " + glucoseConsumedINaMinute);
        
        //SimCtl.time_stamp();
        console.log(" BodyWeight: " + this.body.bodyWeight_);
	}

	setParams(){
		for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.ADIPOSE_TISSUE.value).entries()){
    		switch(key){
    			case "glucoseOxidized_" : { this.glucoseAbsorbed = value; break; }
    			case "glucoseToAlanine_" : { this.lipolysisRate_ = value; break; }
    			case "bAAToGlutamine_" : { this.bAAToGlutamine_ = value; break; }
    		}
    	}
	}

	 lipogenesis(glucoseInMG){
    	// one gram of glucose has 4kcal of energy
        // one gram of TAG has 9 kcal of energy
        //System.out.println("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
        this.body.bodyWeight_ -=  this.fat/1000.0;
        this.fat += glucoseInMG*4.0/9000.0;
        this.body.bodyWeight_ += this.fat/1000.0;
        //System.out.println("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
    }

     consumeFat(kcal){
    	this.body.bodyWeight_ -= this.fat/1000.0;
        this.fat -= this.kcal/9.0;
        this.body.bodyWeight_ += this.fat/1000.0;
        console.log(kcal);
    }

    addFat(newFatInMG){
    	this.body.bodyWeight_ -= this.fat/1000.0;
    	this.fat += newFatInMG/1000.0;
    	this.body.bodyWeight_ += this.fat/1000.0;
    	//System.out.println("BodyWeight: addFat " + body.bodyWeight_ + " newfat " + newFatInMG);
    } 
}
// Adipose Tissue End


//HumanBody Start
const EventType = {
    FOOD: 'FOOD',
    EXERCISE: 'EXERCISE',
    HALT: 'HALT',
    METFORMIN: 'METFORMIN',
    INSULIN_SHORT: 'INSULIN_SHORT',
    INSULIN_LONG: 'INSULIN_LONG'
}

class Event{
    constructor(){
        this.type = "";
        this.subtype = "";
        this.howmuch = "";
        this.day = 0;
        this.hour = 0;
        this.minutes = 0;
        this.fireTime = 0;
    }
};

class FoodEvent extends Event{
    constructor (fireTime, quantity, foodID){
        super(fireTime);
        this.quantity_ = quantity;
        this.foodID_ = foodID;
    }
}

class ExerciseEvent extends Event{
    constructor (fireTime, duration, exerciseID){
        super(fireTime);
        this.duration_ = duration;
        this.exerciseID_ = exerciseID;
    }
}

class HaltEvent extends Event{
    constructor (fireTime){
        super(fireTime);
    }
}

const BodyState = {
    FED_RESTING: 'FED_RESTING',
    FED_EXERCISING: 'FED_EXERCISING',
    POSTABSORPTIVE_RESTING: 'POSTABSORPTIVE_RESTING',
    POSTABSORPTIVE_EXERCISING: 'POSTABSORPTIVE_EXERCISING'
}

const BodyOrgan = {
    HUMAN_BODY: 'HUMAN_BODY',
    INTESTINE: 'INTESTINE',
    PORTAL_VEIN: 'PORTAL_VEIN',
    LIVER: 'LIVER',
    BLOOD: 'BLOOD',
    MUSCLES: 'MUSCLES',
    BRAIN: 'BRAIN',
    HEART: 'HEART',
    ADIPOSE_TISSUE: 'ADIPOSE_TISSUE',
    KIDNEY: 'KIDNEY'
}

class FoodType{
    constructor(){
        this.foodID = "";
        this.name = "";
        this.servingSize = "";
        this.RAG = "";
        this.SAG = "";
        this.protein = "";
        this.fat = "";
    }
};

class ExerciseType{
    constructor(){
        this.exerciseID = "";
        this.name = "";
        this.intensity = "";  
    }
};

class HumanBody{
    constructor(){
        // *****all commented out lines need to be uncommented when add each class for different organs*****
        this.bodyWeight_ = 65; //kg

        this.eventQ = new PriorityQueue();
        this.portalVein = new PortalVein(this);
        this.muscles = new Muscles(this);
        this.liver = new Liver(this);
        this.blood = new Blood(this);
        this.stomach = new Stomach(this);
        this.intestine = new Intestine(this);
        this.brain = new Brain(this);
        this.heart = new Heart(this);
        this.adiposeTissue = new AdiposeTissue(this);
        this.kidneys = new Kidney(this);
        this.ticks = 0;
        this.insulinResistance_ = 0;
        this.insulinPeakLevel_ = 1.0;
        this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
        this.fatFraction = 0.2;

        //this.adiposeTissue = new AdiposeTissue(this);
        //this.muscles = new musclesH(this);

        this.currExercise = 0;
        this.currEnergyExpenditure = 1.0/60.0;
        this.exerciseOverAt = 0;
    }

    //Original SimCtl Codde now put here
    elapsed_days(){
         return this.ticks / TICKS_PER_DAY; 
    }
    
    elapsed_hours(){
        var x = this.ticks % TICKS_PER_DAY;
        return (x / TICKS_PER_HOUR);
    }
    
    elapsed_minutes(){
        var x = this.ticks % TICKS_PER_DAY;
        return (x % TICKS_PER_HOUR);
    }
    
    time_stamp(){
        console.log(this.elapsed_days() + ":" + this.elapsed_hours() + ":" + this.elapsed_minutes());
    }
    
    processTick(){
        this.brain.processTick();
        this.liver.processTick();
        this.kidneys.processTick();
        this.blood.processTick();
        this.heart.processTick();
        this.portalVein.processTick();
        this.intestine.processTick();
       // console.log(this.stomach.processTick());
        this.adiposeTissue.processTick();
        
       
        this.muscles.processTick();

        // dont worry about time_stamp yet, will be read from real-time database
        console.log(" bgl " + this.blood.getBGL() + " weight "  + this.bodyWeight_);

        if(this.bodyState == BodyState.FED_EXERCISING){
            // need to work on if statement, read from realtime db
            //if(){
                this.bodyState = BodyState.FED_RESTING;
                this.currEnergyExpenditure = 1.0/60.0;
            //}
        }

        if(this.bodyState == BodyState.POSTABSORPTIVE_EXERCISING){
            // need to work on if statement, read ticks from realtime db
            //if(){
                this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
                this.currEnergyExpenditure = 1.0/60.0;
            //}
        }

    }
    
    run_simulation(){
        while(true){
            var val;
            while( (val = this.fire_event()) == 1);
                this.processTick();
                this.ticks++;
            
                console.log(this.elapsed_days() + ":" + this.elapsed_hours() + ":" + this.elapsed_minutes);
        }
    }
    
    processFoodEvent(foodID, howmuch){
        this.stomach.addFood(foodId, howmuch);
        this.oldState = this.bodyState;
        switch(this.bodyState){
            case BodyState.POSTABSORPTIVE_RESTING:
                this.bodyState = BodyState.FED_RESTING;
                break;
            case BodyState.POSTABSORPTIVE_EXERCISING:
                this.bodyState = BodyState.FED_EXERCISING;
                break;
            default:
                break;
        }
        
        if(this.bodyState != this.oldState){
            // all this code was commented out in original
            //setParams();
            //SimCtl::time_stamp();
            //cout << "Entering State " << bodyState << endl;
        }     
    }

    isExercising(){
        if(this.bodyState == BodyState.FED_EXERCISING || this.bodyState == BodyState.POSTABSORPTIVE_EXERCISING){
            return true;
        }else{
            return false;
        }
    }
    
    processExerciseEvent(exerciseID, duration){
        if(this.isExercising()){
            // convert when work on real-time database
            // SimCtl::time_stamp();
            Console.log("Exercise within Exercise!");
            process.exit();
        }

        this.currExercise = exerciseID;

        // need to look into Javascript maps
        //currEnergyExpenditure = (exerciseTypes[exerciseID].intensity_)/60.0;

        if(this.bodyState == BodyState.FED_RESTING){
            this.bodyState = BodyState.FED_EXERCISING;
            // Look into accessing SimCtl
            //exerciseOverAt = SimCtl::ticks + duration;
            return;
        }

        if(this.bodyState == BodyState.POSTABSORPTIVE_RESTING){
            this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            // Look into accessing SimCtl
            // exerciseOverAt = SimCtl::ticks + duration;
            return;
        }
    }
    
    fire_event(){
        var event_ = this.eventQ.front();

        if(event_ === "No elements in Queue"){
            console.log("No event left");
            // terminate program
        }

        if(event_.firetime > this.ticks){
            return -1;
        }
        
        console.log("ticks = " + this.ticks + ": " + this.elapsed_days() + "::" + this.elapsed_hours() + "::" + this.elapsed_minutes());
        
        console.log("event fire time: " + event_.fireTime);

        var event_type = event_.ID;

        switch(event_type){
            case EventType.FOOD:
                this.processFoodEvent(event_.subID, event_.howmuch);
                break;
            case EventType.EXERCISE:
                this.processExerciseEvent(event_.subID, event_.howmuch)
                break;
            case EventType.HALT:
                // terminate program
                break;
            default:
                break;
        }

        event_ = this.eventQ.dequeue();
        //delete event_;
        return 1;
    }
    
    addEvent(fireTime, type, subtype, howmuch){
        switch (type){
            case EventType.FOOD:
                var e = new QElement(fireTime, type, subtype, howmuch);
                this.eventQ.enqueue(e);
                break;
            case EventType.EXERCISE:
                var e = new QElement(fireTime, type, subtype, howmuch);
                this.eventQ.enqueue(e);
                break;
            case EventType.HALT:
                var e = new QElement(fireTime, type, subtype, howmuch);
                this.eventQ.enqueue(e);
            default:
                break;
        }
    }

    readEvents(completedActivitiesArray){

    }

    currentEnergyExpenditure(){
        return this.bodyWeight_ * this.currEnergyExpenditure;
    }

    stomachEmpty(){
        var oldState = this.bodyState;

        switch (this.bodyState){
            case BodyState.FED_RESTING:
                this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
                break;
            case BodyState.FED_EXERCISING:
                this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
                break;
            default:
                break;
        }

        if(this.bodyState != this.oldState){
            // do nothing, original code just has cout but it is commented out
            //setParams();
            //time_stamp();
            //console.log("Entering State " + this.bodyState);
        }
    }

    /*setParams(){
        // need to look into how to do iterator
        stomach.setParams();
        intestine.setParams();
        portalVein.setParams();
        liver.setParams();
        adiposeTissue.setParams();
        brain.setParams();
        heart.setParams();
        muscles.setParams();
        blood.setParams();
        kidneys.setParams();
    }
    */
}
//HumanBody End

var activityTypesArray = [
    {
        _id: "Select Activity Type",
        name: "Select Activity Type"
    },
    {
        _id: "Food",
        name: "Food"
    },
    {
        _id: "Exercise",
        name: "Exercise"
    }
];

function timeCalculation(dayInput0, hourSelect0, minuteSelect0){
    var dayInt = parseInt(dayInput0);
    var hourInt = parseInt(hourSelect0);
    var minuteInt = parseInt(minuteSelect0);
    var totalReturn = 0;

    var dayTotal = dayInt * 1440;
    var hourTotal = hourInt * 60;
    totalReturn = dayTotal + hourTotal + minuteInt;
    return totalReturn;
}

function runSimulationProgram(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, foodQtyInput0, exerciseQtyInput0, activityDbArray, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1, dayInput0, hourSelect0, minuteSelect0, deleted, req, res, endDay, endHour, endMinute){
    var nextActivityTypeID = totalActivitiesInDb_1;
    var nextFoodTypeID = totalFoodTypesinDb_1;
    var nextExerciseTypeID = totalExerciseTypesinDb_1;
    
    var humanBody = new HumanBody();

    var completedActivitiesArray = [];

    var i = 1;

    var endTime = timeCalculation(endDay, endHour, endMinute);
    var typeEnd = "HALT";
    var subTypeEnd = "HALT";
    var howMuchEnd = 0;
    var newEndTimeObj = {fireTime: endTime, type: typeEnd, subtype: subTypeEnd, howmuch: howMuchEnd};
    completedActivitiesArray.push(newEndTimeObj);

    while(activity_type0[i] != null){
        if(deleted[i] != "DELETED"){
            var activityType = activity_type0[i];
            if(activityType == "Food"){
                var foodType = food_type0[i];
                if(foodType == "+ New Food"){
                    var time = timeCalculation(dayInput0[i], hourSelect0[i], minuteSelect0[i]);
                    var activityTypeValue = activity_type0[i];
                    var subTypeValue = nextFoodTypeID;
                    var foodQtyInput = foodQtyInput0[i];

                    var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: foodQtyInput};
                    completedActivitiesArray.push(newActivityObj);

                    nextFoodTypeID++;
                }else if(foodType == "Select Food"){
                    // no selection made, do not add to simulation
                }else{
                    var time = timeCalculation(dayInput0[i], hourSelect0[i], minuteSelect0[i]);
                    var activityTypeValue = activity_type0[i];
                    var subTypeValue = foodType;
                    var foodQtyInput = foodQtyInput0[i];

                    var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: foodQtyInput};
                    completedActivitiesArray.push(newActivityObj);
                }
            }else if(activityType == "Exercise"){
                var exerciseType = exercise_type0[i];
                if(exerciseType == "+ New Exercise"){

                    var time = timeCalculation(dayInput0[i], hourSelect0[i], minuteSelect0[i]);
                    var activityTypeValue = activity_type0[i];
                    var subTypeValue = nextExerciseTypeID;
                    var exerciseQtyInput = exerciseQtyInput0[i];

                    var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: exerciseQtyInput};
                    completedActivitiesArray.push(newActivityObj);
                    nextExerciseTypeID++;
                }else if(exerciseType == "Select Exercise"){
                // no selection made, do not add to simulation
                }else{
                    var time = timeCalculation(dayInput0[i], hourSelect0[i], minuteSelect0[i]);
                    var activityTypeValue = activity_type0[i];
                    var subTypeValue = exerciseType;
                    var exerciseQtyInput = exerciseQtyInput0[i];

                    var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: exerciseQtyInput};
                    completedActivitiesArray.push(newActivityObj);
                }
            }else{
                // no selection made, do not add to simulation
            }
        }
        i++;
    }

    humanBody.readEvents(completedActivitiesArray);

    humanBody.run_simulation();

    // adds activities to db but does not run simulation
    /*const myFirstPromise = new Promise((resolve, reject) => {
        resolve("success!");
    });

    myFirstPromise.then((successMessage) => {
        humanBody.run_simulation(simulationPassedObject);
    });*/
    // runs simulation but entire webpage is frozen, can still access menu
    /*const myFirstPromise = new Promise((resolve, reject) => {
        humanBody.run_simulation(simulationPassedObject);
        resolve("success!");
    });*/
}

function writeActivitySetToDatabaseArray(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, foodQtyInput0, exerciseQtyInput0, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1, dayInput0, hourSelect0, minuteSelect0, deleted, endDay, endHour, endMinute){
    var nextActivityTypeID = totalActivitiesInDb_1;
    var nextFoodTypeID = totalFoodTypesinDb_1;
    var nextExerciseTypeID = totalExerciseTypesinDb_1;

    var userId = firebase.auth().currentUser.uid;

    var newActivitySequenceKey = firebase.database().ref().child('activitySequences').push().key;


    var d = new Date();
    var month = d.getMonth() + 1;
    var dateString = month + "/" + d.getDate() + "/" + d.getFullYear();

    var dateObj = {
        dateCreated: dateString,
        endDay: endDay,
        endHour: endHour,
        endMinute: endMinute
    };

    var exerciseSubtype = {};
    exerciseSubtype['/users/' + userId + '/activitySequences/' + newActivitySequenceKey] = dateObj;

    firebase.database().ref().update(exerciseSubtype);


    //for each element
    var i = 1;

    while(activity_type0[i] != null){
        if(deleted[i] != "DELETED"){
            var activityType = activity_type0[i];
            if(activityType == "Food"){
                var foodType = food_type0[i];
                if(foodType == "+ New Food"){
                    var newFoodName = newFoodName0[i];
                    var newFoodServingSize = newFoodServingSize0[i];
                    var newFoodFat = newFoodFat0[i];
                    var newFoodProtein = newFoodProtein0[i];
                    var newFoodRAG = newFoodRAG0[i];
                    var newFoodSAG = newFoodSAG0[i];
                    writeFoodSubtypeData(nextFoodTypeID, newFoodName, newFoodServingSize, newFoodRAG, newFoodSAG, newFoodProtein, newFoodFat);
                    var foodQtyInput = foodQtyInput0[i];
                    var daySelection = dayInput0[i];
                    var hourSelection = hourSelect0[i];
                    var minuteSelection = minuteSelect0[i];
                    writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, nextFoodTypeID, foodQtyInput, daySelection, hourSelection, minuteSelection)
                    nextFoodTypeID++;
                }else if(foodType == "Select Food"){
                    // no selection made, do not add anything to database
                }else{
                    var foodQtyInput = foodQtyInput0[i];
                    var daySelection = dayInput0[i];
                    var hourSelection = hourSelect0[i];
                    var minuteSelection = minuteSelect0[i];
                    writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, foodType, foodQtyInput, daySelection, hourSelection, minuteSelection)
                }
            }else if(activityType == "Exercise"){
                var exerciseType = exercise_type0[i];
                if(exerciseType == "+ New Exercise"){
                    var newExerciseName = newExerciseName0[i];
                    var newExerciseIntensity = newExerciseIntensity0[i];
                    writeExerciseSubtypeData(nextExerciseTypeID, newExerciseName, newExerciseIntensity);
                    var exerciseQtyInput = exerciseQtyInput0[i];
                    var daySelection = dayInput0[i];
                    var hourSelection = hourSelect0[i];
                    var minuteSelection = minuteSelect0[i];
                    writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, nextExerciseTypeID, exerciseQtyInput, daySelection, hourSelection, minuteSelection)
                    nextExerciseTypeID++;
                }else if(exerciseType == "Select Exercise"){
                    // no selection made, do not add anything to database
                }else{
                    var exerciseQtyInput = exerciseQtyInput0[i];
                    var daySelection = dayInput0[i];
                    var hourSelection = hourSelect0[i];
                    var minuteSelection = minuteSelect0[i];
                    writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, exerciseType, exerciseQtyInput, daySelection, hourSelection, minuteSelection)
                }
            }else{
                // no selection made, do not add anything to database
            }
        }
        i++;
    }
}

function writeFoodSubtypeData(totalFoodSubtypesPlus, food_name, servingSize, RAG, SAG, protein, fat){
    var userId = firebase.auth().currentUser.uid;

    var foodSubtypeEntry = {
        _id: totalFoodSubtypesPlus,
        food_name: food_name,
        servingSize: servingSize,
        RAG: RAG,
        SAG: SAG,
        protein: protein,
        fat: fat
    };

    var newFoodSubtypeKey = firebase.database().ref().child('foodSubtypes').push().key;

    var foodSubtype = {};
    foodSubtype['/users/' + userId + '/foodSubtypes/' + newFoodSubtypeKey] = foodSubtypeEntry;

    return firebase.database().ref().update(foodSubtype);
}

function writeExerciseSubtypeData(totalExerciseSubtypesPlus, exercise_activity, intensity){
    var userId = firebase.auth().currentUser.uid;

    var exerciseSubtypeEntry = {
        _id: totalExerciseSubtypesPlus,
        exercise_activity: exercise_activity,
        intensity: intensity,
    };

    var newExerciseSubtypeKey = firebase.database().ref().child('exerciseSubtypes').push().key;

    var exerciseSubtype = {};
    exerciseSubtype['/users/' + userId + '/exerciseSubtypes/' + newExerciseSubtypeKey] = exerciseSubtypeEntry;

    return firebase.database().ref().update(exerciseSubtype);
}

function writeNewActivitySequenceElement(newActivitySequenceKey, totalActivitiesInDb_1, activity, subtype, quantity, day, hour, minute){
    var userId = firebase.auth().currentUser.uid;
    var timestampRecorded = Date.now();
    var activitySequenceElement = {
        _id: totalActivitiesInDb_1,
        activity_type: activity,
        subtype: subtype,
        quantity: quantity,
        day: day,
        hour: hour,
        minute: minute,
    };

    var newActivitySequenceElementKey = firebase.database().ref().child(newActivitySequenceKey).push().key;
    var activitySequenceElements = {};
    activitySequenceElements['/users/' + userId + '/activitySequences/' + newActivitySequenceKey + '/' + newActivitySequenceElementKey] = activitySequenceElement;

    return firebase.database().ref().update(activitySequenceElements);
}

exports.new_simulation_get = function(req, res) {
    var hourArray = [];
    var hourString = "Hour";
    var hourID = "Hour";
    var hourObj = {name: hourString, _id: hourID};
    hourArray.push(hourObj);
    for(var i = 0; i < 24; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        hourArray.push(newObj);
    }

    var minutesArray = [];
    var minString = "Minute";
    var minID = "Minute";
    var minObj = {name: minString, _id: minID};
    minutesArray.push(minObj);
    for(var i = 0; i < 60; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        minutesArray.push(newObj);
    }

    if( firebase.auth().currentUser ) {
        var foodKeyArray = [];
        var foodKeyDataArray = [];
        var foodActivitiesArray = [];

        var sfname = "Select Food";
        var sfID = "Select Food";
        var sfrag = "";
        var sfsag = "";
        var sffat = "";
        var sfprotein = "";
        var sfservingSize = "";
        var newObjSF = {rag: sfrag, sag: sfsag, _id: sfID, fat: sffat, name: sfname, protein: sfprotein, servingSize: sfservingSize};
        foodKeyDataArray.push(newObjSF);

        var nfname = "+ New Food";
        var nfID = "+ New Food";
        var nfrag = "";
        var nfsag = "";
        var nffat = "";
        var nfprotein = "";
        var nfservingSize = "";
        var newObjSF = {rag: nfrag, sag: nfsag, _id: nfID, fat: nffat, name: nfname, protein: nfprotein, servingSize: nfservingSize};
        foodKeyDataArray.push(newObjSF);
    
        var userId = firebase.auth().currentUser.uid;
        var query = firebase.database().ref('/users/' + userId + '/foodSubtypes').orderByKey();
        query.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.key = childSnapshot.key;
    
                foodKeyArray.push(item);                                              
            });
            for(i = 0; i < foodKeyArray.length; i++){
                var rag = foodKeyArray[i].RAG;
                var sag = foodKeyArray[i].SAG;
                var _id = foodKeyArray[i]._id;
                var fat = foodKeyArray[i].fat;
                var food_name = foodKeyArray[i].food_name;
                var protein = foodKeyArray[i].protein;
                var servingSize = foodKeyArray[i].servingSize;
                var newObj = {rag: rag, sag: sag, _id: _id, fat: fat, name: food_name, protein: protein, servingSize: servingSize};
                foodKeyDataArray.push(newObj);
            }
    
            foodActivitiesArray = foodKeyDataArray;
    
            var exerciseKeyArray = [];
            var exerciseKeyDataArray = [];
            var exerciseActivitiesArray = [];

            var seName = "Select Exercise";
            var seID = "Select Exercise";
            var seIntensity = "";
            var newObjSE = {name: seName, _id: seID, intensity: seIntensity};
            exerciseKeyDataArray.push(newObjSE);
    
            var neName = "+ New Exercise";
            var neID = "+ New Exercise";
            var neIntensity = "";
            var newObjNewe = {name: neName, _id: neID, intensity: neIntensity};
            exerciseKeyDataArray.push(newObjNewe);
        
            var userId = firebase.auth().currentUser.uid;
            var query = firebase.database().ref('/users/' + userId + '/exerciseSubtypes').orderByKey();
            query.once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var item = childSnapshot.val();
                    item.key = childSnapshot.key;
        
                    exerciseKeyArray.push(item);                                              
                });
                for(i = 0; i < exerciseKeyArray.length; i++){
                    var kaString = exerciseKeyArray[i].exercise_activity;
                    var kaID = exerciseKeyArray[i]._id;
                    var kaIntensity = exerciseKeyArray[i].intensity;
                    var newObj = {name: kaString, _id: kaID, intensity: kaIntensity};
                    exerciseKeyDataArray.push(newObj);
                }
        
                exerciseActivitiesArray = exerciseKeyDataArray;

                var activitySequenceKeyArray = [];
                var activitySequenceDataArray = [];
                var activitySequenceArray = [];

                var baseName = "Create New Activity Sequence";
                var baseActivities = [];
                var activitySequenceBase = {name: baseName, activities: baseActivities};
                activitySequenceDataArray.push(activitySequenceBase);

                var userId = firebase.auth().currentUser.uid;
                var query = firebase.database().ref('/users/' + userId + '/activitySequences').orderByKey();
                query.once('value').then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var item = childSnapshot.val();
                        item.key = childSnapshot.key;

                        var date = item.dateCreated;

                        var activitiesInSequence = [];
                        childSnapshot.forEach(function(doubleChildSnapshot){
                            var item1 = doubleChildSnapshot.val();
                                item1.key = doubleChildSnapshot.key;
                                activitiesInSequence.push(item1);
                        });

                        var exerciseCt = 0;
                        var foodCt = 0;
                        for(p = 0; p < activitiesInSequence.length; p++){
                            if(activitiesInSequence[p].activity_type == "Food"){
                                foodCt++;
                            }
                            if(activitiesInSequence[p].activity_type == "Exercise"){
                                exerciseCt++;
                            }
                        }

                        var sequenceName = "Created on: " + date + ", # Exercise Activities: " + exerciseCt + ", # Food Activities: " + foodCt;
                        var newObj = {name: sequenceName, activities: activitiesInSequence};
                        activitySequenceDataArray.push(newObj);
                    });

                    activitySequenceArray = activitySequenceDataArray;
                       
                    res.render('newSimulation', {activityTypes: activityTypesArray, foodTypes: foodActivitiesArray, exerciseTypes: exerciseActivitiesArray, hours: hourArray, minutes: minutesArray, simulations: activitySequenceArray});
                });
            });
        });
    } else {
        res.render('loginfirstmsg', {result: "One needs to Sign In first before logging a new Activity."});
    } 
};

exports.new_simulation_post = function(req, res) {
    var hourArray = [];
    var hourString = "Hour";
    var hourID = "Hour";
    var hourObj = {name: hourString, _id: hourID};
    hourArray.push(hourObj);
    for(var i = 0; i < 24; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        hourArray.push(newObj);
    }

    var minutesArray = [];
    var minString = "Minute";
    var minID = "Minute";
    var minObj = {name: minString, _id: minID};
    minutesArray.push(minObj);
    for(var i = 0; i < 60; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        minutesArray.push(newObj);
    }

    var foodKeyArray = [];
    var foodKeyDataArray = [];
    var foodActivitiesArray = [];

    var sfname = "Select Food";
    var sfID = "Select Food";
    var sfrag = "";
    var sfsag = "";
    var sffat = "";
    var sfprotein = "";
    var sfservingSize = "";
    var newObjSF = {rag: sfrag, sag: sfsag, _id: sfID, fat: sffat, name: sfname, protein: sfprotein, servingSize: sfservingSize};
    foodKeyDataArray.push(newObjSF);

    var nfname = "+ New Food";
    var nfID = "+ New Food";
    var nfrag = "";
    var nfsag = "";
    var nffat = "";
    var nfprotein = "";
    var nfservingSize = "";
    var newObjSF = {rag: nfrag, sag: nfsag, _id: nfID, fat: nffat, name: nfname, protein: nfprotein, servingSize: nfservingSize};
    foodKeyDataArray.push(newObjSF);

    var userId = firebase.auth().currentUser.uid;
    var query = firebase.database().ref('/users/' + userId + '/foodSubtypes').orderByKey();
    query.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var item = childSnapshot.val();
            item.key = childSnapshot.key;

            foodKeyArray.push(item);                                              
        });
        for(i = 0; i < foodKeyArray.length; i++){
            var rag = foodKeyArray[i].RAG;
            var sag = foodKeyArray[i].SAG;
            var _id = foodKeyArray[i]._id;
            var fat = foodKeyArray[i].fat;
            var food_name = foodKeyArray[i].food_name;
            var protein = foodKeyArray[i].protein;
            var servingSize = foodKeyArray[i].servingSize;
            var newObj = {rag: rag, sag: sag, _id: _id, fat: fat, name: food_name, protein: protein, servingSize: servingSize};
            foodKeyDataArray.push(newObj);
        }

        foodActivitiesArray = foodKeyDataArray;

        var exerciseKeyArray = [];
        var exerciseKeyDataArray = [];
        var exerciseActivitiesArray = [];

        var seName = "Select Exercise";
        var seID = "Select Exercise";
        var seIntensity = "";
        var newObjSE = {name: seName, _id: seID, intensity: seIntensity};
        exerciseKeyDataArray.push(newObjSE);

        var neName = "+ New Exercise";
        var neID = "+ New Exercise";
        var neIntensity = "";
        var newObjNewe = {name: neName, _id: neID, intensity: neIntensity};
        exerciseKeyDataArray.push(newObjNewe);
    
        var userId = firebase.auth().currentUser.uid;
        var query = firebase.database().ref('/users/' + userId + '/exerciseSubtypes').orderByKey();
        query.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.key = childSnapshot.key;
    
                exerciseKeyArray.push(item);                                              
            });
            for(i = 0; i < exerciseKeyArray.length; i++){
                var kaString = exerciseKeyArray[i].exercise_activity;
                var kaID = exerciseKeyArray[i]._id;
                var kaIntensity = exerciseKeyArray[i].intensity;
                var newObj = {name: kaString, _id: kaID, intensity: kaIntensity};
                exerciseKeyDataArray.push(newObj);
            }
    
            exerciseActivitiesArray = exerciseKeyDataArray;
            
            var activityDbArray = [];

            var userId = firebase.auth().currentUser.uid;
            var query = firebase.database().ref('/users/' + userId + '/activities').orderByKey();
            query.once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var item = childSnapshot.val();
                    item.key = childSnapshot.key;
                    activityDbArray.push(item);                                              
                });

                
                var totalActivitiesInDb_1 = activityDbArray.length + 1;
                var totalExerciseTypesinDb_1 = exerciseActivitiesArray.length - 1;
                var totalFoodTypesinDb_1 = foodActivitiesArray.length - 1;

                var activity_type0 = req.body.activity_type0;
                var food_type0 = req.body.food_type0;
                var exercise_type0 = req.body.exercise_type0;
                var newFoodName0 = req.body.newFoodName0;
                var newFoodServingSize0 = req.body.newFoodServingSize0;
                var newFoodFat0 = req.body.newFoodFat0;
                var newFoodProtein0 = req.body.newFoodProtein0;
                var newFoodRAG0 = req.body.newFoodRAG0;
                var newFoodSAG0 = req.body.newFoodSAG0;
                var newExerciseName0 = req.body.newExerciseName0;
                var newExerciseIntensity0 = req.body.newExerciseIntensity0;
                var foodQtyInput0 = req.body.foodQtyInput0;
                var exerciseQtyInput0 = req.body.exerciseQtyInput0;
                var deleted = req.body.deleted0;
                var dayInput0 = req.body.dayNumberInput0;
                var hourSelect0 = req.body.hourSelect0;
                var minuteSelect0 = req.body.minuteSelect0;

                var endDay = req.body.endTimeDayInput;
                var endHour = req.body.endTimeHourSelect;
                var endMinute = req.body.endTimeMinuteSelect;

                console.log(endDay);
                console.log(endHour);
                console.log(endMinute);
                
                writeActivitySetToDatabaseArray(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, foodQtyInput0, exerciseQtyInput0, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1, dayInput0, hourSelect0, minuteSelect0, deleted, endDay, endHour, endMinute);

                //runSimulationProgram(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, foodQtyInput0, exerciseQtyInput0, activityDbArray, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1, dayInput0, hourSelect0, minuteSelect0, deleted, req, res, endDay, endHour, endMinute);

                var activitySequenceKeyArray = [];
                var activitySequenceDataArray = [];
                var activitySequenceArray = [];

                var baseName = "Create New Activity Sequence";
                var baseActivities = [];
                var activitySequenceBase = {name: baseName, activities: baseActivities};
                activitySequenceDataArray.push(activitySequenceBase);

                var userId = firebase.auth().currentUser.uid;
                var query = firebase.database().ref('/users/' + userId + '/activitySequences').orderByKey();
                query.once('value').then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var item = childSnapshot.val();
                        item.key = childSnapshot.key;

                        var date = item.dateCreated;

                        var activitiesInSequence = [];
                        childSnapshot.forEach(function(doubleChildSnapshot){
                            var item1 = doubleChildSnapshot.val();
                                item1.key = doubleChildSnapshot.key;
                                activitiesInSequence.push(item1);
                        });

                        var exerciseCt = 0;
                        var foodCt = 0;
                        for(p = 0; p < activitiesInSequence.length; p++){
                            if(activitiesInSequence[p].activity_type == "Food"){
                                foodCt++;
                            }
                            if(activitiesInSequence[p].activity_type == "Exercise"){
                                exerciseCt++;
                            }
                        }

                        var sequenceName = "Created on: " + date + ", # Exercise Activities: " + exerciseCt + ", # Food Activities: " + foodCt;
                        var newObj = {name: sequenceName, activities: activitiesInSequence};
                        activitySequenceDataArray.push(newObj);
                    });

                    activitySequenceArray = activitySequenceDataArray;
                       
                    res.render('newSimulation', {activityTypes: activityTypesArray, foodTypes: foodActivitiesArray, exerciseTypes: exerciseActivitiesArray, hours: hourArray, minutes: minutesArray, simulations: activitySequenceArray});
                });
            });
        });
    });
};

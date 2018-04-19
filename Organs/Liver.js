//package sim;

//import java.util.Map.Entry;

//import org.apache.commons.math3.distribution.PoissonDistribution;

//import enums.BodyOrgan;

class Liver {

    constructor(body_) {
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
    processTick() {
    	// every thing is stochastic
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        // Now do the real work
        
        var glInPortalVein = this.body.portalVein.getConcentration();
        var glInLiver = this.glucose/this.fluidVolume_;
          console.log(x);
        
        if( glInLiver < glInPortalVein ) {
            var diff = glInPortalVein - glInLiver;
            x =  poissonProcess.sample(x*this.Glut2VMAX_);
            var g = x * diff/(diff + this.Glut2Km_);
            
            if( g > this.body.portalVein.getGlucose() ) {
                //console.log("Trying to absorb more glucose from portal vein than what is present there! " + g + " " + body.portalVein.getGlucose());
                g = this.body.portalVein.getGlucose();
            }
            
            this.body.portalVein.removeGlucose(g);
            this.glucose += g;
            console.log("Liver absorbs from portal vein " + g);
        }
        
        this.body.portalVein.releaseAllGlucose();

        
        glInLiver = this.glucose/this.fluidVolume_;
        var scale = this.glInLiver/this.normalGlucoseLevel_;
        //scale *= (1.0 - body.insulinResistance_);
        scale *= this.body.blood.insulin;
        x = poissonProcess.sample(x*this.glucoseToGlycogen_);
        var toGlycogen = scale * x;
        
        if( toGlycogen > this.glucose )
            toGlycogen = this.glucose;
        
        this.glycogen += toGlycogen;
        
        if( this.glycogen > this.glycogenMax_ )
        {
            this.body.adiposeTissue.lipogenesis(this.glycogen - this.glycogenMax_);
            this.glycogen = this.glycogenMax_;
        }
        
       
        this.glucose -= toGlycogen;
        
        //console.log("After glycogen synthesis in liver, liver glycogen " + glycogen + " mg, live glucose " + glucose + " mg");
        
        //glycogen breakdown (depends on insulin and glucose level)
        
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        glInLiver = this.glucose/this.fluidVolume_;
        
        if( glInLiver > this.normalGlucoseLevel_ ) {
            scale *= this.normalGlucoseLevel_/glInLiver;
        }
        
        x = poissonProcess.sample(x*this.glycogenToGlucose_);
        var fromGlycogen = scale * x;
        
        if( fromGlycogen > this.glycogen )
            fromGlycogen = this.glycogen;
        
        this.glycogen -= fromGlycogen;
        this.glucose += fromGlycogen;
        
        
        scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
        
        x =  poissonProcess.sample(x*this.glycolysisMin_);
        if( x > this.glycolysisMax_*(this.body.bodyWeight_))
            x = this.glycolysisMax_*(this.body.bodyWeight_);

        var toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( toGlycolysis > this.glucose)
            toGlycolysis = this.glucose;
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis*this.glycolysisToLactateFraction_;
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        x = poissonProcess.sample(x*this.gluconeogenesisRate_);
        var gng = x *scale;
        this.glucose += this.body.blood.consumeGNGSubstrates(gng);
        
        //Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate concentration. High lactate concentration (e.g. due to high glycolytic activity) would cause gluconeogenesis to happen even if insulin concentration is high. But then Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
        x = poissonProcess.sample(x*this.gngFromLactateRate_);
        this.glycogen += this.body.blood.gngFromHighLactate(x);
        //console.log("After GNG , liver glucose " + glucose + " mg, liver glycogen " + glycogen + " mg, blood glucose " + body.blood.glucose + " mg, blood lactate " + body.blood.lactate + " mg");
              
        console.log(this.body.portalVein.releaseAminoAcids());
        
        glInLiver = this.glucose/this.fluidVolume_;
        console.log( this.fluidVolume_);
        var bgl = this.body.blood.getBGL();
        
        if( glInLiver > bgl ) {
            var diff = glInLiver - bgl;
            x = poissonProcess.sample(x*this.Glut2VMAX_);
            var g = x*diff/(diff + this.Glut2Km_);
        
            if( g > this.glucose ) {
                console.log("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1);
            }
            this.glucose -= g;
            this.body.blood.addGlucose(g);
            this.body.time_stamp();
            console.log("Liver released glucose " + g);
        }
        //this.body.time_stamp();
         console.log(" Liver:: " + this.glycogen + " " + this.glucose + " " + this.glucose/this.fluidVolume_);
    }
    
    setParams() {
            for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.LIVER.value).entries()) {    		
                switch (key) {
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
Liver.PortalVein  = class {
    	
        constructor(body_) {
        	this.body = body_;
            this.glucose = 0; //mg
            this.branchedAA = 0;	//mg
            this.unbranchedAA = 0; //mg
            this.fluidVolume_ = 5; // dl
        }
        
        processTick() {
        	var bgl = this.body.blood.getBGL();
            var glucoseFromBlood = bgl*this.fluidVolume_;
            this.body.blood.removeGlucose(glucoseFromBlood);
            this.glucose += glucoseFromBlood;
            
            //this.body.time_stamp();
        }
        
        setParams() {
            for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.PORTAL_VEIN.value).entrySet()) {            
                switch (key) {
                    case "fluidVolume_" : { this.fluidVolume_ = value; break; }
                }
            }
        }
        
        getConcentration() {
        	var gl = this.glucose/this.fluidVolume_;
            //this.body.time_stamp();
            //console.log("GL in Portal Vein: " + gl);
         
            return gl;
        }
        
        addGlucose(g) {this.glucose += g;}
        
        getGlucose(){return this.glucose;}
        
        removeGlucose(g) {
        	this.glucose -= g;
            if( this.glucose < 0 ) {
                console.log("PortalVein glucose went negative");
                System.exit(-1);
            }
        }
        
        releaseAllGlucose() {
        	this.body.blood.addGlucose(glucose);
            this.glucose = 0;
        }
        
        addAminoAcids(aa) {
        	this.branchedAA += 0.15*aa;
            this.unbranchedAA += 0.85*aa;
            //this.body.time_stamp();
            //console.log(" PortalVein: bAA " + branchedAA + ", uAA " + unbranchedAA);
        }
        
        releaseAminoAcids() {
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


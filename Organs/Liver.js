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

        this.absorptionPerTick;
        this.toGlycogenPerTick;
        this.fromGlycogenPerTick;
        this.toGlycolysisPerTick;
        this.gngPerTick;
        this.releasePerTick;
    }
    
    //Call private methods
    processTick() {
    	// every thing is stochastic
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        //poisson_distribution variables

        var glycogenToGlucose__ = poissonProcess.sample(1000.0*glycogenToGlucose_);
        var glucoseToGlycogen__ = poissonProcess.sample(1000.0*glucoseToGlycogen_);
        var glycolysisMin__ = poissonProcess.sample(1000.0*glycolysisMin_);
        var gngRate__ = poissonProcess.sample(1000.0*gluconeogenesisRate_);
        var gngFromLactateRate__ = poissonProcess.sample(1000.0*gngFromLactateRate_);
        var Glut2VMAX__ = poissonProcess.sample(1000.0*Glut2VMAX_);

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
            this.absorptionPerTick = g;
            console.log("Liver absorbs from portal vein " + g);
        }
        //release all portalVein glucose to blood
        this.body.portalVein.releaseAllGlucose();

        // glycogen synthesis (depends on insulin and glucose level)

        glInLiver = this.glucose/this.fluidVolume_;
        var scale = this.glInLiver/this.normalGlucoseLevel_;
        //scale *= (1.0 - body.insulinResistance_);
        scale *= this.body.blood.insulin;
        x = poissonProcess.sample(x*this.glucoseToGlycogen_);
        var toGlycogen = scale * x * (this.body.bodyWeight)/1000.0;

        
        if( toGlycogen > this.glucose )
            toGlycogen = this.glucose;
        
        if( toGlycogen > 0 )
        {
            this.glycogen += toGlycogen;
            //this.body.time_stamp();
            //console.log(" glycogen synthesis in liver " + toGlycogen + "mg" );

        }

        this.toGlycogenPerTick = toGlycogen;

        if( this.glycogen > this.glycogenMax_ )
        {
        //if the liver cannot store any more glycogen, we assume that this glucose (which would have been stored as glycogen) is converted to fat.
            //this.body.time_stamp();
            //console.log(" glucose consumed for Lipogenesis in liver " + glycogen - glycogenMax_ + "mg");
            this.body.adiposeTissue.lipogenesis(this.glycogen - this.glycogenMax_);
            this.glycogen = this.glycogenMax_;
        }
        
       
        this.glucose -= this.toGlycogen;
        
        //console.log("After glycogen synthesis in liver, liver glycogen " + glycogen + " mg, live glucose " + glucose + " mg");
        
        //glycogen breakdown (depends on insulin and glucose level)
        
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        glInLiver = this.glucose/this.fluidVolume_;
        
        if( glInLiver > this.normalGlucoseLevel_ ) 
        {
            scale *= this.normalGlucoseLevel_/glInLiver;
        }
        
        x = poissonProcess.sample(x*this.glycogenToGlucose_);
        var fromGlycogen = scale * x * (this.body.bodyWeight)/1000.0;

        
        if( fromGlycogen > this.glycogen )
            fromGlycogen = this.glycogen;
        
        if( fromGlycogen > 0 )
        {
        this.glycogen -= fromGlycogen;
        this.glucose += fromGlycogen;
        
        //this.body.time_stamp();
        //console.log(" glycogen breakdown in liver " + fromGlycogen + "mg" );
        }
        this.fromGlycogenPerTick = fromGlycogen;

        //console.log("After glycogen breakdown in liver, liver glycogen " + glycogen + " mg, liver glucose " + glucose + " mg, blood glucose " + body.blood.glucose + " mg, blood lactate " + body.blood.lactate + " mg" );
        //Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
    
        //Gerich paper: Liver consumes 1.65 micomol per kg per minute to 16.5 micomol per kg per minute of glucose depending upon post-absorptive/post-prandial state.
    
        scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
        
        x =  poissonProcess.sample(x*this.glycolysisMin_);
        x *= (body.bodyWeight)/1000.0;
        if( x > this.glycolysisMax_*(this.body.bodyWeight_))
            x = this.glycolysisMax_*(this.body.bodyWeight_);

        var toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( toGlycolysis > this.glucose)
            toGlycolysis = this.glucose;
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis*this.glycolysisToLactateFraction_;
        this.toGlycolysisPerTick = toGlycolysis;

        //this.body.time_stamp();
        //console.log(" glycolysis in liver " + toGlycolysis + "mg");
        //console.log("After glycolysis , liver glucose " + glucose + " mg, blood lactate " + this.body.blood.lactate + " mg";
    
        //gluconeogenesis. Depends on insulin level and on substrate concentration.

        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        x = poissonProcess.sample(x*this.gluconeogenesisRate_);
        var gng = x *scale * (this.body.bodyWeight)/1000.0;
        gng = this.body.blood.consumeGNGSubstrates(gng);
        if( gng > 0 )
        {
        glucose += gng;
        //this.body.time_stamp();
        //console.log(" gng in liver " + gng + "mg");
        }
        this.gngPerTick = gng;
        
        //Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate concentration. High lactate concentration (e.g. due to high glycolytic activity) would cause gluconeogenesis to happen even if insulin concentration is high. But then Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
        
        x = poissonProcess.sample(x*this.gngFromLactateRate_);
        x *= (this.body.bodyWeight)/1000.0;
        this.glycogen += this.body.blood.gngFromHighLactate(x);
        if( x > 0 )
        {
            this.glucose += x;
            //this.body.time_stamp();
            //console.log(" gng in liver from high lactate " + x + "mg");
        }
        this.gngPerTick += x;
    
        //console.log("After GNG , liver glucose " + glucose + " mg, liver glycogen " + glycogen + " mg, blood glucose " + body.blood.glucose + " mg, blood lactate " + body.blood.lactate + " mg");
              
        //BUKET NEW: 93% of unbranched amino acids in portal vein are retained in Liver, because the leaked amino acids from Intestine consists of 15% branched and 85% unbranched, but after liver consumption the percentage needs to be 70% branched, 30% unbranched. To provide these percentages 93% of unbranched amino acids in portal vein are retained in liver. (From Frayn's book)
    
        body.portalVein.releaseAminoAcids();
        
        //6. consume some glucose to form fatty acids (at configured rate that depends on glucose level)

        /*
        if( body.blood.glucose > body.blood.normalGlucoseLevel_){
            body.blood.consumeGlucose(glucoseToNEFA_);
        }
        */

        glInLiver = this.glucose/this.fluidVolume_;
        var bgl = this.body.blood.getBGL();
        
        this.releasePerTick = 0;

        if( glInLiver > bgl ) 
        {
            var diff = glInLiver - bgl;
            x = poissonProcess.sample(x*this.Glut2VMAX_);
            x *= (body->bodyWeight)/1000.0;
            var g = x*diff/(diff + this.Glut2Km_);
        
            if( g > this.glucose ) {
                console.log("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1);
            }

            this.glucose -= g;
            this.body.blood.addGlucose(g);
            this.releasePerTick = g;

            this.body.time_stamp();
            console.log("Liver released glucose " + g + "mg to blood");
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
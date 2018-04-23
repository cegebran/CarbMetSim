//package sim;
//import java.util.Map.Entry;

//import org.apache.commons.math3.distribution.PoissonDistribution;

//import enums.BodyOrgan;

class Kidney {
    
    constructor(myBody){
    	this.body = myBody;
        
        this.glutamineConsumed_ = 0;
        
        this.glucose = 0;
        this.fluidVolume_ = 10; //dl
        
        this.gluconeogenesisRate_ = 2.0*0.45038975;
        this.gngFromLactateRate_ = 9 * gluconeogenesisRate_; // by default
        
          
        this.Glut2VMAX_ = 30; // mg per kg per minute
        this.Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut1Rate_ = 1; // mg per kg per minute
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559; // mg per kg per minute
        this.glycolysisMax_ = 5 * this.glycolysisMin_;
        
        this.reabsorptionThreshold_ = 11*180.1559/10; //mg/dl equivalent of 11 mmol/l
        this.glucoseExcretionRate_ = 100/(11*180.1559/10); // mg per minute per(mg/dl)
        // As BGL increases from 11 mmol/l to 22 mmol/l, glucose excretion in urine increases from 0 to mg/min to 100mg/min.
        
        this.glucoseAbsorptionPerTick;
        this.glycolysisPerTick;
        this.gngPerTick;
        this.excretionPerTick;
    }
    
    processTick() {
        var x; // to hold the random samples
        x = this.body.bodyWeight_;
        
        var glucoseExcretionRate__ = poissonProcess.sample(1000.0*glucoseExcretionRate_);
        
        var glycolysisMin__ = poissonProcess.sample(1000.0*glycolysisMin_);
        
        var gngRate__ = poissonProcess.sample(1000.0*gluconeogenesisRate_);
        
        var gngFromLactateRate__ = poissonProcess.sample(1000.0*gngFromLactateRate_);
        
        var Glut2VMAX__ = poissonProcess.sample(1000.0*Glut2VMAX_);
        
        var basalAbsorption__ = poissonProcess.sample(1000.0*Glut1Rate_);
        
        var bgl = this.body.blood.getBGL();
        var glInKidney = this.glucose/this.fluidVolume_;
        
        x = Glut2VMAX__;
        x *= this.body.bodyWeight/1000.0;
        var y = basalAbsorption__;
        y *= this.body.bodyWeight/1000.0;
        
        
        /*
        x = poissonProcess.sample(x*this.Glut2VMAX_);
        var y = poissonProcess.sample(x*this.Glut1Rate_);
        */
        
        if(glInKidney < bgl) {
            //BUKET NEW: In addition to increased glucose production, renal glucose uptake is increased in both the post-absorptive and postprandial
        	//states in patientswithT2DM[45,46]. So it depends on insulin resistance. (Gerich paper)
            
            var diff = bgl - glInKidney;
            var g = (1 + this.body.insulinResistance_)*x*diff/(diff + this.Glut2Km_);
            // uptake increases for higher insulin resistance.
            // may want to change this formula later - Mukul
            g += y; // basal absorption
            
            this.body.blood.removeGlucose(g);
            this.glucose += g;
            
            body.time_stamp();
            console.log("Kidneys removing " + g + " mg of glucose frm blood, basal " + y);
            
            this.glucoseAbsorptionPerTick = g;
        }
        else
        {
            var diff = glInKidney - bgl;
            var g = (1 + this.body.insulinResistance_)*x*diff/(diff + this.Glut2Km_);
            
            if(g > this.glucose)
            {
                console.log("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1); ///=======================================================================
            }
            
            this.glucose -= g;
            this.body.blood.addGlucose(g);
            
            body.time_stamp();
            console.log("Kidneys releasing " + g + " mg of glucose to blood");
            
            this.glucoseAbsorptionPerTick = -1 * g;
        }
        
        //Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
    
        //Gerich says:
        //The metabolic fate of glucose is different in different regions of the kidney. Because of its low oxygen tension, and low levels of oxidative enzymes, the renal medulla is an obligate user of glucose for its energy requirement and does so anaerobically. Consequently, lactate is the main metabolic end product of glucose taken up in the renal medulla, not carbon dioxide (CO2) and water. In contrast, the renal cortex has little  glucose phosphorylating capacity but a high level of oxidative enzymes. Consequently, this part of the kidney does not take up and use very much glucose, with oxidation of FFAs acting as the main source of energy. A major energy-requiring process in the kidney is the reabsorption of glucose from glomerular filtrate in the proximal convoluted tubule.
                
        var scale = (1.0 - this.body.insulinResistance_)*(this.body.blood.insulin);
        
        //myegine is suppose to be called, not poissonProcess
        //x = poissonProcess.sample(x*this.glycolysisMin_);
        
        x = glycolysisMin__;
        x *= this.body.bodyWeight_/1000;
        
        
        if( x > this.glycolysisMax_*(this.body.bodyWeight_)) 
        	x = this.glycolysisMax_*(this.body.bodyWeight_);
        
        var toGlycolysis = x + scale * ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( toGlycolysis > this.glucose)
            toGlycolysis = this.glucose;
        
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis;
        
        body.time_stamp();
        console.log("Glycolysis in kidney " + toGlycolysis + " , blood lactate " + this.body.blood.lactate + " mg");
        
        this.glycolysisPerTick = toGlycolysis;
        
        //gluconeogenesis. Depends on insulin level and on substrate concentration.
    
        //4. release some glucose by consuming lactate/alanine/glycerol (gluconeogenesis)(the amount depends on body state and the concentration of lactate/alanine/glycerol in blood; when insulin is high (fed state) glycolysis is favored and when glucagon high (compared to insulin; starved state) gluconeogenesis is favored)
       
        scale = 1 - (this.body.blood.insulin)*(1 - (this.body.insulinResistance_));
        
        
        //x = poissonProcess.sample(x*this.gluconeogenesisRate_);
        x = gngRate__;
        x *= this.body.bodyWeight_/1000;
        
        var gng = x * scale;
        gng = this.body.blood.consumeGNGSubstrates(gng);
        
        if(gng > 0){
            this.glucose += gng;
            body.time_stamp();
            console.log("GNG in Kidneys " + gng + "mg");
        }
        
        this.gngPerTick = gng;

        x = gngFromLactateRate__;
        x *= this.body.bodyWeight/1000;
        x = this.body.blood.gngFromHighLactate(x);
        
        if(x > 0){
            this.glucose += x;
            
            body.time_stamp();
            console.log("GNG from lactate in Kidneys " + x + "mg");
        }
        
        this.gngPerTick += x;
        
        console.log("After GNG in kidney, glucose in kidney " + glucose + " mg blood lactate " + this.body.blood.lactate + " mg");
        
       if(this.body.blood.glutamine > this.glutamineConsumed_){
           this.body.blood.glutamine -= this.glutamineConsumed_;
       }
       else{
           this.body.blood.glutamine = 0;
       }
        
        //Glucose excertion in urine
        
        bgl = this.body.blood.getBGL();
        
        this.excretionPerTick = 0;
        
        if(bgl > this.reabsorptionThreshold_){
            
            x = glucoseExcretionRate__;
            
            x = x/1000;
            
            this.excretionPerTick = x * (bgl - this.reabsorptionThreshold_);
            this.body.blood.removeGlucose(excretionPerTick);
            
            body.time_stamp();
            console.log("glucose excertion in urine " + g);
        }
        
        
        body.time_stamp();
        console.log("Kidneys:: GlucoseAbsorption " + this.glucoseAbsorptionPerTick);
        
        body.time_stamp();
        console.log("Kidneys:: Glycolysis " + this.glycolysisPerTick);
        
        body.time_stamp();
        console.log("Kidneys:: GNG " + this.gngPerTick);
        
        body.time_stamp();
        console.log("Kidneys:: Excertion " + this.excretionPerTick);
    }
    
    setParams() {
    	for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.KIDNEY.value).entries()) {
            switch (key) {
			    case "fluidVolume_" : { this.fluidVolume_ = value; break; }
    			case "Glut2VMAX_" : { this.Glut2VMAX_ = value; break; }
    			case "Glut2Km_" : { this.Glut2Km_ = value; break; }
    			case "Glut1Rate_" : { this.Glut1Rate_ = value; break; }
    			case "glycolysisMin_" : { this.glycolysisMin_ = value; break; }
    			case "glycolysisMax_" : { this.glycolysisMax_ = value; break; }
    			case "gluconeogenesisRate_" : { this.gluconeogenesisRate_ = value; break; }
    			case "glutamineConsumed_" : { this.glutamineConsumed_ = value; break; }
    		}
    	}
    }
}

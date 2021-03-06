//package sim;

//import java.util.Map.Entry;

//import org.apache.commons.math3.distribution.PoissonDistribution;

class Muscles {
    constructor(myBody) {
    	this.body = myBody;
    	this.glycogenMax_ = 0.4*(this.body.bodyWeight_)*15000.0; //40% of body weight is muscles
        this.glycogen = this.glycogenMax_;
        this.glucose = 0;
        this.volume_ = 10;
        
        this.bAAToGlutamine_ = 0;
        
        this.basalGlucoseAbsorbed_ = 0.344; //mg per kg body weight per minute 
        
        //See the explanation in processTick()
        this.glycolysisMin_ = 0.4; //mg per kg per minute
        // 2.22 micromol per kg per minute = 2.22*180.1559/1000 mg per kg per minute = 0.4 mg per per minute
        this.glycolysisMax_ = 9*this.glycolysisMin_; //mg per kg per minute
        
        this.Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
        this.Glut4VMAX_ = 20.0; //mg per kg per minute
        
        this.glucoseOxidationFraction_ = 0.5;
        
        this.glucoseAbsorbedPerTick;
        this.glycogenSynthesizedPerTick;
        this.glycogenBreakdownPerTick;
        this.oxidationPerTick;
        this.glycogenOxidizedPerTick;
        this.glycolysisPerTick;
    }
    
    processTick() {
        var rand__ = poissonProcess.sample(100);
        
        var glycolysisMin__ = poissonProcess.sample(1000.0 * this.glycolysisMin_);        
        
        var basalAbsorption__ = poissonProcess.sample(1000.0 * this.basalGlucoseAbsorbed_);
        
        var Glut4VMAX__ = poissonProcess.sample(1000.0 * this.Glut4VMAX_);
        
        var baaToGlutamine__ = poissonProcess.sample(1000.0 * this.bAAToGlutamine_);
        
        this.glucoseAbsorbedPerTick = 0;
        this.glycogenSynthesizedPerTick = 0;
        this.glycogenBreakdownPerTick = 0;
        this.glycogenOxidizedPerTick = 0;
        this.oxidationPerTick = 0;
        
        var x; // to hold the random samples
        var currEnergyNeed = this.body.currentEnergyExpenditure();

        if( this.body.isExercising() ) {
            x =  rand__;
            this.oxidationPerTick = .1 * (x/100) * 1000 * (currEnergyNeed/4);
        }
        
        if(this.glucose >= this.oxidationPerTick){
            this.glucose -= this.oxidationPerTick;
        }
        else{
            var g = this.oxidationPerTick - this.glucose;
            this.glucose = 0;
            this.body.blood.removeGlucose(g);
            this.glucoseAbsorbedPerTick += g;
        }
            
        var glycogenShare;
        var intensity = 0;//this.body.exerciseTypes[this.body.currExercise].intensity;
        
        if(intensity >= 6){
            glycogenShare = .3;
        }
        else{
            if( intensity < 3.0 )
            {
                glycogenShare = 0;
            }
            else
            {
                glycogenShare = 0.3*(intensity - 3.0 )/3.0;
            }
        }
        
        x = rand__;
        this.glycogenOxidizedPerTick = glycogenShare * (x/100) * 1000 * (currEnergyNeed/4);
        
        this.glycogen -= this.glycogenOxidizedPerTick;
        this.glycogenBreakdownPerTick += this.glycogenOxidizedPerTick;
        
        if(intensity < 18){
            x = glycolysisMin__;
            x = x * this.body.bodyWeight_ / 1000;
            
            if(x > this.glycolysisMax_ * this.body.bodyWeight_){
                x = this.glycolysisMax_ * this.body.bodyWeight_;
            }
            
            this.glycolysisPerTick = x + ((intensity - 1) / 17) * ((this.glycolysisMax_ + this.body.bodyWeight_) - x);
        }
        else{
            this.glycolysisPerTick = this.glycolysisMax_ * this.body.bodyWeight_;
        }
        
        this.glycogen -= this.glycolysisPerTick;
        this.glycogenBreakdownPerTick += this.glycolysisPerTick;
        this.body.blood.lactate += this.glycolysisPerTick;
        
        var kcalgenerated = ((this.oxidationPerTick + this.glycogenOxidizedPerTick) * .004) + (this.glycolysisPerTick * .004/15);
        
        if(kcalgenerated < currEnergyNeed){
            this.body.adiposeTissue.consumeFat(currEnergyNeed - kcalgenerated);
        }
        
        else{
            x = basalAbsorption__;
            x = x * this.body.bodyWeight_ / 1000;
            
            this.body.blood.removeGlucose();
            this.glucoseAbsorbedPerTick = x;
            this.glucose += x;
            
            var bgl = this.body.blood.getBGL();
            var glMuscles = this.glucose / this.volume_;
            var diff = bgl - glMuscles;
            
            var scale = 1 - this.body.insulinResistance_ * this.body.insulin;
            var g;
            
            if(diff > 0){
                x = Glut4VMAX__;
                x = x * this.body.bodyWeight_ / 1000;
                g = scale * x * diff / (diff + this.Glut4Km_);
                
                this.body.blood.removeGlucose(g);
                this.glucoseAbsorbedPerTick += g;
                this.glucose += g;
            }
            
            scale = 1 - this.body.insulinResistance_ * this.body.blood.insulin;
            
            x = glycolysisMin__;
            x = x * this.body.bodyWeight_ / 1000;
            
            if(x > this.glycolysisMax_ * this.body.bodyWeight_){
                x = this.glycolysisMax_ * this.body.bodyWeight_;
            }
            
            this.glycolysisPerTick = x + scale * (this.glycolysisMax_ * this.body.bodyWeight_ - x);
            
            g = this.glycolysisPerTick;
            
            if(g <= this.glucose){
                this.glucose -= g;
                this.body.blood.lactate += g;
            }
            else{
                g -= this.glucose;
                this.body.blood.lactate += this.glucose;
                this.glucose = 0;
                
                if(this.glycogen >= g){
                    this.glycogen -= g;
                    this.body.blood.lactate += g;
                    this.glycogenBreakdownPerTick += g;
                }
                else{
                    this.body.blood.lactate += this.glycogen;
                    this.glycolysisPerTick = this.glycolysisPerTick - g + this.glycogen;
                    this.glycogenBreakdownPerTick += this.glycogen;
                    this.glycogen = 0;
                }
            }
            
            this.oxidationPerTick = .5 * this.glucose;
            this.glucose *= .5;
            
            if(this.glucose > 0){
                g = this.glucose;
                
                if(this.glycogen + g > this.glycogenMax_){
                    g = this.glycogenMax_ - this.glycogen;
                }
                this.glycogen += g;
                this.glycogenSynthesizedPerTick += g;
                this.glucose -= g;
            }
            
            var kcalgenerated = (this.oxidationPerTick * .004) + (this.glycolysisPerTick * .004 / 15);
            
            if(kcalgenerated < currEnergyNeed){
                this.body.adiposeTissue.consumeFat(currEnergyNeed-kcalgenerated);
            }
        }
        
        if(this.glycogen < 0){
            this.body.time_stamp();
            console.log("Glycogen went negative.");
        }
        
        this.body.time_stamp();
        console.log("Muscles:: GlucoseAbsorbed: " + this.glucoseAbsorbedPerTick);
        
        this.body.time_stamp();
        console.log("Muscles:: GlycogenSynthesis: " + this.glycogenSynthesizedPerTick);
        
        this.body.time_stamp();
        console.log("Muscles:: GlycogenBreakdown: " + this.glycogenBreakdownPerTick);
        
        this.body.time_stamp();
        console.log("Muscles:: glycogen: " + this.glycogen);
        
        this.body.time_stamp();
        console.log("Muscles:: Oxidation: " + this.oxidationPerTick);
        
        this.body.time_stamp();
        console.log("Muscles:: GlycogenOxidation: " + this.glycogenOxidizedPerTick);
        
        this.body.time_stamp();
        console.log("Muscles:: Glycolysis: " + this.glycolysisPerTick); 
        
        this.body.time_stamp();
        console.log("Muscles:: Glucose: " + this.glucose); 
    }
   
    setParams() {
    	for(var [key, value] of this.body.metabolicParameters.get(this.body.bodyState.state).get(BodyOrgan.MUSCLES.value).entries()) {
    		switch (key) {
    			case "Glut4Km_" : { this.Glut4Km_ = key; break; }
    			case "Glut4VMAX_" : { this.Glut4VMAX_ = key; break; }
    			case "basalGlucoseAbsorbed_" : { this.basalGlucoseAbsorbed_ = key; break; }
    			case "glucoseOxidationFraction_" : { this.glucoseOxidationFraction_ = key; break; }
    			case "bAAToGlutamine_" : { this.bAAToGlutamine_ = key; break; }
    			case "glycolysisMin_" : { this.glycolysisMin_ = key; break; }
    			case "glycolysisMax_" : { this.glycolysisMax_ = key; break; }
    		}
    	}
    }
}

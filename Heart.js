import "Blood.js";
import "Stomach.js";
import "Intestine.js";

export class Heart {
	constructor(myBody){
		this.body = mybody;
		this.lactateOxidized_ = 0;
    
    	this.basalGlucoseAbsorbed_ = 14; //mg per minute
    	//Skeletal Muscle Glycolysis, Oxidation, and Storage of an Oral Glucose Load- Kelley et.al.
    
   		this.Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
    	this.Glut4VMAX_ = 0; //mg per kg per minute

    	this.oxidationPerTick = 0;
	}

	processTick(){

    	var basalAbsorption = (1.0) * (this.basalGlucoseAbsorbed__(SimCtl.myEngine()))/1000.0;
    
    	this.body.blood.removeGlucose(basalAbsorption);
    
    	var oxidationPerTick = basalAbsorption;

    	// Absorption via GLUT4
    

    	var bgl = (1.0) * (this.body.blood.getBGL());
    	var scale = (1.0) * (1.0 - this.body.insulinResistance_) * (this.body.blood.insulinLevel) * (this.body.bodyWeight_);
    	var g = (scale * this.Glut4VMAX_*bgl/(bgl + this.Glut4Km_);
    
    	this.body.blood.removeGlucose(g);

    	oxidationPerTick += g;
	}
	
	/*void setParams() {
	    for( var itr = this.body.metabolicParameters[this.body.bodyState][HEART].begin();
	        itr != this.body.metabolicParameters[this.body.bodyState][HEART].end(); itr = itr.next())
	    {

	        if(itr.first.compare("lactateOxidized_") == 0)
	        {
	            lactateOxidized_ = itr.second;
	        }
	        
	        if(itr.first.compare("basalGlucoseAbsorbed_") == 0)
	        {
	            basalGlucoseAbsorbed_ = itr.second;
	        }
	        
	        if(itr.first.compare("Glut4Km_") == 0)
	        {
	            Glut4Km_ = itr.second;
	        }
	        
	        if(itr.first.compare("Glut4VMAX_") == 0)
	        {
	            Glut4VMAX_ = itr.second;
	        }
	    }
	}*/
}
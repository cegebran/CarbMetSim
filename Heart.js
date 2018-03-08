class Heart {
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

    	var basalAbsorption = (1.0) * (basalGlucoseAbsorbed__(SimCtl.myEngine()))/1000.0;
    
    	body.blood.removeGlucose(basalAbsorption);
    
    	oxidationPerTick = basalAbsorption;

    	// Absorption via GLUT4
    

    	var bgl = (1.0) * (body.blood.getBGL());
    	var scale = (1.0) * (1.0 - body.insulinResistance_) * (body.blood.insulinLevel) * (body.bodyWeight_);
    	var g = (scale * Glut4VMAX_*bgl/(bgl + Glut4Km_);
    
    	body.blood.removeGlucose(g);

    	oxidationPerTick += g;
	}
	
setParams() {
	    for( var itr = body.metabolicParameters[body.bodyState][HEART].begin();
	        itr != body.metabolicParameters[body.bodyState][HEART].end(); itr = itr.next())
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
	}
}
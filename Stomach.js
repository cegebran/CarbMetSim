Class Stomach{
    constructor(myBody)
    {
        this.body = myBody;

        this.RAG = 0;
        this.SAG = 0;
        this.protein = 0;
        this.fat = 0;

        this.stomachEmpty = true;

        this.geConstant_ = 100.0; // mg
        this.geSlopeMin_ = 0.01; 
    }

    processTick()
    {
    	//send some chyme to the intestine.

    	//We assume that the nutrient composition of the chyme is same as that of the food in the stomach.

    	//The amount of chyme leaking out of stomach during a minute is equal to a certain minimum
    	//plus a part proportional to the total amount of chyme present in the stomach at that time.
    	//The proportionality constant depends on the energy density of the chyme. If the chyme is all
    	//fat, its energy density would be 9kcal/g. If it is all carbs, the energy density is 4kcal/g.
    	//The proportionality constant should decrease with increase in the energy density of the chyme.

    	//When we consider the fraction of leaked chyme that is dependent on the total amount of food in the
    	// stomach, the energy content should be same when the stomach has 9grams of carbs or 4 grams of fat.
    	//Energy leaked when the stomach has x grams of fat: k9*x*1000*9 cal
    	//Energy leaked when the stomach has x grams of carbs: k4*x*1000*4 cal

    	//Hence

    	//k9*x*1000*9 = k4*x*1000*4 
    	//=>k9*9 = k4*4
    	//=> k4 = 9*k9/4
    	//Similarly
    	//k5 = 9*k9/5

    	//So, we just need to know the proportinality constant k9 (geSlopeMin_) for pure fat.


    	//Chyme leakage does not change the relative fraction of carbs/fats/proteins in the chyme left in the stomach. 

    	if( stomachEmpty )
    		return;

        	//static std::poisson_distribution<int> geConstant__ (1000.0*geConstant_);

        var geConstant = (1.0) * ((geConstant__(SimCtl::myEngine()))/1000.0);
    	var totalFood = (1.0) * ( RAG+SAG+protein+fat);
    	// calorific density of the food in stomach
    	var calorificDensity = (1.0) * ((4.0*(RAG+SAG+protein) + 9.0*fat)/totalFood); 
    	var geSlope = (1.0) * (9.0 * geSlopeMin_/calorificDensity);

        var geBolus = (1.0) * (geConstant + geSlope*totalFood);

        	SimCtl.time_stamp();
    	Console.log("Gastric Emptying:: Total Food " + totalFood + " Calorific Density " + calorificDensity
    	+ " geSlopeMin " + geSlopeMin + " geSlope " + geSlope + " geConstant " + geConstant 
    	+ " Bolus " + geBolus + endl);

    	if( geBolus > totalFood )
    		geBolus = totalFood;

    	double ragInBolus = (1.0) * (geBolus*RAG/totalFood);
    	var sagInBolus = (1.0) * (geBolus*SAG/totalFood);
    	var proteinInBolus = (1.0) * (geBolus*protein/totalFood);
    	var fatInBolus = (1.0) * (geBolus*fat/totalFood);

    	RAG -= ragInBolus;
    	SAG -= sagInBolus;
    	protein -= proteinInBolus;
    	fat -= fatInBolus;

    	body.intestine.addChyme(ragInBolus,sagInBolus,proteinInBolus,fatInBolus);

        	if( (RAG == 0) && (SAG == 0) && (protein == 0) && (fat == 0) )
        	{
            	stomachEmpty = true;
            	body.stomachEmpty();
        	}
        
        SimCtl.time_stamp();
        Console.log("Stomach : SAG " + SAG + " RAG " + RAG +  " protein " + protein + " fat " + fat + endl); 
    }

    addFood(unsigned foodID, double howmuch)
    {
        // howmuch is in grams
        
        if( howmuch == 0 )
            return;
        //name is type string
        var name = body.foodTypes[foodID].name_;
        
        var numServings = (1.0) * (howmuch/(body.foodTypes[foodID].servingSize_));
        // add this. ?
        RAG += 1000.0*numServings*(body.foodTypes[foodID].RAG_); // in milligrams
        SAG += 1000.0*numServings*(body.foodTypes[foodID].SAG_); // in milligrams
        protein += 1000.0*numServings*(body.foodTypes[foodID].protein_); // in milligrams
        fat += 1000.0*numServings*(body.foodTypes[foodID].fat_); // in milligrams
        
        if( (RAG > 0) || (SAG > 0) || (protein > 0) || (fat > 0) )
            stomachEmpty = false;
        
        SimCtl.time_stamp();
        Console.log("Adding " + howmuch + " grams of " + name + " to stomach" + std::endl);
        
    }

    /*
    setParams()
    {
        for( ParamSet::iterator itr = body.metabolicParameters[body.bodyState][STOMACH].begin();
            itr != body.metabolicParameters[body.bodyState][STOMACH].end(); itr++)
        {
            if(itr.first.compare("geConstant_") == 0)
            {
                    geConstant_ = itr.second;
            }
            if(itr.first.compare("geSlopeMin_") == 0)
            {
                    geSlopeMin_ = itr.second;
            }
        }
    }
    */
}
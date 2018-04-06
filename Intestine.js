import "HumanBody.js";
import "Blood.js";
import "AdisposeTissue.js";
import "Stomach.js";

export class Intestine{
    constructor(MyBody)
    {
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
    }

    addChyme(rag, sag, proteinInChyme, fat)
    {
    	Chyme c;
    	c.RAG = rag;
    	c.SAG = sag;
    	c.origRAG = rag;
    	c.origSAG = sag;
    	c.ts = SimCtl.ticks;
    	chyme.push_back(c);

    	this.protein += proteinInChyme;

        // very simple processing of fat for now
        this.body.adiposeTissue.addFat(fat);
    }

    processTick()
    {
    	// digest some chyme
    	for(list<Chyme>::iterator itr = chyme.begin(); itr != chyme.end(); itr++)
    	{
        		var RAGConsumed = 0.0;
        
        		var t = SimCtl.ticks - (*itr).ts;

    		//we assume that RAG appears in blood as per a normal distributon with a user specified mean/stddev
        
        		if( t == 0 )
            		RAGConsumed = (itr.origRAG)*0.5*(1 + erf((t - this.RAG_Mean_)/(this.RAG_StdDev_*sqrt(2))));
        		else
            		RAGConsumed = (itr.origRAG)*0.5*( erf((t-this.RAG_Mean_)/(this.RAG_StdDev_*sqrt(2))) -erf((t-1-this.RAG_Mean_)/(this.RAG_StdDev_*sqrt(2))) );
        
        		if( itr.RAG < RAGConsumed )
            		RAGConsumed = itr.RAG;
        
    		if( itr.RAG < 0.01*(itr.origRAG) )
    			RAGConsumed = itr.RAG;

        		itr.RAG -= RAGConsumed;
        		this.glucoseInLumen += RAGConsumed;

        		// digest some SAG now
        
        		var SAGConsumed = 0;
        
            	// we assume that SAG appears in blood as per a normal distributon with a user specified mean/stdev
            
            	if( t == 0 )
                		SAGConsumed = (itr.origSAG)*0.5*(1 + erf((t - this.SAG_Mean_)/(this.SAG_StdDev_*sqrt(2))));
            	else
                		SAGConsumed = (itr.origSAG)*0.5*( erf((t-this.SAG_Mean_)/(this.SAG_StdDev_*sqrt(2))) -erf((t-1-this.SAG_Mean_)/(this.SAG_StdDev_*sqrt(2))) );
                    
            	if( itr.SAG < SAGConsumed )
                		SAGConsumed = itr.SAG;
            
    		if( itr.SAG < 0.01*(itr.origSAG) )
    			SAGConsumed = itr.SAG;

            	itr.SAG -= SAGConsumed;
            	this.glucoseInLumen += SAGConsumed;

        		//SimCtl::time_stamp();
        		//cout << " Chyme:: RAG " << itr.RAG << " SAG " << itr.SAG << " origRAG " << itr.origRAG 
    		//<< " origSAG " << itr.origSAG << " glucoseInLumen " << this.glucoseInLumen << " RAGConsumed " 
    		//<< RAGConsumed << " SAGConsumed " << SAGConsumed << endl;

        		if( itr.RAG == 0 && itr.SAG == 0 )
        			itr = chyme.erase(itr);
    	}

        	// some of the glucose is absorbed by the enterocytes (some of which moves to the portal vein)
        	 absorbGlucose();
        	 absorbAminoAcids();
    }

    absorbGlucose()
    {
        var x; // to hold the random samples
        var activeAbsorption = 0;
        var passiveAbsorption = 0;
        var toGlycolysis = 0;
        var toPortalVein = 0;
        
        var glLumen = 0;
        var glEnterocytes = 0;
        var glPortalVein = 0;
        
        x = this.body.bodyWeight_;
        
        //static std::poisson_distribution<int> basalAbsorption__ (1000.0*this.sglt1Rate_);
        //static std::poisson_distribution<int> Glut2VMAX_In__ (1000.0*Glut2VMAX_In_);
        //static std::poisson_distribution<int> this.Glut2VMAX_Out__ (1000.0*Glut2VMAX_Out_);
        //static std::poisson_distribution<int> this.glycolysisMin__ (1000.0*this.glycolysisMin_); 
        // first, absorb some glucose from intestinal lumen
        
        if( this.glucoseInLumen > 0 )
        {
            if ( this.fluidVolumeInLumen_ <= 0 )
            {
                //cout << "Intestine.absorbGlucose" << endl;
                exit(-1);
            }
        
            // Active transport first
            activeAbsorption = (1.0)*(basalAbsorption__(SimCtl.myEngine()))/1000.0;
            
            if( activeAbsorption >= this.glucoseInLumen )
            {
                activeAbsorption = this.glucoseInLumen;
                this.glucoseInEnterocytes += activeAbsorption;
    	    this.glucoseInLumen -= activeAbsorption;
            }
            else
            {
                this.glucoseInEnterocytes += activeAbsorption;
    	    this.glucoseInLumen -= activeAbsorption;
        
                //passive transport via GLUT2s now
                glLumen = this.glucoseInLumen/this.fluidVolumeInLumen_;
                glEnterocytes = this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
                var diff = (1.0)*(glLumen - glEnterocytes);
                
                if( diff > 0 )
                {
                    // glucose concentration in lumen decides the number of GLUT2s available for transport.
                    // so, Vmax depends on glucose concentration in lumen
                    x = (1.0)*(this.Glut2VMAX_In__(SimCtl.myEngine()))/1000.0;
                    var effectiveVmax = (1.0)*(x*glLumen/this.peakGlucoseConcentrationInLumen);
        
                    if (effectiveVmax > this.Glut2VMAX_In_)
                        effectiveVmax = this.Glut2VMAX_In_;
                    
                    passiveAbsorption = effectiveVmax*diff/(diff + this.Glut2Km_In_);
        
                    if ( passiveAbsorption > this.glucoseInLumen )
                        passiveAbsorption = this.glucoseInLumen;
                    
                    this.glucoseInEnterocytes += passiveAbsorption;
                    this.glucoseInLumen -= passiveAbsorption;
                }
            }
        }
        
        //release some glucose to portal vein via Glut2s
        glEnterocytes = this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
        glPortalVein = this.body.portalVein.getConcentration();
        
        
        var diff = (1.0)*(glEnterocytes - glPortalVein);
        
        if(diff > 0 )
        {
            x = (1.0)*((this.Glut2VMAX_Out__(SimCtl.myEngine()))/1000.0);
            toPortalVein = x*diff/(diff + this.Glut2Km_Out_);
            
            if( toPortalVein > this.glucoseInEnterocytes )
                toPortalVein = this.glucoseInEnterocytes;
            
            this.glucoseInEnterocytes -= toPortalVein;
            body.portalVein.addGlucose(toPortalVein);
        }
        
        // Modeling the glucose consumption by enterocytes: glycolysis to lactate.
        
        //Glycolysis. Depends on insulin level. Consumed glucose becomes lactate (Ref: Gerich).
        
        var scale = (1.0)*((1.0 - this.body.insulinResistance_)*(this.body.blood.insulinLevel));
        
        x = (1.0)*(this.glycolysisMin__(SimCtl.myEngine()));
        x *= this.body.bodyWeight_/1000.0;
        if( x > this.glycolysisMax_*(this.body.bodyWeight_))
            x = this.glycolysisMax_*(this.body.bodyWeight_);
        
        toGlycolysis = x + scale* ( (this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( toGlycolysis > this.glucoseInEnterocytes)
            toGlycolysis = this.glucoseInEnterocytes;
        
        this.glucoseInEnterocytes -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis;
        
        // log all the concentrations (in mmol/l)
        // peak concentrations should be 200mmol/l (lumen), 100mmol/l(enterocytes), 10mmol/l(portal vein)
        
        glLumen = (10.0/180.1559)*this.glucoseInLumen/this.fluidVolumeInLumen_; // in mmol/l
        glEnterocytes = (10.0/180.1559)*this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
        x = this.body.portalVein.getConcentration();
        glPortalVein = (10.0/180.1559)*x;

        SimCtl.time_stamp();
        cout << " glLumen: " << glLumen << " glEntero " << glEnterocytes << " glPortal " << glPortalVein << 
    	", " << x << " activeAbsorption " << activeAbsorption << " passiveAbsorption " << passiveAbsorption
    	 << " toGlycolysis " << toGlycolysis << " toPortal " << toPortalVein << endl;
    }

    //The BCAAs, leucine, isoleucine, and valine, represent 3 of the 20 amino acids that are used in the formation of proteins. Thus, on average, the BCAA content of food proteins is about 15% of the total amino acid content."Interrelationship between Physical Activity and Branched-Chain Amino Acids"

    //The average content of glutamine in protein is about %3.9. "The Chemistry of Food" By Jan Velisek
    //Do we consider the dietary glutamine? I did not consider in my code but I can add if we need it.

    //Looks like cooking destroys dietary glutamine. So, no need to consider diet as source of glutamine.
    //-Mukul

    absorbAminoAcids()
    {
        //static std::poisson_distribution<int> this.aminoAcidsAbsorptionRate__(1000.0*this.aminoAcidsAbsorptionRate_);
        //static std::poisson_distribution<int> this.glutamineOxidationRate__(1000.0*this.glutamineOxidationRate_);
        
        var absorbedAA = (1.0) * (this.aminoAcidsAbsorptionRate__(SimCtl.myEngine()))/1000.0;
        
        if( this.protein < absorbedAA )
        {
            absorbedAA = this.protein;
        }
        
        this.body.portalVein.addAminoAcids(absorbedAA);
        this.protein -= absorbedAA;
        
        //Glutamine is oxidized
        var g = (1.0) * (this.glutamineOxidationRate__(SimCtl.myEngine()))/1000.0;
        if( this.body.blood.glutamine < g )
        {
                this.body.blood.alanine += this.glutamineToAlanineFraction_*(this.body.blood.glutamine);
                this.body.blood.glutamine = 0;
        }
        else
        {
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
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
        this.Glut2Km_In_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut2VMAX_In_ = 700; //mg
        this.Glut2Km_Out_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
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

    addChyme(rag, sag, proteinInChyme, fat)
    {
    	var c = new Chyme();
    	c.RAG = rag;
    	c.SAG = sag;
    	c.origRAG = rag;
    	c.origSAG = sag;
    	c.ts = this.body.ticks;
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
    
    absorbGlucose()
    {
        var x; // to hold the random samples
        var activeAbsorption = 0;
        var passiveAbsorption = 0;
        
        var glLumen = 0;
        var glEnterocytes = 0;
        var glPortalVein = 0;
        
        var basalAbsorption__ = poissonProcess.sample(1000.0 * this.sglt1Rate_);
        var Glut2VMAX_In__ = poissonProcess.sample(1000.0 * this.Glut2VMAX_In_);
        var Glut2VMAX_Out__ = poissonProcess.sample(1000.0 * this.Glut2VMAX_Out_);
        var glycolysisMin__ = poissonProcess.sample(1000.0 * this.glycolysisMin_);
        
        if(this.glucoseInLumen > 0)
        {
            if (this.fluidVolumeInLumen_ <= 0)
            {
                console.log("Intestine:: Absorb glucose.");
                //cout << "Intestine.absorbGlucose" << endl;
                exit(-1);
            }
        
            // Active transport first
            activeAbsorption = basalAbsorption__ / 1000;
            
            if(activeAbsorption >= this.glucoseInLumen)
            {
                activeAbsorption = this.glucoseInLumen;
                this.glucoseInEnterocytes += activeAbsorption;
    	        this.glucoseInLumen = 0;
            }
            else
            {
                this.glucoseInEnterocytes += activeAbsorption;
    	        this.glucoseInLumen -= activeAbsorption;
        
                //passive transport via GLUT2s now
                glLumen = this.glucoseInLumen/this.fluidVolumeInLumen_;
                glEnterocytes = this.glucoseInEnterocytes/this.fluidVolumeInEnterocytes_;
                var diff = (1.0)*(glLumen - glEnterocytes);
                
                if(diff > 0)
                {
                    // glucose concentration in lumen decides the number of GLUT2s available for transport.
                    // so, Vmax depends on glucose concentration in lumen
                    x = Glut2VMAX_In__ / 1000;
                    var effectiveVmax = (1.0) *(x*glLumen/this.peakGlucoseConcentrationInLumen);
        
                    if (effectiveVmax > this.Glut2VMAX_In_)
                        effectiveVmax = this.Glut2VMAX_In_;
                    
                    passiveAbsorption = effectiveVmax*diff/(diff + this.Glut2Km_In_);
        
                    if (passiveAbsorption > this.glucoseInLumen )
                        passiveAbsorption = this.glucoseInLumen;
                    
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
        
        if(diff > 0)
        {
            x = Glut2VMAX_Out__ / 1000;
            this.toPortalVeinPerTick = x*diff/(diff + this.Glut2Km_Out_);
            
            if(this.toPortalVeinPerTick > this.glucoseInEnterocytes )
                this.toPortalVeinPerTick = this.glucoseInEnterocytes;
            
            this.glucoseInEnterocytes -= this.toPortalVeinPerTick;
            this.body.portalVein.addGlucose(this.toPortalVeinPerTick);
        }
        
        // Modeling the glucose consumption by enterocytes: glycolysis to lactate.
        
        //Glycolysis. Depends on insulin level. Consumed glucose becomes lactate (Ref: Gerich).
        
        var scale = (1.0)*((1.0 - this.body.insulinResistance_)*(this.body.blood.insulin));
        
        //x = (1.0)*(poissonProcess.sample(1000.0*this.glycolysisMin_));
        x = glycolysisMin__;
        x *= this.body.bodyWeight_/1000.0;
        if(x > this.glycolysisMax_*(this.body.bodyWeight_))
            x = this.glycolysisMax_*(this.body.bodyWeight_);
        
        this.glycolysisPerTick = x + scale * ((this.glycolysisMax_*(this.body.bodyWeight_)) - x);
        
        if( this.glycolysisPerTick > this.glucoseInEnterocytes){
            this.body.blood.removeGlucose(this.glycolysisPerTick - this.glucoseInEnterocytes);
            this.glucoseInEnterocytes = 0;
        }
        else{
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
        console.log("Intestine:: glLumen: " + glLumen + " glEntero: " + glEnterocytes + " glPortal: " + glPortalVein + ", activeAbsorption: " + activeAbsorption + " passiveAbsorption: " + passiveAbsorption);
    }
    
    //The BCAAs, leucine, isoleucine, and valine, represent 3 of the 20 amino acids that are used in the formation of proteins. Thus, on average, the BCAA content of food proteins is about 15% of the total amino acid content."Interrelationship between Physical Activity and Branched-Chain Amino Acids"

    //The average content of glutamine in protein is about %3.9. "The Chemistry of Food" By Jan Velisek
    //Do we consider the dietary glutamine? I did not consider in my code but I can add if we need it.

    //Looks like cooking destroys dietary glutamine. So, no need to consider diet as source of glutamine.
    //-Mukul

    absorbAminoAcids()
    {
        var aminoAcidsAbsorptionRate__ = poissonProcess.sample(1000.0 * this.aminoAcidsAbsorptionRate_);
        
        var glutamineOxidationRate__ = poissonProcess.sample(1000.0 * this.glutamineOxidationRate_);
        
        var absorbedAA = (1.0) * poissonProcess.sample(aminoAcidsAbsorptionRate__)/1000.0;
        

        if(this.protein < absorbedAA )
        {
            absorbedAA = this.protein;
        }
        
        this.body.portalVein.addAminoAcids(absorbedAA);
        this.protein -= absorbedAA;
        
        //Glutamine is oxidized
        var g = (1.0) * poissonProcess.sample(glutamineOxidationRate__)/1000;
        
        if(this.body.blood.glutamine < g)
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

    processTick(){
        for(var i = 0; i < this.chyme.length; i++){
            var RAGConsumed = 0;
            var t = this.body.ticks - this.chyme[i].ts;
            
            if(t == 0){
                RAGConsumed = this.chyme[i].origRAG * 0.5 * (1 + this.erf((t - this.RAG_Mean_) / (this.RAG_StdDev_ * Math.sqrt(2))));
            }
            else{
                RAGConsumed = this.chyme[i].origRAG * 0.5 * (this.erf((t - this.RAG_Mean_) / (this.RAG_StdDev_ * Math.sqrt(2))) - this.erf((t - 1 - this.RAG_Mean_) / (this.RAG_StdDev_ * Math.sqrt(2))));
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
                
            if(t == 0){
                SAGConsumed = this.chyme[i].origSAG * 0.5 * (1 + this.erf((t - this.SAG_Mean_) / (this.SAG_StdDev_ * Math.sqrt(2))));
            }

            else{
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
            console.log("Chyme:: RAG: " + this.chyme[i].RAG + "SAG: " + this.chyme[i].SAG + " origRAG: " + this.chyme[i].origRAG + " origSAG: " + this.chyme[i].origSAG + " glucoseInLumen: " + this.glucoseInLumen + " RAGConsumed: " + RAGConsumed + " SAGConsumed: " + SAGConsumed);
            
            if(this.chyme[i].RAG == 0 && this.chyme[i].SAG == 0){
                this.chyme.pop[i];
            }
        }
        
        this.absorbGlucose();
        this.absorbAminoAcids();
        
        this.body.time_stamp();
        console.log("Intestine:: Glycolysis: " + this.glycolysisPerTick);
        this.body.time_stamp();
        console.log("Intestine:: ToPortalVein: " + this.toPortalVeinPerTick);
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

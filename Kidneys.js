import "Blood.js";
import "Liver.js";
import "Stomach.js";
import "Intestine.js";

export class Kidneys{
    constructor(myBody)
    {
        this.body = myBody;
        
        this.glutamineConsumed_ = 0;
        
        this.glucose = 0;
        this.fluidVolume_ = 10.0; //dl
        
        // 2.5 micromol per kg per minute = 2.5*180.1559/1000 mg per kg per minute = 0.45038975 mg per kg per minute
        this.gluconeogenesisRate_ = 1.8*0.45038975;
        this.gngFromLactateRate_ = 9*this.gluconeogenesisRate_; // by default
        
        this.Glut2VMAX_ = 30; // mg per kg per minute
        this.Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        this.Glut1Rate_ = 1; // mg per kg per minute
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        this.glycolysisMin_ = 0.1801559; // mg per kg per minute
        this.glycolysisMax_ = 5*this.glycolysisMin_;
        
        this.reabsorptionThreshold_ = 11*180.1559/10; //mg/dl equivalent of 11 mmol/l
        this.glucoseExcretionRate_ = 100/(11*180.1559/10); // mg per minute per(mg/dl)
        // As BGL increases from 11 mmol/l to 22 mmol/l, glucose excretion in urine increases from 0 mg/min to 100mg/min.
    }

    processTick()
    {
        var x; // to hold the random samples
        
        //Wrapper functions???

        /*
        static std::poisson_distribution<int> glucoseExcretionRate__ (1000.0*glucoseExcretionRate_);
        static std::poisson_distribution<int> glycolysisMin__ (1000.0*glycolysisMin_);
        static std::poisson_distribution<int> gngRate__ (1000.0*gluconeogenesisRate_);
        static std::poisson_distribution<int> gngFromLactateRate__ (1000.0*gngFromLactateRate_);
        static std::poisson_distribution<int> Glut2VMAX__ (1000.0*Glut2VMAX_);
        static std::poisson_distribution<int> basalAbsorption__ (1000.0*Glut1Rate_);
        */
        
        var bgl = (1.0) * (this.body.blood.getBGL());
        var glInKidneys = (1.0) * (this.glucose/this.fluidVolume_);
        var glucoseAbsorptionPerTick;
        
        x = (1.0) * (this.Glut2VMAX__(SimCtl.myEngine()));
        x *= this.body.bodyWeight/1000.0;
        var y = (1.0) * (basalAbsorption__(SimCtl.myEngine()));
        y *= this.body.bodyWeight/1000.0;
        
        if( glInKidneys < bgl )
        {
            var diff = (1.0) * (bgl - glInKidneys);
            var g = (1.0) * ((1 + this.body.insulinResistance_)*x*diff/(diff + this.Glut2Km_));
            // uptake increases for higher insulin resistance.
            // may want to change this formula later - Mukul
            g += y; // basal absorption
            
            this.body.blood.removeGlucose(g);
            this.glucose += g;
        	SimCtl.time_stamp();
            console.log(" Kidneys removing " + g + " mg of glucose frm blood, basal " + y + endl);
    	   glucoseAbsorptionPerTick = g;
        }
        else
        {
            var diff = (1.0) * (glInKidneys - bgl);
            var g = (1.0) * ((1 + this.body.insulinResistance_)*x*diff/(diff + this.Glut2Km_));
            //g += y;
            
            if( g > this.glucose )
            {
                cout + "Releasing more glucose to blood than what is present in liver!\n";
                exit(-1);
            }
            
            this.glucose -= g;
            this.body.blood.addGlucose(g);
        	//SimCtl.time_stamp();
            //cout + " Kidneys releasing " + g + " mg of glucose to blood" + endl;
    	glucoseAbsorptionPerTick = -1*g;
        }
        
        //Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
        
        //Gerich says:
        //The metabolic fate of glucose is different in different regions of the kidney. Because of its low oxygen tension, and low levels of oxidative enzymes, the renal medulla is an obligate user of glucose for its energy requirement and does so anaerobically. Consequently, lactate is the main metabolic end product of glucose taken up in the renal medulla, not carbon dioxide (CO2) and water. In contrast, the renal cortex has little  glucose phosphorylating capacity but a high level of oxidative enzymes. Consequently, this part of the kidney does not take up and use very much glucose, with oxidation of FFAs acting as the main source of energy. A major energy-requiring process in the kidney is the reabsorption of glucose from glomerular filtrate in the proximal convoluted tubule.
        
        var scale = (1.0) * ((1.0 - this.body.insulinResistance_)*(this.body.blood.insulinLevel));
        
        x = (1.0) * (this.glycolysisMin__(SimCtl.myEngine()));
        x *= this.body.bodyWeight/1000.0;
        if( x > this.glycolysisMax_*(this.body.bodyWeight))
            x = this.glycolysisMax_*(this.body.bodyWeight);
        
        var toGlycolysis = (1.0) * (x + scale * ( (this.glycolysisMax_*(this.body.bodyWeight)) - x));
        
        if( toGlycolysis > this.glucose)
            toGlycolysis = this.glucose;
        this.glucose -= toGlycolysis;
        this.body.blood.lactate += toGlycolysis;
        //SimCtl.time_stamp();
        console.out(" Glycolysis in kidney " + toGlycolysis + " , blood lactate " + this.body.blood.lactate + " mg" + endl);
       glycolysisPerTick = toGlycolysis;
     
       //gluconeogenesis. Depends on insulin level and on substrate concentration.
        
        //4. release some glucose by consuming lactate/alanine/glycerol (gluconeogenesis)(the amount depends on body state and the concentration of lactate/alanine/glycerol in blood; when insulin is high (fed state) glycolysis is favored and when glucagon high (compared to insulin; starved state) gluconeogenesis is favored)
        
        scale = 1 - (this.body.blood.insulinLevel)*(1 - (this.body.insulinResistance_));
        x = (1.0) * (gngRate__(SimCtl.myEngine()));
        x *= this.body.bodyWeight/1000.0;
        var gng = (1.0) * (x * scale);
        gng = this.body.blood.consumeGNGSubstrates(gng);
        if( gng > 0 )
        {
        	this.glucose += gng;
        	SimCtl.time_stamp();
        	console.out(" GNG in Kidneys " + gng + "mg" + endl);
        }
        gngPerTick = gng;
        
        x = (1.0) * (this.gngFromLactateRate__(SimCtl.myEngine()));
        x *= this.body.bodyWeight/1000.0;
        x = this.body.blood.gngFromHighLactate(x);
        if( x > 0 )
        {
        	this.glucose += x;
        	SimCtl.time_stamp();
        	console.out(" GNG from lactate in Kidneys " + x + "mg" + endl);
        }
        gngPerTick += x;

        console.out("After GNG in kidney, glucose in kidney " + this.glucose + " mg, blood lactate " + this.body.blood.lactate + " mg" + endl);
        
        if( this.body.blood.glutamine > this.glutamineConsumed_ )
        {
            this.body.blood.glutamine -= this.glutamineConsumed_;
        }
        else
        {
            this.body.blood.glutamine = 0;
        }
        
        //Glucose excretion in urine
        
        bgl = this.body.blood.getBGL();

        excretionPerTick = 0;
        if( bgl > this.reabsorptionThreshold_ )
        {
            x = (1.0) * ((this.glucoseExcretionRate__(SimCtl.myEngine())));
    	x = x/1000.0;
            excretionPerTick = x*(bgl-this.reabsorptionThreshold_);
            this.body.blood.removeGlucose(excretionPerTick);
            
        	SimCtl.time_stamp();
            console.out(" glucose excretion in urine " + g + endl);
        }
        
        SimCtl.time_stamp();
        console.out(" Kidneys. glucose " + this.glucose + " glKidney " + this.glucose/this.fluidVolume_ + endl);
    }

    //Save setParams in C++ for later implementation
    /*void Kidneys::setParams()
    {
        for( ParamSet::iterator itr = body.metabolicParameters[body.bodyState][KIDNEY].begin();
            itr != body.metabolicParameters[body.bodyState][KIDNEY].end(); itr++)
        {
            if(itr.first.compare("fluidVolume_") == 0)
            {
                fluidVolume_ = itr.second;
            }
            if(itr.first.compare("Glut2VMAX_") == 0)
            {
                Glut2VMAX_ = itr.second;
            }
            if(itr.first.compare("Glut2Km_") == 0)
            {
                Glut2Km_ = itr.second;
            }
            if(itr.first.compare("Glut1Rate_") == 0)
            {
                Glut1Rate_ = itr.second;
            }
            if(itr.first.compare("glycolysisMin_") == 0)
            {
                glycolysisMin_ = itr.second;
            }
            if(itr.first.compare("glycolysisMax_") == 0)
            {
                glycolysisMax_ = itr.second;
            }
            if(itr.first.compare("gluconeogenesisRate_") == 0)
            {
                gluconeogenesisRate_ = itr.second;
            }
            if(itr.first.compare("glutamineConsumed_") == 0)
            {
                glutamineConsumed_ = itr.second;
            }
            
        }
    }*/
}

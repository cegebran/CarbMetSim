package sim;

import java.util.Map.Entry;

import org.apache.commons.math3.distribution.PoissonDistribution;

import enums.BodyOrgan;

public class Liver {
	double glycogen;
	double glycogenMax_;
    //double glycogenStoredFromExogenousGlucose;
    //double EndogenousGlucoseFromGlycogen;
    //double EndogenousGlucoseFromGNG;
    //double totalGlucoseAbsorption;
    //double totalGlycolysisToLactate;
    //double storageFromGNG;
    //double glucoseReleasedToBloodFromGNG;
    
    double glucoseToGlycogen_;
    double glycogenToGlucose_; // in units of mg of glucose per kg per minute
    
    double glycolysisMin_; // mg per kg per minute
    double glycolysisMax_;
    
    double glycolysisToLactateFraction_;
    double gluconeogenesisRate_;
    double gngFromLactateRate_;
    
    double glucoseToNEFA_;
    
    double glucose;
    double normalGlucoseLevel_;
    double fluidVolume_;
    double Glut2Km_;
    double Glut2VMAX_;
    
    //Glucose production by liver (via glycogen breakdown and gluconeogenesis) is at peak in post-absorptive state.
    //After a meal intake, this glucose production slows down to 30-50% of the peak level in 1-2 hours. 
    //If the meal is very high in carb contents, this rate may slow down all the way to zero. As glucose release 
    //from intestine slows down (i.e. post absorptive state approaches), the glucose release by liver picks up again.
        
    //consume some glucose to form lactate (glycolysis) (the amount depends on body state)(some of this
    //glucose is lost to oxidation and some becomes lactate)
    
    //consume some glucose to form fatty acids (at configured rate that depends on glucose level)
    //If the amount of glucose in the liver is above a threshold value, a small portion is converted to lipid
    
    //G6P is oxidized in pentose phosphate pathway and normal oxidation
    
    //consume some glucose to form glycogen (the amount depends on glucose concentration in blood)
    
    //release some glucose from glycogen (the amount depends on glucose concentration in blood)
    
    //release some glucose by consuming lactate/alanine/glycerol (gluconeogenesis)(the amount depends on body state
    //and the concentration of lactate/alanine/glycerol in blood; when insulin is high (fed state) glycolysis is 
    //favored and when glucagon high (compared to insulin; starved state) gluconeogenesis is favored)
    //Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate concentration. 
    //High lactate concentration (e.g. due to high glycolytic activity) would cause gluconeogenesis to happen even
    //if insulin concentration is high. But then Gluconeogenesis would contribute to glycogen store of the liver 
    //(rather than generating glucose).
    
    //consume some unbranched amino acids to form alanine (the amount depends on the concentration of unbranched
    //amino acids in blood; max rate is configured)
    
    private HumanBody body;
    
    //Set Default Values
    public Liver(HumanBody body_) {
    	body = body_;
	    glycogen = 100000.0; // equivalent of 100g of glucose
	    glycogenMax_ = 120000.0; // 120 g of glucose
	    
	    // Frayn Chapter 9
	    
	    // 5 micromol per kg per minute = 5*180.1559/1000 mg per kg per minute = 0.9007795 mg per kg per minute 
	    // (ref: Gerich paper)
	    glycogenToGlucose_ = 2*0.9007795;
	    glucoseToGlycogen_ = glycogenToGlucose_; // for now

	    //Gerich paper: Liver consumes 1.65 micromol per kg per minute to 16.5 micromol per kg per minute of 
	    //glucose depending upon post-absorptive/post-prandial state.
	    glycolysisMin_ = 0.297; //mg per kg per minute
	    glycolysisMax_ = 2.972;
	    
	    glycolysisToLactateFraction_ = 1; // by default glycolysis just generates all lactate
	    
	    // 2.5 micromol per kg per minute = 2.5*180.1559/1000 mg per kg per minute = 0.45038975 mg per kg per minute
	    gluconeogenesisRate_ = 1.8*0.45038975;
	    gngFromLactateRate_ = gluconeogenesisRate_; //by default
	    
	    glucoseToNEFA_ = 0;
	    
	    normalGlucoseLevel_ = 100; //mg/dl
	    fluidVolume_ = 10; //dl
	    glucose = normalGlucoseLevel_*fluidVolume_;
	    Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
	    Glut2VMAX_ = 50; //mg per kg per minute
    }
    
    //Call private methods
    public void processTick() {
    	// every thing is stochastic
        double x; // to hold the random samples
        x = body.bodyWeight_;
        
        PoissonDistribution glycogenToGlucose__ = new PoissonDistribution(x*glycogenToGlucose_);
        PoissonDistribution glucoseToGlycogen__ = new PoissonDistribution(x*glucoseToGlycogen_);
        PoissonDistribution glycolysisMin__ = new PoissonDistribution(x*glycolysisMin_);
        PoissonDistribution gngRate__ = new PoissonDistribution(x*gluconeogenesisRate_);
        PoissonDistribution gngFromLactateRate__ = new PoissonDistribution(x*gngFromLactateRate_);
        PoissonDistribution Glut2VMAX__ = new PoissonDistribution(x*Glut2VMAX_);
        
        // Now do the real work
        
        double glInPortalVein = body.portalVein.getConcentration();
        double glInLiver = glucose/fluidVolume_;
        
        if( glInLiver < glInPortalVein ) {
            double diff = glInPortalVein - glInLiver;
            x = (double) Glut2VMAX__.sample();
            double g = x * diff/(diff + Glut2Km_);
            
            if( g > body.portalVein.getGlucose() ) {
                //System.out.println("Trying to absorb more glucose from portal vein than what is present there! " + g + " " + body.portalVein.getGlucose());
                g = body.portalVein.getGlucose();
            }
            
            body.portalVein.removeGlucose(g);
            glucose += g;
            System.out.println("Liver absorbs from portal vein " + g);
        }
        //release all portalVein glucose to blood
        body.portalVein.releaseAllGlucose();

        // glycogen synthesis (depends on insulin and glucose level)
        
        glInLiver = glucose/fluidVolume_;
        double scale = glInLiver/normalGlucoseLevel_;
        //scale *= (1.0 - body.insulinResistance_);
        scale *= body.blood.insulin;
        x = (double) glucoseToGlycogen__.sample();
        double toGlycogen = scale * x;
        
        if( toGlycogen > glucose )
            toGlycogen = glucose;
        
        glycogen += toGlycogen;
        
        if( glycogen > glycogenMax_ )
        {
            body.adiposeTissue.lipogenesis(glycogen - glycogenMax_);
            glycogen = glycogenMax_;
        }
        
        //if the liver cannot store any more glycogen, we assume that this glucose
        //(which would have been stored as glycogen) is converted to fat.
        
        glucose -= toGlycogen;
        
        //System.out.println("After glycogen synthesis in liver, liver glycogen " + glycogen + " mg, live glucose " + glucose + " mg");
        
        //glycogen breakdown (depends on insulin and glucose level)
        
        scale = 1 - (body.blood.insulin)*(1 - (body.insulinResistance_));
        glInLiver = glucose/fluidVolume_;
        
        if( glInLiver > normalGlucoseLevel_ ) {
            scale *= normalGlucoseLevel_/glInLiver;
        }
        
        x = (double) glycogenToGlucose__.sample();
        double fromGlycogen = scale * x;
        
        if( fromGlycogen > glycogen )
            fromGlycogen = glycogen;
        
        glycogen -= fromGlycogen;
        glucose += fromGlycogen;
        
        //System.out.println("After glycogen breakdown in liver, liver glycogen " + glycogen +
        //					" mg, liver glucose " + glucose + " mg, blood glucose " +
        //					body.blood.glucose + " mg, blood lactate " + body.blood.lactate + " mg");

        
        //Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
        
        //Gerich paper: Liver consumes 1.65 micomol per kg per minute to 16.5 micomol per kg per minute of glucose depending upon post-absorptive/post-prandial state.
        
        scale = (1.0 - body.insulinResistance_)*(body.blood.insulin);
        
        x = (double) glycolysisMin__.sample();
        if( x > glycolysisMax_*(body.bodyWeight_))
            x = glycolysisMax_*(body.bodyWeight_);

        double toGlycolysis = x + scale* ( (glycolysisMax_*(body.bodyWeight_)) - x);
        
        if( toGlycolysis > glucose)
            toGlycolysis = glucose;
        glucose -= toGlycolysis;
        body.blood.lactate += toGlycolysis*glycolysisToLactateFraction_;

        //System.out.println("After glycolysis , liver glucose " + glucose + " mg, blood lactate " + body.blood.lactate + " mg");
        
        //gluconeogenesis. Depends on insulin level and on substrate concentration.
        
        //4. release some glucose by consuming lactate/alanine/glycerol (gluconeogenesis)(the amount depends on body state and the concentration of lactate/alanine/glycerol in blood; when insulin is high (fed state) glycolysis is favored and when glucagon high (compared to insulin; starved state) gluconeogenesis is favored)
        
        //Glucose production by liver (via glycogen breakdown and gluconeogenesis) is at peak in post-absorptive state. After a meal intake, this glucose production slows down to 30-50% of the peak level in 1-2 hours.  If the meal is very high in carb contents, this rate may slow down all the way to zero. As glucose release from intestine slows down (i.e. post absorptive state approaches), the glucose release by liver picks up again.
        scale = 1 - (body.blood.insulin)*(1 - (body.insulinResistance_));
        x = (double) gngRate__.sample();
        double gng = x *scale;
        glucose += body.blood.consumeGNGSubstrates(gng);
        
        //Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate concentration. High lactate concentration (e.g. due to high glycolytic activity) would cause gluconeogenesis to happen even if insulin concentration is high. But then Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
        x = (double) gngFromLactateRate__.sample();
        glycogen += body.blood.gngFromHighLactate(x);
        //System.out.println("After GNG , liver glucose " + glucose + " mg, liver glycogen " + glycogen + " mg, blood glucose " + body.blood.glucose + " mg, blood lactate " + body.blood.lactate + " mg");
        
        //5. consume some unbranched amino acids to form alanine (the amount depends on the concentration of unbranched amino acids in blood; max rate is configured)
        
        //" Amino acids are not merely substrates for energy production in the liver, however.
        //They also provide a substrate for synthesis of glucose (particularly alanine � see Box 5.2), of fatty acids and of ketone bodies."
        
        //BUKET NEW: 93% of unbranched amino acids in portal vein are retained in Liver, because the leaked amino acids from Intestine consists of 15% branched and 85% unbranched, but after liver consumption the percentage needs to be 70% branched, 30% unbranched. To provide these percentages 93% of unbranched amino acids in portal vein are retained in liver. (From Frayn's book)
        
        body.portalVein.releaseAminoAcids();
        
        //6. consume some glucose to form fatty acids (at configured rate that depends on glucose level)

        /*
        if( body.blood.glucose > body.blood.normalGlucoseLevel_){
            body.blood.consumeGlucose(glucoseToNEFA_);
        }
        */
        
        //System.out.println("GNG_RATE " + gngRate);
        //System.out.println("Total Endogenous glucose from Liver " + EndogenousGlucoseFromGlycogen + EndogenousGlucoseFromGNG);
        //System.out.println("Endogenous Glucose From Glycogen " + EndogenousGlucoseFromGlycogen);
        //System.out.println("Endogenous Glucose From GNG " + EndogenousGlucoseFromGNG);
        //System.out.println("Liver " + "glycogen level "+ glycogen);
        //System.out.println("Glucose_from_Glycogen_in_a_minute "+ glycogenToGlucoseINaMinute);
        //System.out.println("GNG_Amount_in_a_minute "+ gngAmountInAminute);
        //System.out.println("Endogenous_Glucose_From_Liver_in_a_minute "+ glycogenToGlucoseINaMinute + gngAmountInAminute);
        //System.out.println("Total Glucose Absorption by Liver "+totalGlucoseAbsorption);
        //System.out.println("Storage From GNG in Liver " + storageFromGNG);
        //System.out.println("Total glycolysis to form lactate in Liver "+ totalGlycolysisToLactate);
        //System.out.println("Released Glucose From GNG in Liver " + glucoseReleasedToBloodFromGNG);
        //System.out.println("Liver Glycogen Stored from Exogenous Glucose " + glycogenStoredFromExogenousGlucose);
        glInLiver = glucose/fluidVolume_;
        double bgl = body.blood.getBGL();
        if( glInLiver > bgl ) {
            double diff = glInLiver - bgl;
            x = (double) Glut2VMAX__.sample();
            double g = x*diff/(diff + Glut2Km_);
            if( g > glucose ) {
                System.out.println("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1);
            }
            glucose -= g;
            body.blood.addGlucose(g);
            SimCtl.time_stamp();
            System.out.println("Liver released glucose " + g);
        }
        //SimCtl.time_stamp();
        //System.out.println(" Liver:: " + glycogen + " " + glucose + " " + glucose/fluidVolume_);
    }
    
    public void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.LIVER.value).entrySet()) {
    		switch (e.getKey()) {
    			case "fluidVolume_" : { fluidVolume_ = e.getValue(); break; }
    			case "normalGlucoseLevel_" : { normalGlucoseLevel_ = e.getValue(); break; }
    			case "Glut2Km_" : { Glut2Km_ = e.getValue(); break; }
    			case "Glut2VMAX_" : { Glut2VMAX_ = e.getValue(); break; }
    			case "glucoseToGlycogen_" : { glucoseToGlycogen_ = e.getValue(); break; }
    			case "glycogenToGlucose_" : { glycogenToGlucose_ = e.getValue(); break; }
    			case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
    			case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
    			case "glycolysisToLactateFraction_" : { glycolysisToLactateFraction_ = e.getValue(); break; }
    			case "gluconeogenesisRate_" : { gluconeogenesisRate_ = e.getValue(); break; }
    			case "gngFromLactateRate_" : { gngFromLactateRate_ = e.getValue(); break; }
    			case "glucoseToNEFA_" : { glucoseToNEFA_ = e.getValue(); break; }
    		}
    	}
    }
    
    public static class PortalVein {
    	private double glucose;
    	private double branchedAA;
    	private double unbranchedAA;
    	private double fluidVolume_;
        HumanBody body;

        public PortalVein(HumanBody body_) {
        	body = body_;
            glucose = 0; //mg
            branchedAA = 0;	//mg
            unbranchedAA = 0; //mg
            fluidVolume_ = 5; // dl
        }
        
        void processTick() {
        	double bgl = body.blood.getBGL();
            double glucoseFromBlood = bgl*fluidVolume_;
            body.blood.removeGlucose(glucoseFromBlood);
            glucose += glucoseFromBlood;
            
            //SimCtl.time_stamp();
        }
        
        void setParams() {
        	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.PORTAL_VEIN.value).entrySet()) {
        		switch (e.getKey()) {
        			case "fluidVolume_" : { fluidVolume_ = e.getValue(); break; }
        		}
        	}
        }
        
        double getConcentration() {
        	double gl = glucose/fluidVolume_;
            //SimCtl.time_stamp();
            //System.out.println("GL in Portal Vein: " + gl);
         
            return gl;
        }
        
        void addGlucose(double g) {glucose += g;}
        
        double getGlucose(){return glucose;}
        
        void removeGlucose(double g) {
        	glucose -= g;
            if( glucose < 0 ) {
                System.out.println("PortalVein glucose went negative");
                System.exit(-1);
            }
        }
        
        void releaseAllGlucose() {
        	body.blood.addGlucose(glucose);
            glucose = 0;
        }
        
        void addAminoAcids(double aa) {
        	branchedAA += 0.15*aa;
            unbranchedAA += 0.85*aa;
            //SimCtl.time_stamp();
            //System.out.println(" PortalVein: bAA " + branchedAA + ", uAA " + unbranchedAA);
        }
        
        void releaseAminoAcids() {
        	// 93% unbranched amino acids consumed by liver to make alanine
            body.blood.alanine += 0.93*unbranchedAA;
            body.blood.unbranchedAminoAcids += 0.07*unbranchedAA;
            unbranchedAA = 0;
            body.blood.branchedAminoAcids += branchedAA;
            branchedAA = 0;
            // who consumes these amino acids from blood other than liver?
            // brain consumes branched amino acids
        }
        // there is no processTick() in portal vein
    }
}

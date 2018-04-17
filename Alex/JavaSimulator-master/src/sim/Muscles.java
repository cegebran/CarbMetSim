package sim;

import java.util.Map.Entry;

import org.apache.commons.math3.distribution.PoissonDistribution;

import enums.BodyOrgan;

public class Muscles {
	private double glycogen;
	private double glycogenMax_;
    private double glucose; // mg
    private double volume_; //in dl
    
    private double basalGlucoseAbsorbed_;
    private double glucoseOxidationFraction_;
    private double bAAToGlutamine_;
    private double glycolysisMin_;
    private double glycolysisMax_;

    private double Glut4Km_;
    private double Glut4VMAX_; // mg per kg per minute

    private HumanBody body;
    
    //Set default values
    public Muscles(HumanBody myBody) {
    	body = myBody;
    	glycogenMax_ = 0.4*(body.bodyWeight_)*15000.0; //40% of body weight is muscles
        glycogen = glycogenMax_;
        glucose = 0;
        volume_ = 1;
        // Frayn Chapter 9
        
        bAAToGlutamine_ = 0;
        
        basalGlucoseAbsorbed_ = 0.344; //mg per kg body weight per minute 
        
        //See the explanation in processTick()
        glycolysisMin_ = 0.4; //mg per kg per minute
        // 2.22 micromol per kg per minute = 2.22*180.1559/1000 mg per kg per minute = 0.4 mg per per minute
        glycolysisMax_ = 9*glycolysisMin_; //mg per kg per minute
        
        Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
        Glut4VMAX_ = 20.0; //mg per kg per minute
        
        glucoseOxidationFraction_ = 0.5;
        //15% of the oral glucose taken up by muscle (2.5±0.9 g) was released as lactate, alanine,
        //or pyruvate; 50% (8.9±1.4 g) was oxidized, and 35% (6.4±2.3 g) was available for storage.
        //(source: Skeletal Muscle Glycolysis, Oxidation, and Storage of an Oral Glucose Load, Kelley et.al.)
    }
    
    void processTick() {
    	// we assume that all exercise is aerobic exercise.
        
        //The major fuels used in aerobic exercise vary with the intensity of the exercise and
        //with the duration. In relatively light exercise most of the energy required comes from
        //non-esterified fatty acids delivered from adipose tissue. At higher intensities, carbohydrate
        //tends to predominate early on, fat becoming more important later as glycogen
        //stores are depleted. As we have seen several times, the amount of glucose present in
        //the circulation and the extracellular fluid is small, and cannot be depleted without
        //harmful effects. Therefore, the carbohydrate used during endurance exercise comes
        //from glycogen stores, both in exercising skeletal muscle and in the liver. In principle,
        //it might also come from gluconeogenesis: exercising muscles always produce some
        //lactic acid, even in aerobic exercise, and this should be a good substrate for hepatic
          //  gluconeogenesis. In fact, gluconeogenesis seems to be restricted during exercise, perhaps
          //  because blood flow to the liver is restricted as blood is diverted to other organs
            //and tissues (mainly, as discussed below, skeletal muscle). The use of different fuels at
           // different intensities of exercise is illustrated in Figure 9.9.
        
        //Fig 9.9: For high intensity exercise, about 10% of energy required comes from plasma glucose and 30%
    	//comes from muscle glycogen. (Abt 40% comes from plasma NEFA and remaining from muscle Tg). For low 
    	//intensity exercise, abt 10% energy comes from plasma glucose and remaining mostly from plasma NEFA 
    	//(some comes from muscle Tg).
        
        
        //Absorb glucose via GLUT4 when the insulin concentration is high and/or when the person is exercising. 
    	//The absorbed glucose is oxidized or used for glycogen synthesis (if the person is not exercising) or 
    	// glycolysis (if the person is doing anaerobic exercising) to form lactate.
        
        // Muscles use glycogen and glucose to generate alanine via glycolysis.
        
        // Some alanine is produced via protein breakdown as well.
        // Buket: Alanine is produced via protein breakdown and via glycolysis(using glycogen and glucose). 
    	// Are these two processes different from each other or are they the same process which carbon skeleton 
    	// is coming from glycolysis and amino group is coming from protein breakdown?
    	
        //Mukul: I am not sure. Just ignore alanine production via protein breakdown.

    	// Mukul: As per the paper I sent this morning, the glycolysis in muscles (to form lactate) takes place 
    	// at a basal rate (which causes the lactate concentration in blood of roughly 1mmol/l) . For light exercise,
    	// the lactate concentration (and hence the glycolysis flux) does not increase. But as the intensity of the 
    	// exercise increases further, the lactate concentration increases, presumably because glycolysis flux increases.
    	// At peak exercise intensity, the lactate concentration can be as high as 9mmol/l.
        
        //oxidation of 1 g of carbs yields 4kcal of energy
        // molecular mass of glucose is 180.1559 g/mol
        // During glycolysis, 1 molecule of glucose results in 2 molecules of pyruvate (and hence 2 molecules
        // of lactate). So 1mmol/l of lactate corresponds to 0.5mmol/l of glucose. We assume that this is basal level of
    	// glycolysis. We assume that the level of glycolysis increases linearly with the exercise intensity peaking to 
    	// 9mmol/l of lactate production (equivalent to 4.5mmol/l of glucose consumption) when exercise intensity is 18 METs (marathon).
        
        // Assuming that there is 5l of blood in human body, 0.5mmol/l of glucose translates to 0.5*5*180.1559mg = 450mg and 4.5mmol/l
    	// of glucose translates to 4053mg of glucose.
        
        // We need to play with glycolysis and gluconeogenesis numbers so that we achieve these balances for
        // lactate concentration. Here we assume that the glcolysis flux increases linearly with exercise intensity.
        // For gluconeogenesis, we will assume that the gluconeogeneis flux does not depend on substrate availability 
    	// (even though the flux is supposed to increase with substrate availability).
        
        //Gerich paper says that 2.22 micromol (per kg per minute) of glucose is consumed by muscles in post-absorptive state 
    	//(the number is abt 20 micromol per kg per minute in post-prandial state (insulin dependent number)). For now, we will 
    	//assume that all this glucose is consumed via glycolysis.
        //20 micromol per kg per minute is 20*180.1559/1000 mg = 3.603 mg.
        
        // every thing is stochastic
        
        PoissonDistribution rand__  = new PoissonDistribution(100);
        PoissonDistribution glycolysisMin__  = new PoissonDistribution(100.0*glycolysisMin_);
        PoissonDistribution basalAbsorption__  = new PoissonDistribution(100.0*basalGlucoseAbsorbed_);
        PoissonDistribution Glut4VMAX__  = new PoissonDistribution(100.0*Glut4VMAX_);
        
        double x; // to hold the random samples
        double totalAbsorption = 0;
        double toGlycolysis = 0;
        // Now do the real work

        if( body.isExercising() ) {
            // 10% of energy comes from glucose on average
            x = (double) rand__.sample();
            double glucoseConsumed = 0.1*(x/100.0)*1000.0*(body.currEnergyExpenditure)/4.0; // in milligrams
            System.out.println("Muscle removing glucose from blood " + glucoseConsumed);
            body.blood.removeGlucose(glucoseConsumed);
            
            double glycogenShare;
            double fatShare;
            double intensity = body.exerciseTypes.get(body.currExercise).intensity_;
            if( intensity >= 6.0 ) {
                glycogenShare = 0.3; // for MET 6 and above, 30% of energy comes from glycogen 
                fatShare = 0.4;
            } else {
                    if( intensity < 3.0 ) {
                        glycogenShare = 0;
                        fatShare = 0.9;
                    } else {
                        glycogenShare = 0.3*(intensity - 3.0 )/3.0;
                        fatShare = 0.9 -0.5*(intensity - 3.0)/3.0;
                    }
            }
            x = (double) rand__.sample();
            double glycogenConsumed = glycogenShare*(x/100.0)*1000.0*(body.currEnergyExpenditure)/4.0; // in milligrams
            double energyFromFat = fatShare*(x/100.0)*(body.currEnergyExpenditure); // in kcal
            
            glycogen -= glycogenConsumed;
            body.adiposeTissue.consumeFat(energyFromFat);
            // do glycolysis
            
            double glycolysisShare;
            
            if( intensity < 18.0 ) {
                x = (double) glycolysisMin__.sample();
                x = x*(body.bodyWeight_)/100.0;
                
                if( x > glycolysisMax_*(body.bodyWeight_))
                    x = glycolysisMax_*(body.bodyWeight_);
                
                glycolysisShare = x + ((intensity-1.0)/17.0)* ( (glycolysisMax_*(body.bodyWeight_)) - x);
            } else glycolysisShare = glycolysisMax_*(body.bodyWeight_);
            
            glycogen -= glycolysisShare;
            body.blood.lactate += glycolysisShare;
        } else {
            //BUKET NEW: GLUT1 is also expressed in skeletal muscle and may play a role in uptake of a glucose at a “basal” rate.
        	//Muscle glucose uptake averaged 1.91+- 0.23 micromolkg1 min1(0.36*bodyweight mg) before glucose ingestion and 
        	//accounted for 22.0 +- 3.7% of systemic glucose disposal."Splanchnic and Leg Substrate Exchange After Ingestion of 
        	//a Natural Mixed Meal in Humans". So the glucose uptake of muscle depends on the weight of the person. I assume that the person is 65kg.
            
            //From this paper, we have a basal glucose absorption rate when the BGL is less than the normal level, but whenever 
        	//the BGL is increasing the glucose absorption rate going up to the 5 fold of the basal level.
            
            // 1.91 micromol of glucose translates to 1.91*180.1559/1000 mg = 0.344 mg
            
            x = (double) basalAbsorption__.sample();
            x = x*(body.bodyWeight_)/100.0;
            
            body.blood.removeGlucose(x);
            
            glycogen += x;
            if(glycogen > glycogenMax_)
            {
                glucose += glycogen - glycogenMax_;
                glycogen = glycogenMax_;
            }
            
            totalAbsorption = x;
            //double basalAbsorption = x;
            
            //SimCtl.time_stamp();
            //System.out.println("Muscle removed " + x + " mg glucose from blood, glycogen " + glycogen + " mg");
            
            // Absorption via GLUT4
            
            double bgl = body.blood.getBGL();
            double glMuscles = glucose/volume_;
            double diff = bgl-glMuscles;
            
            double scale = (1.0 - body.insulinResistance_)*(body.blood.insulin);
            
            double g;
            
            if( diff > 0 )
            {
                x = (double)(Glut4VMAX__.sample());
                x = x*(body.bodyWeight_)/100.0;
                g = scale*x*diff/(diff + Glut4Km_);

                body.blood.removeGlucose(g);
                x = glycogen;
                glycogen += (1.0 - glucoseOxidationFraction_)*g;
                totalAbsorption += (1.0 - glucoseOxidationFraction_)*g;
                
                if(glycogen > glycogenMax_)
                {
                    glucose += glycogen - glycogenMax_;
                    glycogen = glycogenMax_;
                }
            }
            
            // glycolysis
            //Gerich paper says that 2.22 micromol (per kg per minute) of glucose is consumed by muscles in post-absorptive state 
            //(the number is abt 20 micromol per kg per minute in post-prandial state (insulin dependent number)). 
            //For now, we will assume that all this glucose is consumed via glycolysis.
            scale = (1.0 - body.insulinResistance_)*(body.blood.insulin);
            
            x = (double) glycolysisMin__.sample();
            x = x*(body.bodyWeight_)/100.0;
            
            if( x > glycolysisMax_*(body.bodyWeight_))
                x = glycolysisMax_*(body.bodyWeight_);
            
            toGlycolysis = x + scale* ( (glycolysisMax_*(body.bodyWeight_)) - x);
            g = toGlycolysis;
            
            if( g <= glucose ) {
                glucose -= g;
		        body.blood.lactate += g;
            } else {
            	g -= glucose;
                body.blood.lactate += glucose;
                glucose = 0;
                
                if( glycogen >= g )
                {
                    glycogen -= g;
                    body.blood.lactate += g;
                }
                else
                {
                    body.blood.lactate += glycogen;
                    toGlycolysis = toGlycolysis -g + glycogen;
                    glycogen = 0;
                }
            }
            //System.out.println("After glycolysis, muscle glycogen " + glycogen + " mg, blood lactate "
            //+ body.blood.lactate + " mg, g " + g + " mg");
            
            // consume fat for 90% of the energy needs during resting state
            x = (double) rand__.sample();
            double energyFromFat = 0.9*(x/100.0)*(body.currEnergyExpenditure); // in kcal
            body.adiposeTissue.consumeFat(energyFromFat);
        }
        
        if( glycogen < 0 ) {
            System.out.println("Glycogen went negative");
            System.exit(-1);
        }
        
        //Muscles generate glutamine from branched amino acids.
        if( body.blood.branchedAminoAcids > bAAToGlutamine_ ) {
            body.blood.branchedAminoAcids -= bAAToGlutamine_;
            body.blood.glutamine += bAAToGlutamine_;
        } else {
            body.blood.glutamine += body.blood.branchedAminoAcids;
            body.blood.branchedAminoAcids = 0;
        }
        
        //SimCtl.time_stamp();
        //System.out.println(" Muscle:: "+ glycogen);
        //System.out.println("Total Glucose Absorption by Muscle "+ totalGlucoseAbsorption);
        //System.out.println("Glucose_Consumed_in_a_Minute_by_Muscle "+ glucoseConsumedINaMinute);
        //System.out.println("Muscle Glycogen from Exogenous Glucose "+ glycogenFromExogenousGlucose);
        //System.out.println("Glycogen to Glycolysis in Muscle "+ glycogenToGlycolysis);
    }
    
    void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.MUSCLES.value).entrySet()) {
    		switch (e.getKey()) {
    			case "Glut4Km_" : { Glut4Km_ = e.getValue(); break; }
    			case "Glut4VMAX_" : { Glut4VMAX_ = e.getValue(); break; }
    			case "basalGlucoseAbsorbed_" : { basalGlucoseAbsorbed_ = e.getValue(); break; }
    			case "glucoseOxidationFraction_" : { glucoseOxidationFraction_ = e.getValue(); break; }
    			case "bAAToGlutamine_" : { bAAToGlutamine_ = e.getValue(); break; }
    			case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
    			case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
    		}
    	}
    }
}

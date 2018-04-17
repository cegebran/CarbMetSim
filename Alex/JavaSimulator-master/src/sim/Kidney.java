package sim;
import java.util.Map.Entry;

import org.apache.commons.math3.distribution.PoissonDistribution;

import enums.BodyOrgan;

public class Kidney {
	private double glucose;
	private double fluidVolume_;
	private double Glut2VMAX_; // mg per kg per minute
	private double Glut2Km_;
	private double Glut1Rate_;
    
	private double glycolysisMin_;
	private double glycolysisMax_;
    
	private double gluconeogenesisRate_; // mg per kg per minute
	private double gngFromLactateRate_;
    
	private double glutamineConsumed_;
    
	private double reabsorptionThreshold_;
	private double glucoseExcretionRate_;

	private HumanBody body;
    
    public Kidney(HumanBody myBody){
    	body = myBody;
        
        glutamineConsumed_ = 0;
        
        glucose = 0;
        fluidVolume_ = 1.5; //dl
        
        // 2.5 micromol per kg per minute = 2.5*180.1559/1000 mg per kg per minute = 0.45038975 mg per kg per minute
        gluconeogenesisRate_ = 1.8*0.45038975;
        gngFromLactateRate_ = gluconeogenesisRate_; // by default
        
        //BUKET NEW: RGU before glucose ingestion averaged 0.89 +- 0.17 micromolkg1 min1(0.16*bodyweight mg) and accounted for 9.4 +- 1.7%
        //of systemic glucose disposal. After glucose ingestion, RGU increased more than threefold to a peak value (2.83 +-  0.58 micromolkg1 min1)
        //at 90 min and returned to postabsorptive rates at 240 min.
        
        //reference: Role of the kidney in normal glucose homeostasis and in the hyperglycaemia of diabetes mellitus: therapeutic  implications
        //Mukul: Lets assume that GLUT1s are responsible for x micromole per kg per minute of RGU. This means that max GLUT2 based RGU is (2.83-x)
        //micromole per kg per minute. This happens when BGL is at its peak (say 200 mg/dl for a normal person). Thus
        //  (2.83-x) = Vmax*(200)/(200 + Km) = 200Vmax/560, which gives Vmax = 2.8*(2.83-x) micromole per kg per minute.
        // Also when bgl is 100mg/dl, GLUT2 based RGU is (0.89-x) micromole per kg per minute. Thus
        // (0.89-x) = Vmax*100/460 => Vmax = 4.6*(0.89-x) micromole per kg per minute.
        // Thus, ... x turns out to be negative. :(
        
        Glut2VMAX_ = 5; // mg per kg per minute
        Glut2Km_ = 20*180.1559/10.0; // mg/deciliter equal to 20 mmol/l (Frayn Table 2.2.1)
        Glut1Rate_ = 1; // mg per kg per minute
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        glycolysisMin_ = 0.1801559; // mg per kg per minute
        glycolysisMax_ = 5*glycolysisMin_;
        
        reabsorptionThreshold_ = 11*180.1559/10; //mg/dl equivalent of 11 mmol/l
        glucoseExcretionRate_ = 100/(11*180.1559/10); // mg per minute per(mg/dl)
        // As BGL increases from 11 mmol/l to 22 mmol/l, glucose excretion in urine increases from 0 to mg/min to 100mg/min.
    }
    
    //The kidney takes up glutamine and metabolizes it to ammonia."Renal metabolism of amino acids: its role in interorgan amino acid exchange"
    //Glucose oxidized, and glucose is used to produce lactate by glycolysis
    
    void processTick() {
    	double x; // to hold the random samples
        x = body.bodyWeight_;
        
        PoissonDistribution glucoseExcretionRate__ = new PoissonDistribution(glucoseExcretionRate_);
        PoissonDistribution glycolysisMin__ = new PoissonDistribution(x*glycolysisMin_);
        PoissonDistribution gngRate__ = new PoissonDistribution(x*gluconeogenesisRate_);
        PoissonDistribution gngFromLactateRate__ = new PoissonDistribution(x*gngFromLactateRate_);
        PoissonDistribution Glut2VMAX__ = new PoissonDistribution(x*Glut2VMAX_);
        PoissonDistribution basalAbsorption__ = new PoissonDistribution(x*Glut1Rate_);
        
        double bgl = body.blood.getBGL();
        double glInKidney = glucose/fluidVolume_;
        
        x = (double) Glut2VMAX__.sample();
        double y = (double) basalAbsorption__.sample();
        
        if( glInKidney < bgl ) {
            //BUKET NEW: In addition to increased glucose production, renal glucose uptake is increased in both the post-absorptive and postprandial
        	//states in patientswithT2DM[45,46]. So it depends on insulin resistance. (Gerich paper)
            
            double diff = bgl - glInKidney;
            double g = (1 + body.insulinResistance_)*x*diff/(diff + Glut2Km_);
            // uptake increases for higher insulin resistance.
            // may want to change this formula later - Mukul
            g += y; // basal absorption
            
            body.blood.removeGlucose(g);
            glucose += g;
            //System.out.println("Kidney removing " + g + " mg of glucose frm blood");
        }
        else
        {
            double diff = glInKidney - bgl;
            double g = (1 + body.insulinResistance_)*x*diff/(diff + Glut2Km_);
            //g += y;
            
            if( g > glucose )
            {
                System.out.println("Releasing more glucose to blood than what is present in liver!");
                System.exit(-1);
            }
            
            glucose -= g;
            body.blood.addGlucose(g);
            System.out.println("Kidney releasing " + g + " mg of glucose to blood");
        }
        
        //Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
        
        //Gerich says:
        //The metabolic fate of glucose is different in different regions of the kidney. Because of its low oxygen tension, and low levels of
        //oxidative enzymes, the renal medulla is an obligate user of glucose for its energy requirement and does so anaerobically. Consequently,
        //lactate is the main metabolic end product of glucose taken up in the renal medulla, not carbon dioxide (CO2) and water. In contrast, 
        //the renal cortex has little  glucose phosphorylating capacity but a high level of oxidative enzymes. Consequently, this part of the 
        //kidney does not take up and use very much glucose, with oxidation of FFAs acting as the main source of energy. A major energy-requiring
        //process in the kidney is the reabsorption of glucose from glomerular filtrate in the proximal convoluted tubule.
        
        double scale = (1.0 - body.insulinResistance_)*(body.blood.insulin);
        
        x = (double) glycolysisMin__.sample();
        if( x > glycolysisMax_*(body.bodyWeight_)) 
        	x = glycolysisMax_*(body.bodyWeight_);
        
        double toGlycolysis = x + scale* ( (glycolysisMax_*(body.bodyWeight_)) - x);
        
        if( toGlycolysis > glucose)
            toGlycolysis = glucose;
        glucose -= toGlycolysis;
        body.blood.lactate += toGlycolysis;
        //System.out.println("Glycolysis in kidney, blood lactate " + body.blood.lactate + " mg");
        
        //gluconeogenesis. Depends on insulin level and on substrate concentration.
        
        //4. release some glucose by consuming lactate/alanine/glycerol (gluconeogenesis)(the amount depends on body state and the concentration of lactate/alanine/glycerol
        //in blood; when insulin is high (fed state) glycolysis is favored and when glucagon high (compared to insulin; starved state) gluconeogenesis is favored)
        
        //Consistent with numerous studies in diabetic animal models [38–44], patients with T2DM have an increased release of glucose into the circulation by the kidney
        //in the fasting state [45].
        // Mukul: Not modeled yet. May be increased glucose reabsorption will take care of this?

        scale = 1 - (body.blood.insulin)*(1 - (body.insulinResistance_));
        x = (double) gngRate__.sample();
        double gng = x *scale;
        glucose += body.blood.consumeGNGSubstrates(gng);
        System.out.println("GNG in Kidney " + gng);
        
        //75% of gluconeogenesis is from gng substrates, 25% of gluconeogenesis is from glutamine
        
        //The reason why gluconeogenesis in kidney is getting higher in fed state is because of the lactate level is getting higher after meal ingestion, in liver after
        //meal ingestion the coming lactate is converted to glucose and this glucose is stored as glycogen, but in kidney the glucose could not be converted to glycogen,
        //it is released to the blood.
        
        //After meal ingestion, renal glucose release increases to a greater extent in peoplewith T2DM than in peoplewith normal glucose tolerance [46].
        // Mukul: Not modeled yet.
        
        x = (double) gngFromLactateRate__.sample();
        glucose += body.blood.gngFromHighLactate(x);
        
        System.out.println("GNG from lactate " + x);

        //System.out.println("After GNG in kidney, glucose in kideny " + glucose + " mg, blood lactate " + body.blood.lactate + " mg");
        
        //From page 196 of Frayn's Book:
        
        //"Glutamine is not as good a substrate for hepatic uptake, but is removed particularly by the kidney and by the intestinal mucosal cells. In the kidney, 
        //the action of glutami- nase (Figure 7.15) removes the amide group (forming ammonia) and leaves glutamate; glutamate can be converted to 2-oxoglutarate 
        //by the action of glutamine dehydroge- nase, again forming ammonia. It is generally believed that this ammonia is a route for urinary excretion of protons
        //(H+ ions), especially in conditions of excessive acidity in the body."
        
        if( body.blood.glutamine > glutamineConsumed_ ) {
            body.blood.glutamine -= glutamineConsumed_;
        } else {
            body.blood.glutamine = 0;
        }
        
        //three different mechanisms: (i) release of glucose into the circulation via gluconeogenesis; (ii) uptake of glucose from the circulation to satisfy its
        //energy needs; and (iii) reabsorption into the circulation of glucose from glomerular filtrate to conserve glucose carbon.
        
        //BUKET NEW:
        //Article: Role of the kidney in normal glucose homeostasis and in the hyperglycaemia of diabetes mellitus: therapeutic implications
        //After a 14- to 16-h overnight fast, glucose is released into the circulation at a rate of approximately 10 lmol / (kg min) [10,13,14].
        //Approximately 50% of this is the result of the breakdown of glycogen (glycogenolysis) stored in the liver and the other half is because
        //of the production of new glucose molecules from precursors such as lactate, glycerol, alanine and other amino acids (gluconeogenesis) by liver and kidneys.
        //Research over the last 15–20 years has established that the human liver and kidneys provide about equal amounts of glucose via gluconeogenesis
        //in the postabsorptive state (Table 2). Consequently, after an overnight fast, 75–80% of glucose released into the circulation derives from the liver and
        //the remaining 20–25% derives from the kidneys.
        //Hepatic gluconeogenesis also decreases by 82% and glucose molecules generated through this pathway are not generally released in the circulation, but are
        //largely directed into hepatic glycogen. Perhaps surprisingly, renal gluconeogenesis actually increases by approximately twofold and accounts for 60% of
        //endogenous glucose release in the postprandial period [21].
        
        //Glucose excretion in urine
        
        bgl = body.blood.getBGL();

        if( bgl > reabsorptionThreshold_ )
        {
            x = (double) glucoseExcretionRate__.sample();
            double g = x*(bgl-reabsorptionThreshold_);
            body.blood.removeGlucose(g);
            System.out.println("glucose excretion in urine " + g);
        }
        
        //SimCtl.time_stamp();
        //System.out.println(" Kidney:: " + glucose + " " + glucose/fluidVolume_);
    }
    
    void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.KIDNEY.value).entrySet()) {
    		switch (e.getKey()) {
    			case "fluidVolume_" : { fluidVolume_ = e.getValue(); break; }
    			case "Glut2VMAX_" : { Glut2VMAX_ = e.getValue(); break; }
    			case "Glut2Km_" : { Glut2Km_ = e.getValue(); break; }
    			case "Glut1Rate_" : { Glut1Rate_ = e.getValue(); break; }
    			case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
    			case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
    			case "gluconeogenesisRate_" : { gluconeogenesisRate_ = e.getValue(); break; }
    			case "glutamineConsumed_" : { glutamineConsumed_ = e.getValue(); break; }
    		}
    	}
    }
}

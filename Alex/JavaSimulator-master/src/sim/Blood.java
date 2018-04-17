package sim;
import java.util.Map.Entry;
import org.apache.commons.math3.distribution.PoissonDistribution;

import enums.BodyOrgan;

public class Blood {
	private static final int ONEDAY = 24*60;
	private static final int MAXAGE = 120*24*60;
	// minutes in 120 days
	
	private static final int HUNDREDDAYS = 100;
	// minutes in 100 days
	
	static class RBCBin {
		double RBCs;
		double glycatedRBCs;
	}
	
	private RBCBin[] AgeBins = new RBCBin[MAXAGE+1];// Aging Bins
    private int bin0;	// Current age 0 bin
    
    private double  rbcBirthRate_; // how many million RBCs take birth each minute
    private double glycationProbSlope_; // g*l_i + c is the probability that an unglycated RBC glycates during a minute
    private double glycationProbConst_;
    private double minGlucoseLevel_;
    private double glycolysisMin_;
    private double glycolysisMax_;
    
    private double currentHbA1c() {
    	double rbcs = 0;
        double glycated_rbcs = 0;
        for(int i = 0; i <= MAXAGE; i++) {
            rbcs += AgeBins[i].RBCs;
            glycated_rbcs += AgeBins[i].glycatedRBCs;
        }
        if(rbcs == 0) {
            System.out.println("Error in Bloody::currentHbA1c");
            System.exit(1);
        }
        return glycated_rbcs/rbcs;
    }
    
    private void updateRBCs() {
    	// will be called once a day
    	bin0--;
        if( bin0 < 0 ) bin0 = MAXAGE;
        //New RBCs take birth
        AgeBins[bin0].RBCs = rbcBirthRate_;
        AgeBins[bin0].glycatedRBCs = 0;
        //System.out.println("New RBCs: " + AgeBins[bin0].RBCs);
        // Old (100 to 120 days old) RBCs die
        int start_bin = bin0 + HUNDREDDAYS;
        if( start_bin > MAXAGE ) start_bin -= (MAXAGE + 1);
        //System.out.println("Old RBCs Die");
        for(int i = 0; i < (MAXAGE-HUNDREDDAYS); i++) {
        	int j = start_bin = i;
        	if (j < 0) {
        		SimCtl.time_stamp();
        		System.out.println(" RBC bin value negative " + j);
        		System.exit(-1);
        	}
        	if (j > MAXAGE) j -= (MAXAGE + 1);
            double kill_rate = ((double)i)/((double)(MAXAGE-HUNDREDDAYS));
            AgeBins[j].RBCs *= (1.0 - kill_rate);
            AgeBins[j].glycatedRBCs *= (1.0 - kill_rate);
            //System.out.println("bin: " + (start_bin + i) + ", RBCs " + AgeBins[start_bin + i].RBCs + ", Glycated RBCs " + AgeBins[start_bin + i].glycatedRBCs);
        }
        //glycate the RBCs
        double glycation_prob = avgBGLOneDay * glycationProbSlope_ + glycationProbConst_;
        //System.out.println("RBCs glycate");
        for(int i = 0; i <= MAXAGE; i++) {
            double newly_glycated = glycation_prob * AgeBins[i].RBCs;
            AgeBins[i].RBCs -= newly_glycated;
            AgeBins[i].glycatedRBCs += newly_glycated;
            //System.out.println("bin: " + i + ", RBCs " + AgeBins[i].RBCs + ", Glycated RBCs " + AgeBins[i].glycatedRBCs);
        }
        SimCtl.time_stamp();
        System.out.println("New HbA1c: " + currentHbA1c());
    }
    
    private HumanBody body;

    private double highGlucoseLevel_;
    private double highLactateLevel_;
    private double fluidVolume_; // in deciliters
    private double avgBGLOneDay;
    private double avgBGLOneDaySum;
    private double avgBGLOneDayCount;
    
    //All the metabolites are in units of milligrams of glucose
    public double glucose; // in milligrams
    public double normalGlucoseLevel_;
    public double insulin;
    public double lactate;
    public double branchedAminoAcids;
    public double glutamine;
    public double alanine;
    public double unbranchedAminoAcids;
    public double gngSubstrates; // glycerol and other gng substrates (not including lactate, glutamine and alanine), all in units of glucose
    
    // Constructor
    public Blood(HumanBody myBody) {
    	body = myBody;
    	
    	 //tracking RBCs
        bin0 = 1;
        rbcBirthRate_ = 144.0*60*24; // in millions per minute
        glycationProbSlope_ = 0.085/10000.0;
        glycationProbConst_ = 0;
        
        // all contents are in units of milligrams of glucose
        glucose = 5000.0; //5000.0; //15000.0;
        fluidVolume_ = 50.0; // in deciliters
        
        gngSubstrates = 0;
        alanine = 0;
        branchedAminoAcids = 0;
        unbranchedAminoAcids = 0;
        glutamine = 0;
        insulin = 0;
        
        //Gerich: insulin dependent: 1 to 5 micromol per kg per minute
        glycolysisMin_ = 0.1801559;
        glycolysisMax_ = 5*glycolysisMin_;
        
        normalGlucoseLevel_ = 100; //mg/dl
        highGlucoseLevel_ = 200; //mg/dl
        minGlucoseLevel_ = 40; //mg/dl
        highLactateLevel_ = 4053.51; // mg
        // 9 mmol/l of lactate = 4.5 mmol/l of glucose = 4.5*180.1559*5 mg of glucose = 4053.51mg of glucose
        lactate = 0; //450.39; //mg
        // 1mmol/l of lactate = 0.5mmol/l of glucose = 0.5*180.1559*5 mg of glucose = 450.39 mg of glucose

        // initial number of RBCs
        for(int i = 0; i <= MAXAGE; i++)
        {
        	AgeBins[i] = new RBCBin();
            AgeBins[i].RBCs = 0.94*rbcBirthRate_;
            AgeBins[i].glycatedRBCs = 0.06*rbcBirthRate_;
        }
        avgBGLOneDay = 0;
        avgBGLOneDaySum = 0;
        avgBGLOneDayCount = 0;
    }
    
    //Red Blood cells use glucose during glycolysis and produce lactate
    
   //As part of "blood" class, RBCs consume about 25mg of glucose every 
   //minute and convert it to lactate via glycolysis. 
    public void processTick() {
	    double x; // to hold the random samples
	
	    PoissonDistribution glycolysisMin__ = new PoissonDistribution(100.0*glycolysisMin_);
	    
	    //RBCs consume about 25mg of glucose every minute and convert it to lactate via glycolysis.
	    //Gerich: Glycolysis. Depends on insulin level. Some of the consumed glucose becomes lactate.
	    
	    double scale = (1.0 - body.insulinResistance_)*(body.blood.insulin);
	    
	    x = (double) glycolysisMin__.sample();
	    x = x*(body.bodyWeight_)/100.0;
	    
	    if( x > glycolysisMax_*(body.bodyWeight_))
	        x = glycolysisMax_*(body.bodyWeight_);
	    
	    double toGlycolysis = x + scale * ( (glycolysisMax_*(body.bodyWeight_)) - x);
	    
	    if( toGlycolysis > glucose) toGlycolysis = glucose;
	    
	    glucose -= toGlycolysis;
	    body.blood.lactate += toGlycolysis;
	    //System.out.println("Glycolysis in blood, blood glucose " + glucose + " mg, lactate " + lactate + " mg")
	    
	    double bgl = glucose/fluidVolume_;
	    
	    //update insulin level
	    
	    if( bgl >= highGlucoseLevel_)
	        insulin = body.insulinPeakLevel_;
	    else
	    {
	        if( bgl < normalGlucoseLevel_)
	            insulin = 0;
	        else
	        {
	            insulin = (body.insulinPeakLevel_)*(bgl - normalGlucoseLevel_)/(highGlucoseLevel_ - normalGlucoseLevel_);
	        }
	    }
	    
	  //calculating average bgl during a day
	    
	    if( avgBGLOneDayCount == ONEDAY )
	    {
	        avgBGLOneDay = avgBGLOneDaySum/avgBGLOneDayCount;
	        avgBGLOneDaySum = 0;
	        avgBGLOneDayCount = 0;
	        updateRBCs();
	        SimCtl.time_stamp();
	        System.out.println(" Blood::avgBGL " + avgBGLOneDay);
	    }
	    
	    avgBGLOneDaySum += bgl;
	    avgBGLOneDayCount++;
	    
	    SimCtl.time_stamp();
	    System.out.println("Blood:: bgl " + getBGL());
	    
	    //BUKET NEW: For the calculation of Incremental AUC
	    //if(glcs > 100 && SimCtl::ticks < 120){
	    //  SimCtl::AUC = SimCtl::AUC + (glcs-100);
	    //}
    }
    
    public void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BLOOD.value).entrySet()) {
    		switch (e.getKey()) {
    			case "rbcBirthRate_" : { rbcBirthRate_ = e.getValue(); break; }
    			case "glycationProbSlope_" : { glycationProbSlope_ = e.getValue(); break; }
    			case "glycationProbConst_" : { glycationProbConst_ = e.getValue(); break; }
    			case "minGlucoseLevel_" : { minGlucoseLevel_ = e.getValue(); break; }
    			case "normalGlucoseLevel_" : { normalGlucoseLevel_ = e.getValue(); break; }
    			case "highGlucoseLevel_" : { highGlucoseLevel_ = e.getValue(); break; }
    			case "highLactateLevel_" : { highLactateLevel_ = e.getValue(); break; }
    			case "glycolysisMin_" : { glycolysisMin_ = e.getValue(); break; }
    			case "glycolysisMax_" : { glycolysisMax_ = e.getValue(); break; }
    		}
    	}
    }
    
    public void removeGlucose(double howmuch) {
    	 glucose -= howmuch;
    	//System.out.println("Glucose consumed " + howmuch + " ,glucose left " + glucose);
	    if (getBGL() <= minGlucoseLevel_) {
	        SimCtl.time_stamp();
	        System.out.println(" bgl dips to: " + getBGL());
	        System.exit(-1);
	    }
    }
    public void addGlucose(double howmuch) {
    	glucose += howmuch;
	    //SimCtl.time_stamp();
	    //System.out.println(" BGL: " + getBGL());
    }
    
    public double getBGL() { return glucose/fluidVolume_; }

    public double getGNGSubstrates(){ 
    	return (gngSubstrates + lactate + alanine + glutamine);
    }
    
    public double consumeGNGSubstrates(double howmuch) {
    	double total = gngSubstrates + lactate + alanine + glutamine;
	    if( total < howmuch ) {
	        gngSubstrates = 0;
	        lactate = 0;
	        alanine = 0;
	        glutamine = 0;
	        return total;
	    }
	    double factor = (total - howmuch)/total;
	    gngSubstrates *= factor;
	    lactate *= factor;
	    alanine *= factor;
	    glutamine *= factor;
	    return howmuch;
    }
    
    public double gngFromHighLactate(double rate_) {
    	// Gluconeogenesis will occur even in the presence of high insulin in proportion to lactate
    	// concentration. High lactate concentration (e.g. due to high glycolytic activity) would 
    	// cause gluconeogenesis to happen even if insulin concentration is high. But then 
    	// Gluconeogenesis would contribute to glycogen store of the liver (rather than generating glucose).
    	
    	// rate_ is in units of mg per kg per minute
	    double x = 3*rate_ * lactate/highLactateLevel_;
	    
	    if( x > lactate ) x = lactate;
	    
	    lactate -= x;
	    return x;
    }
}
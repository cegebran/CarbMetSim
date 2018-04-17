package sim;
import java.util.Map.Entry;

import enums.BodyOrgan;

public class AdiposeTissue {

	private double glucoseAbsorbed_;
    private double bAAToGlutamine_;
    private double lipolysisRate_;
    private double fat; // fat in body in grams
    
    //Adipose tissues and muscle together consume about 15mg/minute of glucose (for a person with weight 65kg) at the post absorptive state.
    // Mukul: Muscles are already consuming 0.334*65 = 22.36mg of glucose every minute at the basal level.
    
    //glucose is converted to Glycerol-3-Phosphate by glycolysis
    //We assume that the adipose tissue does not consume any glucose FOR GLYCOLYSIS and does not produce any glycerol DURING FAT STORAGE.
    //Adipose tissue does produce glycerol via lipolysis.
    
    //void glucoseToGlycerol3P (int glucoseRateToGlycerol3P_);
    
    //***************************************************************************************************************
    //TO CHECK: It is mentioned that alanine and glutamine are taken up from blood. What is it used for? Can we ignore it???
    //It is also mentioned alanine and glutamine are synthesised and released.
    //***************************************************************************************************************
    //In conclusion, we find human adipose tissue in vivo to have a pattern of amino acid metabolism which is qualitatively 
    //similar to that of skeletal muscle. Rates of alanine and glutamine release and of glutamate uptake by adipose tissue 
    //are not insignificant compared with those of skeletal muscle. "Amino acid metabolism in human subcutaneous adipose tissue in vivo".
    //Glucose is converted to glutamine 20% of total glutamine is released by adipose tissue
    //"Adipose Tissue Branched Chain Amino Acid (BCAA) Metabolism Modulates Circulating BCAA Levels"
    //BCAAs are oxidized in adipose tissue.
    //"Leucine Degradation and Release of Glutamine and Alanine by Adipose Tissue"
    //During fed state branched amino acids are oxidized and converted to alanine and glutamine
    
    HumanBody body;
    
    //Set Default Values
    public AdiposeTissue(HumanBody myBody) {
    	body = myBody;
    	glucoseAbsorbed_ = 0;
        bAAToGlutamine_ = 0;
        lipolysisRate_ = 0;
        fat = (body.fatFraction_)*(body.bodyWeight_)*1000.0;
    }
    
    public void processTick() {
    	//Consume some glucose for de novo lipogenesis (needs high insulin and hence would happen in fed state only).
        //Absorbs glucose via GLUT4 when insulin concentration is high. This glucose can be used for oxidation or glycolysis (to form lactate) or de novo lipogenesis.
            
        //generate glycerol via lipolysis (happens when insulin levels are very low). Is there any other source of glycerol (fat in food must also be producing glycerol -need to check)? What is glycerol used for besides gluconeogenesis? How important is glycerol for gluconeogenesis?
                
        //So, this is what I think at the moment. If we limit our focus to adipose tissue, this is what happens in fat storage (Fig 5.16 in Frayn's book):
                                                                                                                                      
          //  TAG -> fatty acids + glycerol
          //  Glucose --> Glycerol 3P (via glycolysis)
          //  fatty acids + glycerol 3P --> TAG
                                                                                                                                      
        //Since we are planning to not keep track of TAG in blood, we can assume that glycerol produced above is balanced by glucose consumed via glycolysis.
                                                                                                                                      
        //So, for the simulator, we can assume that glycerol is produced only via lipolysis in adipose tissue and fat storage (or TAG consumption elsewhere)
    	//has no contribution towards glycerol production.
                                                                                                                              
        //>So, during fat storage, we assume that no glucose is used and no glycerol is produced, right?
                                                                                                                              
        //We assume that the adipose tissue does not consume any glucose FOR GLYCOLYSIS and does not produce any glycerol DURING FAT STORAGE. 
    	//Adipose tissue does produce glycerol via lipolysis.
        
        //NEW VERSION:
        //We know that Adipose Tissue (AT) glucose uptake is very similar to muscle. So we use the same formula that we used in muscle.
        //Estimated total muscle glucose uptake in our nonobese subjects was equivalent to approximately 41% of meal carbohydrate ingested, 
    	//whereas whole-body AD uptake was only 7%.This is for nonobese subjects, but for obese subjects it is like 17%, so it depends on the body weight
    	//- See more at:http://press.endocrine.org/doi/10.1210/jc.2008-2297?url_ver=Z39.88-2003&rfr_id=ori:rid:crossref.org&rfr_dat=cr_pub%3dpubmed#sthash.dmCcwKSX.dpuf
        //So the glucoseAbsorbed_ parameter for AT is 1/5 th of the parameter of Muscle.
        
        //Since we ignore glycolysis in adipose tissue, I also ignore the basal glucose uptake, because it is for glycolysis, in here we do not have basal glucose absorption, which is different than muscle.

        // glycerol generation via lipolysis
        
        if( body.blood.getBGL() < body.blood.normalGlucoseLevel_ ) {
            double lipolysis = body.insulinResistance_*lipolysisRate_;
            body.blood.gngSubstrates += lipolysis;
        } else {
            body.blood.gngSubstrates += lipolysisRate_;
        }
        
        //"As discussed above, alanine and glutamine predominate among the amino acids leaving muscle. This is also true of other “peripheral tissues,”
        //including adipose tissue and brain."
        
        //Alanine is presumably generated via glycolysis which we are not modeling in adipose tissue
        
        //Here, we generate glutamine from branched amino acids.
        if( body.blood.branchedAminoAcids > bAAToGlutamine_ ) {
            body.blood.branchedAminoAcids -= bAAToGlutamine_;
            body.blood.glutamine += bAAToGlutamine_;
        } else {
            body.blood.glutamine += body.blood.branchedAminoAcids;
            body.blood.branchedAminoAcids = 0;
        }
        
        //System.out.println("Total Glucose Absorbed by Adipose Tissue " + totalGlucoseAbsorption);
        //System.out.println("Glucose_Consumed_in_a_Minute_by_AdiposeTissue " + glucoseConsumedINaMinute);
        
        SimCtl.time_stamp();
        System.out.println(" BodyWeight: " + body.bodyWeight_);
    }
    
    public void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.ADIPOSE_TISSUE.value).entrySet()) {
    		switch (e.getKey()) {
    			case "glucoseAbsorbed_" : { glucoseAbsorbed_ = e.getValue(); break; }
    			case "lipolysisRate_" : { lipolysisRate_ = e.getValue(); break; }
    			case "bAAToGlutamine_" : { bAAToGlutamine_ = e.getValue(); break; }
    		}
    	}
    }
    
    public void lipogenesis(double glucoseInMG) {
    	// one gram of glucose has 4kcal of energy
        // one gram of TAG has 9 kcal of energy
        //System.out.println("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
        body.bodyWeight_ -= fat/1000.0;
        fat += glucoseInMG*4.0/9000.0;
        body.bodyWeight_ += fat/1000.0;
        //System.out.println("BodyWeight: Lipogenesis " + body.bodyWeight_ + " glucose " + glucoseInMG + " fat " + fat);
    }
    
    
    public void consumeFat(double kcal) {
    	body.bodyWeight_ -= fat/1000.0;
        fat -= kcal/9.0;
        body.bodyWeight_ += fat/1000.0;
    }
    
    public void addFat(double newFatInMG) {
    	 body.bodyWeight_ -= fat/1000.0;
    	 fat += newFatInMG/1000.0;
    	 body.bodyWeight_ += fat/1000.0;
    	 //System.out.println("BodyWeight: addFat " + body.bodyWeight_ + " newfat " + newFatInMG);
    } 
}

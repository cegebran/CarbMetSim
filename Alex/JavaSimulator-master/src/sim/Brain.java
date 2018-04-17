package sim;
import java.util.Map.Entry;

import enums.BodyOrgan;

public class Brain {

    //TO CHECK: Release lactate to blood
    //void glucoseToLactate(int glucoseRateToLactate_);
    
    // To CHECK : I have mentioned in my notes that brain generates alanine and glutamine. Further clarification is required on this.
    double glucoseOxidized_; // mg per kg per minute
    double glucoseToAlanine_;
    double bAAToGlutamine_;
    HumanBody body;

    
    //Set default values
    public Brain(HumanBody myBody) {
    	// 6 micromol per kg per minute = 6*180.1559/1000 mg per kg per minute = 1.08 mg per kg per minute
        glucoseOxidized_ = 1.08;
        glucoseToAlanine_ = 0;
        bAAToGlutamine_ = 0;
        body = myBody;
    }
    
    //Release lactate to blood
    /*void glucoseToLactate(int glucoseRateToLactate){
        glucoseRateToLactate_ = glucoseRateToLactate;
        Blood.glucose_ -= glucoseRateToLactate_;
        Blood.lactate_ += glucoseRateToLactate_;
    }*/

    public void processTick() {
        body.blood.removeGlucose((glucoseOxidized_*(body.bodyWeight_))+glucoseToAlanine_);
        body.blood.alanine += glucoseToAlanine_;
        //totalGlucoseAbsorption += (glucoseOxidized_+glucoseToAlanine_);
        
        //System.out.println("glucoseOxidized: " + glucoseOxidized_);
        
        //Brain generate glutamine from branched amino acids.
        if( body.blood.branchedAminoAcids > bAAToGlutamine_ ) {
            body.blood.branchedAminoAcids -= bAAToGlutamine_;
            body.blood.glutamine += bAAToGlutamine_;
        } else {
            body.blood.glutamine += body.blood.branchedAminoAcids;
            body.blood.branchedAminoAcids = 0;
        }
        //System.out.println("Total Glucose Absorbed by Brain " + totalGlucoseAbsorption)
    }
    
    public void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.BRAIN.value).entrySet()) {
    		switch (e.getKey()) {
    			case "glucoseOxidized_" : { glucoseOxidized_ = e.getValue(); break; }
    			case "glucoseToAlanine_" : { glucoseToAlanine_ = e.getValue(); break; }
    			case "bAAToGlutamine_" : { bAAToGlutamine_ = e.getValue(); break; }
    		}
    	}
    	//System.out.println("glucoseOxidized: " + glucoseOxidized_);
    }
}

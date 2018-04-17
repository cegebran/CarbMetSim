package sim;
import java.util.Map.Entry;

import enums.BodyOrgan;

public class Heart {
	private double basalGlucoseAbsorbed_;
    private double Glut4Km_;
    private double Glut4VMAX_;
    
    private double lactateOxidized_;
    private HumanBody body;
    

    public Heart(HumanBody mybody) {
    	body = mybody;
        lactateOxidized_ = 0;
        basalGlucoseAbsorbed_ = 14; //mg per minute
        //Skeletal Muscle Glycolysis, Oxidation, and Storage of an Oral Glucose Load- Kelley et.al.
        
        Glut4Km_ = 5*180.1559/10.0; //mg/dl equivalent of 5 mmol/l
        Glut4VMAX_ = 0; //mg per kg per minute
    }
    
    //The heart absorbs glucose and some lactate (depends on its concentration).
    //Glucose is absorbed via glut4. So, high insulin concentration (i.e. fed state)
    //is required for the heart to use glucose for its energy needs. The following
    //paper has numbers for how much glucose and lactate is used by the heart.
    
    void processTick() {
        //NEW VERSION
        //In the heart there is significant expression of GLUT1 (2), which under certain circumstances is responsible for a significant component of basal cardiac glucose uptake.
        //The most abundant glucose transporter in the heart is the GLUT4 transporter, so it depends on BGL. Reference paper: "Glucose transport in the heart."
        
        //double basalAbsorption = basalGlucoseAbsorbed_*(body.bodyWeight_);
        double basalAbsorption = basalGlucoseAbsorbed_;
        body.blood.removeGlucose(basalAbsorption);
        
        // Absorption via GLUT4
        
        double bgl = body.blood.getBGL();
        double scale = (1.0 - body.insulinResistance_)*(body.blood.insulin)*(body.bodyWeight_);
        double g = scale*Glut4VMAX_*bgl/(bgl + Glut4Km_);
        
        body.blood.removeGlucose(g);

        if( body.blood.lactate >= lactateOxidized_ ) {
            body.blood.lactate -= lactateOxidized_;
        } else {
            body.blood.lactate = 0;
        }
        
        //System.out.println("Total Glucose Absorbed by Heart " + totalGlucoseAbsorption);
    }
    
    void setParams() {
    	for(Entry<String,Double> e : body.metabolicParameters.get(body.bodyState.state).get(BodyOrgan.HEART.value).entrySet()) {
    		switch (e.getKey()) {
    			case "lactateOxidized_" : { lactateOxidized_ = e.getValue(); break; }
    			case "basalGlucoseAbsorbed_" : { basalGlucoseAbsorbed_ = e.getValue(); break; }
    			case "Glut4Km_" : { Glut4Km_ = e.getValue(); break; }
    			case "Glut4VMAX_" : { Glut4VMAX_ = e.getValue(); break; }
    		}
    	}
    }
}

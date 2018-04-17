package sim;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import enums.BodyOrgan;
import enums.BodyState;
import sim.Liver.PortalVein;

public class HumanBody {
	
	static class FoodType {
	    int foodID_;
	    String name_;
	    double servingSize_; // in grams
	    double RAG_; // rapidly available glucose (in grams)
	    double SAG_; // slowly available glucose (in grams)    
	    double protein_; // in grams
	    double fat_; // in grams
	}

	static class ExerciseType {
	    int exerciseID_;
	    String name_;
	    double intensity_; //intensity in METs
	    double postExerciseDurationFraction_; // per minute of exercise
	}
	
	public Map<Long,FoodType> foodTypes = new HashMap<>();
	public Map<Long,ExerciseType> exerciseTypes = new HashMap<>();
	public Map<BodyState,Map<BodyOrgan,Map<String,Double>>> metabolicParameters = new HashMap<>();
	
	// send organs their new rates when the state changes
	void setParams() {
		//send new metabolic rates (based on the new state) to each organ
	    
	    //Another variable inside "human body" will be insulin resistance. This configured constant will have a value between 0 and 1. This constant will determine how efficiently GLUT4 based glucose absorption works.
	    
	    /*Insulin resistance effects:
	     
	     1) Absorption of glucose by muscles and adipose tissue slows down
	     2) Absorption of glucose by liver (to form glycogen) slows down
	     3) glycogen breakdown and gluconeogenesis does not slow down even in presence of high insulin
	     4) Glycerol release via lipolysis in adipose tissue does not slow down even in presence of high insulin*/
		if (metabolicParameters.isEmpty()) return;
		for(Entry<String,Double> e : metabolicParameters.get(bodyState.state).get(BodyOrgan.HUMAN_BODY.value).entrySet()) {
    		switch (e.getKey()) {
    			case "insulinResistance_" : { insulinResistance_ = e.getValue(); break; }
    			case "insulinPeakLevel_" : { insulinPeakLevel_ = e.getValue(); break; }
    			case "bodyWeight_" : { bodyWeight_ = e.getValue(); break; }
    		}
    	}
		stomachIntestine.setParams();
	    portalVein.setParams();
	    liver.setParams();
	    adiposeTissue.setParams();
	    brain.setParams();
	    heart.setParams();
	    muscles.setParams();
	    blood.setParams();
	    kidney.setParams();
	}
    
    BodyState bodyState;
    double insulinResistance_;
    double insulinPeakLevel_;
    double bodyWeight_;
    double fatFraction_;
    long currExercise;
    double currEnergyExpenditure; // current energy expenditure in kcal/minute
    long exerciseOverAt; // when does the current exercise event get over
    long enterRestingStateAt; // when would the post-exercise get over
    
    StomachIntestine stomachIntestine;
    PortalVein portalVein;
    Liver liver;
    AdiposeTissue adiposeTissue;
    Brain brain;
    Muscles muscles;
    Blood blood;
    Heart heart;
    Kidney kidney;
    
	public HumanBody() {
		stomachIntestine = new StomachIntestine(this);
	    portalVein = new PortalVein(this);
	    liver = new Liver(this);
	    brain = new Brain(this);
	    heart = new Heart(this);
	    blood = new Blood(this);
	    kidney = new Kidney(this);
	    
	    insulinResistance_ = 0;
	    insulinPeakLevel_ = 1.0;
	    bodyState = BodyState.POSTABSORPTIVE_RESTING;
	    bodyWeight_ = 65; //kg
	    fatFraction_ = 0.2;
	    adiposeTissue = new AdiposeTissue(this);
	    muscles = new Muscles(this);
	    
	    currExercise = 0;
	    
	    // current energy expenditure in kcal/minute
	    currEnergyExpenditure = bodyWeight_*(1.0)/60.0;
	    // energy expenditure in resting state is 1 MET
	    
	    exerciseOverAt = 0; // when does the current exercise event get over
	    enterRestingStateAt = 0; // when would the post-exercise get over
	}
        
    void processTick() {
    	//Gerich: In terms of whole-body glucose economy, normally approximately 45% of ingested glucose is thought to be converted to glycogen in the liver, 30% is taken up by skeletal muscle and later converted to glycogen, 15% is taken up by the brain, 5% is taken up by the adipose tissue and 10% is taken up by the kidneys
        //Mukul: Verify this!
        
        // call processTick() on each organ (except portal vein)
        portalVein.processTick();
        stomachIntestine.processTick();
        liver.processTick();
        adiposeTissue.processTick();
        brain.processTick();
        heart.processTick();
        muscles.processTick();
        kidney.processTick();
        blood.processTick();
        
        if (bodyState == BodyState.FED_EXERCISING) {
            if( SimCtl.ticks == exerciseOverAt ) {
                bodyState = BodyState.FED_POSTEXERCISE;
                currEnergyExpenditure = bodyWeight_*(1.0)/60.0;
                // energy expenditure in resting state is 1 MET
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            }
            return;
        }
        
        if (bodyState == BodyState.POSTABSORPTIVE_EXERCISING) {
            if( SimCtl.ticks == exerciseOverAt ) {
                bodyState = BodyState.POSTABSORPTIVE_POSTEXERCISE;
                currEnergyExpenditure = bodyWeight_*(1.0)/60.0;
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            }
            return;
        }
        
        if (bodyState == BodyState.FED_POSTEXERCISE) {
            if( SimCtl.ticks == enterRestingStateAt ) {
                bodyState = BodyState.FED_RESTING;
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            }
            return;
        }
        
        if (bodyState == BodyState.POSTABSORPTIVE_POSTEXERCISE) {
            if( SimCtl.ticks == enterRestingStateAt ) {
                bodyState = BodyState.POSTABSORPTIVE_RESTING;
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            }
            return;
        }
    }
    
    void processFoodEvent(long foodID, long howmuch) {
    	stomachIntestine.addFood(foodID, howmuch);
        
        BodyState oldState = bodyState;
        
        switch (bodyState) {
            case POSTABSORPTIVE_RESTING:
                bodyState = BodyState.FED_RESTING;
                break;
            case POSTABSORPTIVE_EXERCISING:
                bodyState = BodyState.FED_EXERCISING;
                break;
            case POSTABSORPTIVE_POSTEXERCISE:
                bodyState = BodyState.FED_POSTEXERCISE;
            default:
                break;
        }
        
        if( bodyState != oldState) {
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
        }
    }
    
    void processExerciseEvent(long exerciseID, long duration) {
    	// how much calorie would be consumed per minute for this exercise?
        // where would this much calorie come from?
        
        if( isExercising() )
        {
            SimCtl.time_stamp();
            System.out.println("Exercise within Exercise!");
            System.exit(-1);
        }
        
        currExercise = exerciseID;
        currEnergyExpenditure = bodyWeight_*(exerciseTypes.get(exerciseID).intensity_)/60.0;
        // intensity is in METs, where one MET is 1kcal/(kg.hr)
        
        double postExerciseDurationFraction_ = exerciseTypes.get(exerciseID).postExerciseDurationFraction_;
        
        if( bodyState == BodyState.FED_RESTING )
        {
            bodyState = BodyState.FED_EXERCISING;
            exerciseOverAt = SimCtl.ticks + duration;
            enterRestingStateAt = (long) (exerciseOverAt + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
        
        if( bodyState == BodyState.FED_POSTEXERCISE )
        {
            bodyState = BodyState.FED_EXERCISING;
            exerciseOverAt = SimCtl.ticks + duration;
            long leftover = enterRestingStateAt - SimCtl.ticks;
            enterRestingStateAt = (long) (exerciseOverAt + leftover + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
        
        if( bodyState == BodyState.POSTABSORPTIVE_RESTING )
        {
            bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            exerciseOverAt = SimCtl.ticks + duration;
            enterRestingStateAt = (long) (exerciseOverAt + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
        
        if( bodyState == BodyState.POSTABSORPTIVE_POSTEXERCISE )
        {
            bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            exerciseOverAt = SimCtl.ticks + duration;
            long leftover = enterRestingStateAt - SimCtl.ticks;
            enterRestingStateAt = (long) (exerciseOverAt + leftover + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
    }
    
    // XXX: Original param (const char* file)
    void readFoodFile(String filename) {
    	BufferedReader br = null;
    	FileReader fr = null;
    	try {
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		String line = null;
    		while ((line = br.readLine()) != null) {
    			String[] tok = line.split(" ");
    			int id = Integer.valueOf(tok[0]);
    			String name = tok[1];
    			double servingSize = Double.valueOf(tok[2]);
    			double RAG = Double.valueOf(tok[3]);
    			double SAG = Double.valueOf(tok[4]);
    			double protein = Double.valueOf(tok[5]);
    			double fat = Double.valueOf(tok[6]);
    			
    			FoodType ft = new FoodType();
    			ft.foodID_ = id;
    			ft.name_ = name;
    			ft.servingSize_ = servingSize;
    			ft.RAG_ = RAG;
    			ft.SAG_ = SAG;
    			ft.protein_ = protein;
    			ft.fat_ = fat;
    			foodTypes.put((long) id, ft);
    		}
    		
    	} catch (IOException e) {
    		System.out.println("Error opening file : " + filename);
    		e.printStackTrace();
    		System.exit(-1);
    	} finally {
    		try {
    			if (br != null) br.close();
    			if (fr != null) fr.close();
    		} catch (IOException ioe) { ioe.printStackTrace(); System.exit(-1); }
    	}
    }
    
    // XXX: Original param (const char* file)
    void readExerciseFile(String filename) {
    	BufferedReader br = null;
    	FileReader fr = null;
    	try {
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		String line = null;
    		while ((line = br.readLine()) != null) {
    			String[] tok = line.split(" ");
    			int id = Integer.valueOf(tok[0]);
    			String name = tok[1];
    			double intensity = Double.valueOf(tok[2]);
    			double postExerciseDur = Double.valueOf(tok[3]);
    			
    			ExerciseType et = new ExerciseType();
    			et.exerciseID_ = id;
    			et.name_ = name;
    			et.intensity_ = intensity;
    			et.postExerciseDurationFraction_ = postExerciseDur;
    			exerciseTypes.put((long) id, et);
    		}
    		
    	} catch (IOException e) {
    		System.out.println("Error opening file : " + filename);
    		e.printStackTrace();
    		System.exit(-1);
    	} finally {
    		try {
    			if (br != null) br.close();
    			if (fr != null) fr.close();
    		} catch (IOException ioe) { ioe.printStackTrace(); System.exit(-1); }
    	}
    }
    
    private int parseBodyState(String s) {
    	switch (s) {
    	case "FED_RESTING": return 0;
    	case "FED_EXERCISING": return 1;
    	case "FED_POSTEXERCISE": return 2;
    	case "POSTABSORPTIVE_RESTING": return 3;
    	case "POSTABSORPTIVE_EXERCISING": return 4;
    	case "POSTABSORPTIVE_POSTEXERCISE": return 5;
    	case "ALL": return Integer.MAX_VALUE;
    	default: return -1;
    	}
    }
    
    private int parseBodyOrgan(String s) {
    	switch (s) {
		case "HUMAN_BODY": return 0;
		case "STOMACH_INTESTINE": return 1;
		case "PORTAL_VEIN": return 2;
		case "LIVER": return 3;
		case "BLOOD": return 4;
		case "MUSCLES": return 5;
		case "BRAIN": return 6;
		case "HEART": return 7;
		case "ADIPOSE_TISSUE": return 8;
		case "KIDNEY": return 9;
		default: return -1;
		}
    }
    
    private BodyState parseBodyState(int id) {
    	switch (id) {
    	case 0: return BodyState.FED_RESTING;
    	case 1: return BodyState.FED_EXERCISING;
    	case 2: return BodyState.FED_POSTEXERCISE;
    	case 3: return BodyState.POSTABSORPTIVE_RESTING;
    	case 4: return BodyState.POSTABSORPTIVE_EXERCISING;
    	case 5: return BodyState.POSTABSORPTIVE_POSTEXERCISE;
    	default: throw new IllegalArgumentException();
    	}
    }
    
    private BodyOrgan parseBodyOrgan(int id) {
    	switch (id) {
		case 0: return BodyOrgan.HUMAN_BODY;
		case 1: return BodyOrgan.STOMACH_INTESTINE;
		case 2: return BodyOrgan.PORTAL_VEIN;
		case 3: return BodyOrgan.LIVER;
		case 4: return BodyOrgan.BLOOD;
		case 5: return BodyOrgan.MUSCLES;
		case 6: return BodyOrgan.BRAIN;
		case 7: return BodyOrgan.HEART;
		case 8: return BodyOrgan.ADIPOSE_TISSUE;
		case 9: return BodyOrgan.KIDNEY;
		default: throw new IllegalArgumentException();
		}
    }
    
    private void logData(int bs, int bo, String p, double v) {
    	BodyState state = parseBodyState(bs);
    	BodyOrgan organ = parseBodyOrgan(bo);
    	if (metabolicParameters.get(state) == null)
    		metabolicParameters.put(state, new HashMap<>());
    	if (metabolicParameters.get(state).get(organ) == null)
    		metabolicParameters.get(state).put(organ, new HashMap<>());
    	metabolicParameters.get(state).get(organ).put(p, v);
    }
    
    // XXX: Original param (const char* file)
    void readParams(String filename) {
    	BufferedReader br = null;
    	FileReader fr = null;
    	try {
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		String line = null;
    		while ((line = br.readLine()) != null) {
    			String[] tok = line.split(" ");
    			if (tok[0].equals("ALL")) {
    				for (int m = 0; m < BodyState.NUM_STATES; ++m) {
    					logData(m,parseBodyOrgan(tok[1]),tok[2],Double.valueOf(tok[3]));
    				}
    			} else {
    				logData(parseBodyState(tok[0]),parseBodyOrgan(tok[1]),tok[2],Double.valueOf(tok[3]));
    			}
    		}
    	} catch (IOException e) {
    		System.out.println("Error opening file : " + filename);
    		e.printStackTrace();
    		System.exit(-1);
    	} finally {
    		try {
    			if (br != null) br.close();
    			if (fr != null) fr.close();
    		} catch (IOException ioe) { ioe.printStackTrace(); System.exit(-1); }
    	}
    }
    
    void stomachEmpty() {
    	BodyState oldState = bodyState;
        //System.out.println();
        //System.out.println("STOMACH EMPTY " + bodyState);
        
        switch (bodyState) {
            case FED_RESTING:
                bodyState = BodyState.POSTABSORPTIVE_RESTING;
                break;
            case FED_EXERCISING:
                bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
                break;
            case FED_POSTEXERCISE:
                bodyState = BodyState.POSTABSORPTIVE_POSTEXERCISE;
            default:
                break;
        }
        
        if( bodyState != oldState) {
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
        }
    }
    
    boolean isExercising() {
    	return ( (bodyState == BodyState.FED_EXERCISING) || 
    			 (bodyState == BodyState.POSTABSORPTIVE_EXERCISING));  
    }
}

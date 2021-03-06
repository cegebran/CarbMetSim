//package sim;
//import java.io.BufferedReader;
//import java.io.FileReader;
//import java.io.IOException;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.Map.Entry;

//import enums.BodyOrgan;
//import enums.BodyState;
//import sim.Liver.PortalVein;


const BodyState = {
    FED_RESTING: 'FED_RESTING',
    FED_EXERCISING: 'FED_EXERCISING',
    POSTABSORPTIVE_RESTING: 'POSTABSORPTIVE_RESTING',
    POSTABSORPTIVE_EXERCISING: 'POSTABSORPTIVE_EXERCISING'
}

const BodyOrgan = {
    HUMAN_BODY: 'HUMAN_BODY',
    INTESTINE: 'INTESTINE',
    PORTAL_VEIN: 'PORTAL_VEIN',
    LIVER: 'LIVER',
    BLOOD: 'BLOOD',
    MUSCLES: 'MUSCLES',
    BRAIN: 'BRAIN',
    HEART: 'HEART',
    ADIPOSE_TISSUE: 'ADIPOSE_TISSUE',
    KIDNEY: 'KIDNEY'
}

   // var foodTypes = new Map();
    /*var exerciseTypes = new Map();
    var metabolicParameters = new Map();

*/

 function parseBodyState(s) {
    	switch (s) {
    	case "FED_RESTING": return 0;
    	case "FED_EXERCISING": return 1;
    	case "FED_POSTEXERCISE": return 2;
    	case "POSTABSORPTIVE_RESTING": return 3;
    	case "POSTABSORPTIVE_EXERCISING": return 4;
    	case "POSTABSORPTIVE_POSTEXERCISE": return 5;
    	case "ALL": return Number.MAX_SAFE_INTEGER;
    	default: return -1;
    	}
    }
    
  function  parseBodyOrgan(s) {
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
    
   function parseBodyState(id) {
    	switch (id) {
    	case 0: return BodyState.FED_RESTING;
    	case 1: return BodyState.FED_EXERCISING;
    	case 2: return BodyState.FED_POSTEXERCISE;
    	case 3: return BodyState.POSTABSORPTIVE_RESTING;
    	case 4: return BodyState.POSTABSORPTIVE_EXERCISING;
    	case 5: return BodyState.POSTABSORPTIVE_POSTEXERCISE;
    	default: console.log("error");
    	}
    }
    
  function  parseBodyOrgan(id) {
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
		default: console.log("error");
		}
    }
    
  function  logData(bs, bo, p, v) {
    	var state = parseBodyState(bs);
    	var organ = parseBodyOrgan(bo);
    	if (this.metabolicParameters.get(state) == null)
    		this.metabolicParameters.set(state, new Map());
    	if (this.metabolicParameters.get(state).get(organ) == null)
    		this.metabolicParameters.get(state).set(organ, new Map());
    	this.metabolicParameters.get(state).get(organ).set(p, v);
    }
    
class HumanBody {
	
	
    initializemaps(){
	
	}
	// send organs their new rates when the state changes
	setParams() {
        ///////////////////============================================================================================
      //  if (metabolicParameters.isEmpty()) return;
        /*
		for(Entry<String,Double> e : metabolicParameters.get(bodyState.state).get(BodyOrgan.HUMAN_BODY.value).entrySet()) {
    		switch (e.getKey()) {
    			case "insulinResistance_" : { insulinResistance_ = e.getValue(); break; }
    			case "insulinPeakLevel_" : { insulinPeakLevel_ = e.getValue(); break; }
    			case "bodyWeight_" : { bodyWeight_ = e.getValue(); break; }
    		}
    	}
        */
		//this.stomachIntestine.setParams();
	    //this.portalVein.setParams();
	    //this.liver.setParams();
	    this.adiposeTissue.setParams();
	    //this.brain.setParams();
	    //this.heart.setParams();
	    //this.muscles.setParams();
	    //this.blood.setParams();
	    //this.kidney.setParams();
	}
    
	constructor() {
      // this.foodTypes = new Map();
      // this.exerciseTypes = new Map();
      this.metabolicParameters = new Map();
	//	 this.stomachIntestine = new StomachIntestine(this);
	  // this.portalVein = new PortalVein(this);
	   // this.liver = new Liver(this);
	    //this.brain = new Brain(this);
	    //this.heart = new Heart(this);
	    //this.blood = new Blood(this);
	    //this.kidney = new Kidney(this);
	    
	    this.insulinResistance_ = 0;
	    this.insulinPeakLevel_ = 1.0;
	    this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
	    this.bodyWeight_ = 65; //kg
	    this.fatFraction_ = 0.2;
	   this.adiposeTissue = new AdiposeTissue(this);
	    //this.muscles = new Muscles(this);
	    
	    this.currExercise = 0;
	    
	    // current energy expenditure in kcal/minute
	    this.currEnergyExpenditure = this.bodyWeight_*(1.0)/60.0;
	    // energy expenditure in resting state is 1 MET
	    
	    this.exerciseOverAt = 0; // when does the current exercise event get over
	    this.enterRestingStateAt = 0; // when would the post-exercise get over
	}
        
    processTick() {
    	//Gerich: In terms of whole-body glucose economy, normally approximately 45% of ingested glucose is thought to be converted to glycogen in the liver, 30% is taken up by skeletal muscle and later converted to glycogen, 15% is taken up by the brain, 5% is taken up by the adipose tissue and 10% is taken up by the kidneys
        //Mukul: Verify this!
        
        // call processTick() on each organ (except portal vein)
        this.portalVein.processTick();
        this.stomachIntestine.processTick();
        this.liver.processTick();
        this.adiposeTissue.processTick();
        this.brain.processTick();
        this.heart.processTick();
        this.muscles.processTick();
        this.kidney.processTick();
        this.blood.processTick();
        

        Console.log(" bgl " + blood.getBGL() + " weight "  + bodyWeight_);

        if (this.bodyState == BodyState.FED_EXERCISING) {
           // if( SimCtl.ticks == this.exerciseOverAt ) {
                this.bodyState = BodyState.FED_POSTEXERCISE;
                this.currEnergyExpenditure = this.bodyWeight_*(1.0)/60.0;
                // energy expenditure in resting state is 1 MET
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            //}
            return;
        }
        
        if (this.bodyState == BodyState.POSTABSORPTIVE_EXERCISING) {
           // if( SimCtl.ticks == this.exerciseOverAt ) {
                this.bodyState = BodyState.POSTABSORPTIVE_POSTEXERCISE;
                this.currEnergyExpenditure = this.bodyWeight_*(1.0)/60.0;
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            //}
            return;
        }
        
        if (this.bodyState == BodyState.FED_POSTEXERCISE) {
            //if( SimCtl.ticks == this.enterRestingStateAt ) {
                this.bodyState = BodyState.FED_RESTING;
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            //}
            return;
        }
        
        if (this.bodyState == BodyState.POSTABSORPTIVE_POSTEXERCISE) {
            //if( SimCtl.ticks == this.enterRestingStateAt ) {
                this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
                //setParams();
                //SimCtl.time_stamp();
                //System.out.println(" HumanBody:: State " + bodyState);
            //}
            return;
        }
    }
    
    processFoodEvent(foodID, howmuch) {
    	this.stomachIntestine.addFood(foodID, howmuch);
        
        var oldState = this.bodyState;
        
        switch (this.bodyState) {
            case BodyState.POSTABSORPTIVE_RESTING:
                this.bodyState = BodyState.FED_RESTING;
                break;
            case BodyState.POSTABSORPTIVE_EXERCISING:
                this.bodyState = BodyState.FED_EXERCISING;
                break;
            //case POSTABSORPTIVE_POSTEXERCISE:
                //this.bodyState = BodyState.FED_POSTEXERCISE;
            default:
                break;
        }
        
        if( this.bodyState != oldState) {
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
        }
    }
    
    processExerciseEvent(exerciseID, duration) {
    	// how much calorie would be consumed per minute for this exercise?
        // where would this much calorie come from?
        
        if( isExercising() )
        {
            //SimCtl.time_stamp();
            console.log("Exercise within Exercise!");
            process.exit();
        }
        
        this.currExercise = exerciseID;
        //this.currEnergyExpenditure = this.bodyWeight_*(this.exerciseTypes.get(exerciseID).intensity_)/60.0;
        // intensity is in METs, where one MET is 1kcal/(kg.hr)
        
        var postExerciseDurationFraction_ = exerciseTypes.get(exerciseID).postExerciseDurationFraction_;
        
        if( this.bodyState == BodyState.FED_RESTING )
        {
            this.bodyState = BodyState.FED_EXERCISING;
            this.exerciseOverAt = SimCtl.ticks + duration;
          //  this.enterRestingStateAt = (this.exerciseOverAt + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
        
        if( this.bodyState == BodyState.FED_POSTEXERCISE )
        {
            this.bodyState = BodyState.FED_EXERCISING;
            this.exerciseOverAt = SimCtl.ticks + duration;
            var leftover = this.enterRestingStateAt - SimCtl.ticks;
            this.enterRestingStateAt = (this.exerciseOverAt + leftover + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
        
        if( this.bodyState == BodyState.POSTABSORPTIVE_RESTING )
        {
            this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            this.exerciseOverAt = SimCtl.ticks + duration;
            this.enterRestingStateAt = (this.exerciseOverAt + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
        
        if( this.bodyState == BodyState.POSTABSORPTIVE_POSTEXERCISE )
        {
            this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            this.exerciseOverAt = SimCtl.ticks + duration;
            var leftover = this.enterRestingStateAt - SimCtl.ticks;
            this.enterRestingStateAt = (this.exerciseOverAt + leftover + duration*postExerciseDurationFraction_);
            //setParams();
            //SimCtl.time_stamp();
            //System.out.println("Entering State " + bodyState);
            return;
        }
    }
    
     readFoodFile(file){
        jQuery.get(file, function(data){
        console.log("READING FOOD FILE");
        console.log("-------------------------------");
        var lines = data.split('\n');
        var lineNum = 0;
        var foodArray = [];
        var food = new HumanBody.FoodType();
        //for loop to seperate each new line of text file
        for(var line = 0; line < lines.length; line++){
            var properties = lines[line].split(' ');
            food.foodID = properties[0];
            food.name = properties[1];
            food.servingSize = properties[2];
            food.RAG = properties[3];
            food.SAG = properties[4];
            food.protein = properties[5];
            food.fat = properties[6];
    
            foodArray[lineNum] = food;
            
            console.log("food types: " + foodArray[lineNum].name + " " + foodArray[lineNum].protein);
            lineNum++;
            
            console.log("-------------------------------");
        }
    });
    }


    
    // XXX: Original param (const char* file)/*
    /*readFoodFile(filename) {
    	var BufferedReader =   Java.type("java.io.BufferedReader");
        var FileReader =  Java.type("java.io.FileReader");
        var br = new BufferedReader;
        br = null;
        var fr = new FileReader;
        fr = null;
    	try {
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		var line = null;
    		while ((line = br.readLine()) != null) {
    			var tok = line.split(" ");
    			var id = Number.prototype.valueOf(tok[0]);
    			var name = tok[1];
    			var servingSize = Number.prototype.valueOf(tok[2]);
    			var RAG = Number.prototype.valueOf(tok[3]);
    			var SAG = Number.prototype.valueOf(tok[4]);
    			var protein = Number.prototype.valueOf(tok[5]);
    			var fat = Number.prototype.valueOf(tok[6]);
    			
    			var ft = new HumanBody.FoodType();
    			ft.foodID_ = id;
    			ft.name_ = name;
    			ft.servingSize_ = servingSize;
    			ft.RAG_ = RAG;
    			ft.SAG_ = SAG;
    			ft.protein_ = protein;
    			ft.fat_ = fat;
    			this.foodTypes.put(id, ft); ///////////////////////////////////////////
    		}
    		
    	} 
    }*/
    readExerciseFile(file){
        jQuery.get(file, function(data){
        console.log("READING EXERCISE FILE");
        console.log("-------------------------------");
        var lines = data.split('\n');
        var lineNum = 0;
        var exerciseArray = [];
        var exercise = new HumanBody.ExerciseType();
        //for loop to seperate each new line of text file
        for(var line = 0; line < lines.length; line++){
            var properties = lines[line].split(' ');
            exercise.exerciseID = properties[0];
            exercise.name = properties[1];
            exercise.intensity = properties[2];
    
            exerciseArray[lineNum] = exercise;
            
            console.log("exercise: " + exerciseArray[lineNum].name + " " + exerciseArray[lineNum].intensity);
            lineNum++;
            
            console.log("-------------------------------");
        }
    });
    }

    // XXX: Original param (const char* file)
    /*readExerciseFile(filename) {
    	var BufferedReader =   Java.type("java.io.BufferedReader");
        var FileReader =  Java.type("java.io.FileReader");
        var br = new BufferedReader;
        br = null;
        var fr = new FileReader;
        fr = null;
    	
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		var line = null;
    		while ((line = br.readLine()) != null) {
    			var tok = line.split(" ");
    			var id = Number.prototype.valueOf(tok[0]);
    			var name = tok[1];
    			var intensity = Number.prototype.valueOf(tok[2]);
    			var postExerciseDur = Number.prototype.valueOf(tok[3]);
    			
    			var et = new HumanBody.ExerciseType();
    			et.exerciseID_ = id;
    			et.name_ = name;
    			et.intensity_ = intensity;
    			et.postExerciseDurationFraction_ = postExerciseDur;
    			this.exerciseTypes.put( id, et);
    		
    	////////////////////////////////////Check thiss 
    	 
    }*/
    
    parseBodyState(s) {
    	switch (s) {
    	case "FED_RESTING": return 0;
    	case "FED_EXERCISING": return 1;
    	case "FED_POSTEXERCISE": return 2;
    	case "POSTABSORPTIVE_RESTING": return 3;
    	case "POSTABSORPTIVE_EXERCISING": return 4;
    	case "POSTABSORPTIVE_POSTEXERCISE": return 5;
    	case "ALL": return Number.MAX_SAFE_INTEGER;
    	default: return -1;
    	}
    }
    
    parseBodyOrgan(s) {
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
    
    parseBodyState(id) {
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
    
    parseBodyOrgan(id) {
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
    
    logData(bs, bo, p, v) {
    	var state = parseBodyState(bs);
    	var organ = parseBodyOrgan(bo);
    	if (this.metabolicParameters.get(state) == null)
    		this.metabolicParameters.set(state, new Map());
    	if (this.metabolicParameters.get(state).get(organ) == null)
    		this.metabolicParameters.get(state).set(organ, new Map());
    	this.metabolicParameters.get(state).get(organ).set(p, v);
    }
    
    readParams(file){
        jQuery.get(file, function(data){
        console.log("READING Param FILE");
        console.log("-------------------------------");
        var lines = data.split('\n');
        var lineNum = 0;
        //for loop to seperate each new line of text file
        for(var line = 0; line < lines.length; line++){
            var properties = lines[line].split(' ');
          //  if(properties[0] === "ALL"){ // Need to check the parameters
                for (var m = 0; m < BodyState.NUM_STATES; ++m) {
                        logData(m,parseBodyOrgan(properties[1]),properties[2],Number.prototype.valueOf(properties[3]));
                }
            //}//else{
            //logData(parseBodyState(properties[0]),parseBodyOrgan(properties[1]),properties[2],(properties[3]));
        //}
            
            console.log("-------------------------------");
        }
    });  
        console.log("th" + this.metabolicParameters)
    }
    /*
    // XXX: Original param (const char* file)
    readParams(filename) {
        var BufferedReader =   Java.type("java.io.BufferedReader");
    	var FileReader =  Java.type("java.io.FileReader");
        var br = new BufferedReader;
        br = null;
        var fr = new FileReader;
        fr = null;
        		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		var line = null;
    		while ((line = br.readLine()) != null) {
    			var tok = line.split(" "); /// Check this================================
    			if (tok[0].equals("ALL")) { /// CHeck this////////////////////////////////
    				for (var m = 0; m < this.BodyState.NUM_STATES; ++m) {
    					logData(m,parseBodyOrgan(tok[1]),tok[2],Double.valueOf(tok[3])); // Check this
    				}
    			} else {
    				logData(parseBodyState(tok[0]),parseBodyOrgan(tok[1]),tok[2],Double.valueOf(tok[3]));
    			}
    		}
    	
    }
    */
    stomachEmpty() {
    	var oldState = this.bodyState;
         
        switch (this.bodyState) {
            case BodyState.FED_RESTING:
                this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
                break;
            case FBodyState.FED_EXERCISING:
                this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
                break;
            //case FED_POSTEXERCISE:
                //this.bodyState = BodyState.POSTABSORPTIVE_POSTEXERCISE;
            default:
                break;
        }
        
        if( this.bodyState != oldState) {
            //setParams();
            //SimCtl.time_stamp();
            //
        }
    }
    
    isExercising() {
    	return ( (this.bodyState == BodyState.FED_EXERCISING) || 
    			 (this.bodyState == BodyState.POSTABSORPTIVE_EXERCISING));  
    }
}

HumanBody.FoodType = class {
    constructor(){
        var foodID_;
        var name_;
        var servingSize_; // in grams
        var RAG_; // rapidly available glucose (in grams)
        var SAG_; // slowly available glucose (in grams)    
        var protein_; // in grams
        var fat_; // in grams
    }
}

HumanBody.ExerciseType = class {
    constructor(){
        var exerciseID_;
        var name_;
        var intensity_; //intensity in METs
        var postExerciseDurationFraction_; // per minute of exercise
    }
}
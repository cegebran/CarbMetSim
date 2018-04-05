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

class FoodType{
    constructor(){
        this.foodID = "";
        this.name = "";
        this.servingSize = "";
        this.RAG = "";
        this.SAD = "";
        this.protein = "";
        this.fat = "";
    }
};

class ExerciseType{
    constructor(){
        this.exerciseID = "";
        this.name = "";
        this.intensity = "";  
    }
};

class HumanBody {
    constructor(){
        // *****all commented out lines need to be uncommented when add each class for different organs*****

        //this.stomach = new Stomach(this);
        //this.intestine = new Intestine(this);
        //this.portalVein = new PortalVein(this);
        //this.liver = new liverH(this);
        //this.brain = new brainH(this);
        //this.heart = new heartH(this);

        this.insulinResistance_ = 0;
        this.insulinPeakLevel_ = 1.0;
        this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
        this.bodyWeight_ = 65; //kg
        this.fatFraction = 0.2;

        //this.adiposeTissue = new AdiposeTissue(this);
        //this.muscles = new musclesH(this);

        this.currExercise = 0;
        this.currEnergyExpenditure = 1.0/60.0;
        this.exerciseOverAt = 0;
    }

    // do not need to implement ~HumanBody as garbageCollection will take care of all objects (of organs)

    currentEnergyExpenditure(){
        return this.bodyWeight_ * this.currEnergyExpenditure;
    }

    stomachEmpty(){
        this.oldState = this.bodyState;

        switch (this.bodyState){
            case BodyState.FED_RESTING:
                this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
                break;
            case BodyState.FED_EXERCISING:
                this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
                break;
            default:
                break;
        }

        if(this.bodyState != this.oldState){
            // do nothing, original code just has cout but it is commented out
        }
    }

    processTick(){
        portalVein.processTick();
        stomach.processTick();
        intestine.processTick();
        liver.processTick();
        adiposeTissue.processTick();
        brain.processTick();
        heart.processTick();
        muscles.processTick();
        kidneys.processTick();
        blood.processTick();

        // dont worry about time_stamp yet, will be read from real-time database
        Console.log(" bgl " + blood.getBGL() + " weight "  + bodyWeight_);

        if(bodyState == BodyState.FED_EXERCISING){
            // need to work on if statement, read from realtime db
            //if(){
                bodyState = BodyState.FED_RESTING;
                currEnergyExpenditure = 1.0/60.0;
            //}
        }

        if(bodyState == BodyState.POSTABSORPTIVE_EXERCISING){
            // need to work on if statement, read ticks from realtime db
            //if(){
                bodyState = BodyState.POSTABSORPTIVE_RESTING;
                currEnergyExpenditure = 1.0/60.0;
            //}
        }

    }

    setParams(){
        // need to look into how to do iterator
        stomach.setParams();
        intestine.setParams();
        portalVein.setParams();
        liver.setParams();
        adiposeTissue.setParams();
        brain.setParams();
        heart.setParams();
        muscles.setParams();
        blood.setParams();
        kidneys.setParams();
    }

    processFoodEvent(foodID, howmuch){
        this.stomach.addFood(foodId, howmuch);
        this.oldState = this.bodyState;
        switch(this.bodyState){
            case BodyState.POSTABSORPTIVE_RESTING:
                this.bodyState = BodyState.FED_RESTING;
                break;
            case BodyState.POSTABSORPTIVE_EXERCISING:
                this.bodyState = BodyState.FED_EXERCISING;
                break;
            default:
                break;
        }
        
        if(this.bodyState != this.oldState){
            // all this code was commented out in original
            //setParams();
            //SimCtl::time_stamp();
            //cout << "Entering State " << bodyState << endl;
        }     
    }

    isExercising(){
        if(this.bodyState == BodyState.FED_EXERCISING || this.bodyState == BodyState.POSTABSORPTIVE_EXERCISING){
            return true;
        }else{
            return false;
        }
    }
    
    processExerciseEvent(exerciseID, duration){
        if(this.isExercising()){
            // convert when work on real-time database
            // SimCtl::time_stamp();

            Console.log("Exercise within Exercise!");
            process.exit();
        }

        this.currExercise = exerciseID;

        // need to look into Javascript maps
        //currEnergyExpenditure = (exerciseTypes[exerciseID].intensity_)/60.0;

        if(this.bodyState == BodyState.FED_RESTING){
            this.bodyState = BodyState.FED_EXERCISING;
            // Look into accessing SimCtl
            //exerciseOverAt = SimCtl::ticks + duration;
            return;
        }

        if(this.bodyState == BodyState.POSTABSORPTIVE_RESTING){
            this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            // Look into accessing SimCtl
            // exerciseOverAt = SimCtl::ticks + duration;
            return;
        }
    }

    readExerciseFile(file){
        jQuery.get(file, function(data){
        console.log("READING EXERCISE FILE");
        console.log("-------------------------------");
        var lines = data.split('\n');
        var lineNum = 0;
        var exerciseArray = [];
        var exercise = new ExerciseType();
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

    readFoodFile(file){
        jQuery.get(file, function(data){
        console.log("READING FOOD FILE");
        console.log("-------------------------------");
        var lines = data.split('\n');
        var lineNum = 0;
        var foodArray = [];
        var food = new FoodType();
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

    readParams(file){
        // may not need to be implemented depending on real-time database
    }
}

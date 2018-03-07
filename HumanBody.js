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
        return bodyWeight_ * currEnergyExpenditure;
    }

    stomachEmpty(){
        var oldState = bodyState;

        switch (bodyState){
            case BodyState.FED_RESTING:
                bodyState = BodyState.POSTABSORPTIVE_RESTING;
                break;
            case BodyState.FED_EXERCISING:
                bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
                break;
            default:
                break;
        }

        if(bodyState != oldState){
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
        stomach.addFood(foodId, howmuch);
        var oldState = bodyState;
        switch(bodyState){
            case BodyState.POSTABSORPTIVE_RESTING:
                bodyState = BodyState.FED_RESTING;
                break;
            case BodyState.POSTABSORPTIVE_EXERCISING:
                bodyState = BodyState.FED_EXERCISING;
                break;
            default:
                break;
        }
        
        if(bodyState != oldState){
            // all this code was commented out in original
            //setParams();
            //SimCtl::time_stamp();
            //cout << "Entering State " << bodyState << endl;
        }     
    }

    isExercising(){
        if(bodyState == BodyState.FED_EXERCISING || bodyState == BodyState.POSTABSORPTIVE_EXERCISING){
            return true;
        }else{
            return false;
        }
    }
    
    processExerciseEvent(exerciseID, duration){
        if( isExercising() ){
            // convert when work on real-time database
            // SimCtl::time_stamp();

            Console.log("Exercise within Exercise!");
            process.exit();
        }

        currExercise = exerciseID;

        // need to look into Javascript maps
        //currEnergyExpenditure = (exerciseTypes[exerciseID].intensity_)/60.0;

        if(bodyState == BodyState.FED_RESTING){
            bodyState = BodyState.FED_EXERCISING;
            // Look into accessing SimCtl
            //exerciseOverAt = SimCtl::ticks + duration;
            return;
        }

        if(bodyState == POSTABSORPTIVE_RESTING){
            bodyState = POSTABSORPTIVE_EXERCISING;
            // Look into accessing SimCtl
            // exerciseOverAt = SimCtl::ticks + duration;
            return;
        }
    }

    readExerciseFile(file){
        // may not need to be implemented depending on real-time database
    }

    readFoodFile(file){
        // may not need to be implemented depending on real-time database
    }

    readParams(file){
        // may not need to be implemented depending on real-time database
    }
}

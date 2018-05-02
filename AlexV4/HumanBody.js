//var firebase = require('firebase');
//var async = require('async');

const TICKS_PER_DAY = 24 * 60;
const TICKS_PER_HOUR = 60;

const EventType = {
    FOOD: 'FOOD',
    EXERCISE: 'EXERCISE',
    HALT: 'HALT',
    METFORMIN: 'METFORMIN',
    INSULIN_SHORT: 'INSULIN_SHORT',
    INSULIN_LONG: 'INSULIN_LONG'
}

class Event{
    constructor(){
        this.type = 0;
        this.subtype = 0;
        this.howmuch = 0;
        this.day = 0;
        this.hour = 0;
        this.minutes = 0;
        this.fireTime = 0;
    }
};

class FoodEvent extends Event {
    constructor (fireTime, quantity, foodID) {
        super(fireTime);
        this.quantity_ = quantity;
        this.foodID_ = foodID;
    }
}

class ExerciseEvent extends Event {
    constructor (fireTime, duration, exerciseID) {
        super(fireTime);
        this.duration_ = duration;
        this.exerciseID_ = exerciseID;
    }
}

class HaltEvent extends Event {
    constructor (fireTime){
        super(fireTime);
    }
}

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
        this.foodID = 0;
        this.name = "";
        this.servingSize = 0;
        this.RAG = 0;
        this.SAG = 0;
        this.protein = 0;
        this.fat = 0;
    }
};

class ExerciseType{
    constructor(){
        this.exerciseID = 0;
        this.name = "";
        this.intensity = 0;  
    }
};

class HumanBody{
    constructor(){
        // *****all commented out lines need to be uncommented when add each class for different organs*****
        
        //we need to have exerciseType array implemented
        //for organ muscles that calls body.exerciseType array
        //var intensity = this.body.exerciseTypes[this.body.currExercise].intensity;
        
        //Need to have foodTypes map implemented
        
        //Need to have array for Exercise and Food objects
        
        //Food Types Array
        this.foodTypesArr = [];
        
        this.addFoodType(0, 0, "glucose", 75, 75, 0 , 0, 0);
        this.addFoodType(1, 1, "White_Bread", 100, 41.4, 4.1 , 5, 3.3);
        this.addFoodType(2, 2, "Brown_Rice", 100, 16.3, 10.2 , 2, 1);
        this.addFoodType(3, 3, "Kidney_Bean", 100, 5.6, 10.9 , 9, 1);
        this.addFoodType(4, 4, "Rice_Krispies", 100, 80.3, 1.9 , 6.8, 1);
        
        console.log("Food Array Length: " + this.foodTypesArr.length);
        
        for(var i = 0; i < this.foodTypesArr.length; i++){
            console.log("name: " + this.foodTypesArr[i].name + " id: " + this.foodTypesArr[i].foodID);
        }
        
        console.log("---------------------------------------------------");
        
        
        //Exercise Types Array
        this.exerciseTypesArr = [];
        
        this.addExerciseType(0, 0 , "LightHouseWork", 2.5);
        this.addExerciseType(1, 1, "Walking", 3.5);
        this.addExerciseType(2, 2, "HeavyHousework", 4.5);
        
        console.log("Exercise Array Length: " + this.exerciseTypesArr.length);
        
        for(var i = 0; i < this.exerciseTypesArr.length; i++){
            console.log("name: " + this.exerciseTypesArr[i].name + " id: " + this.exerciseTypesArr[i].exerciseID);
        }
        
        this.ticks = 0;
        this.insulinResistance_ = 0;
        this.insulinPeakLevel_ = 1.0;
        this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
        this.fatFraction = 0.2;

        //this.adiposeTissue = new AdiposeTissue(this);
        //this.muscles = new musclesH(this);

        this.currExercise = 0;
        this.currEnergyExpenditure = 1.0/60.0;
        this.exerciseOverAt = 0;
        
        this.bodyWeight_ = 65; //kg

        this.eventQ = new PriorityQueue();
        
        this.portalVein = new PortalVein(this);
        this.muscles = new Muscles(this);
        this.liver = new Liver(this);
        this.blood = new Blood(this);
        this.stomach = new Stomach(this);
        this.intestine = new Intestine(this);
        this.brain = new Brain(this);
        this.heart = new Heart(this);
        this.adiposeTissue = new AdiposeTissue(this);
        this.kidneys = new Kidney(this);
    }
    
    addExerciseType(index, exerciseID, name, intensity){
        var element = new ExerciseType();
        element.exerciseID = exerciseID;
        element.name = name;
        element.intensity = intensity;
        
        this.exerciseTypesArr[index] = element;
    }
    
    addFoodType(index, foodID, name, servingSize, RAG, SAG, protein, fat){
        var element = new FoodType();
        element.foodID = foodID;
        element.name = name;
        element.servingSize = servingSize;
        element.RAG = RAG;
        element.SAG = SAG;
        element.protein = protein;
        element.fat = fat;
        
        this.foodTypesArr[index] = element;
    }

    //Original SimCtl Codde now put here
    elapsed_days(){
         return this.ticks / TICKS_PER_DAY; 
    }
    
    elapsed_hours() {
        var x = this.ticks % TICKS_PER_DAY;
        return (x / TICKS_PER_HOUR);
    }
    
    elapsed_minutes() {
        var x = this.ticks % TICKS_PER_DAY;
        return (x % TICKS_PER_HOUR);
    }
    
    time_stamp(){
        console.log(this.elapsed_days() + ":" + this.elapsed_hours() + ":" + this.elapsed_minutes());
    }
    
    processTick(){
        this.brain.processTick();
        this.liver.processTick();
        this.kidneys.processTick();
        this.blood.processTick();
        this.heart.processTick();
        this.portalVein.processTick();
        this.intestine.processTick();
        //console.log(this.stomach.processTick());
        this.adiposeTissue.processTick();
        this.muscles.processTick();
        
        this.time_stamp();
        console.log("bgl: " + this.blood.getBGL());
        
        this.time_stamp();
        console.log("weight: " + this.bodyWeight_);
        
        this.time_stamp();
        console.log("TotalGlycolysis: " + this.intestine.glycolysisPerTick + this.liver.glycolysisPerTick + this.muscles.glycolysisPerTick + this.kidneys.glycolysisPerTick + this.blood.glycolysisPerTick);
        
        this.time_stamp();
        console.log("TotalGNG: " + this.kidneys.gngPerTick + this.liver.gngPerTick);
        
        this.time_stamp();
        console.log("TotalOxidation: " + this.brain.oxidationPerTick + this.heart.oxidationPerTick);
        

        // dont worry about time_stamp yet, will be read from real-time database
        console.log(" bgl " + this.blood.getBGL() + " weight "  + this.bodyWeight_);

        if(this.bodyState == BodyState.FED_EXERCISING){
            // need to work on if statement, read from realtime db
            //if(){
                this.bodyState = BodyState.FED_RESTING;
                this.currEnergyExpenditure = 1.0/60.0;
            //}
        }

        if(this.bodyState == BodyState.POSTABSORPTIVE_EXERCISING){
            // need to work on if statement, read ticks from realtime db
            //if(){
                this.bodyState = BodyState.POSTABSORPTIVE_RESTING;
                this.currEnergyExpenditure = 1.0/60.0;
            //}
        }

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
            this.time_stamp();
            console.log("Exercise within Exercise!");
            process.exit();
        }

        this.currExercise = exerciseID;

        this.currEnergyExpenditure = (this.exerciseTypesArr[exerciseID].intensity_)/60.0;

        if(this.bodyState == BodyState.FED_RESTING){
            this.bodyState = BodyState.FED_EXERCISING;
            this.exerciseOverAt = this.ticks + duration;
            return;
        }

        if(this.bodyState == BodyState.POSTABSORPTIVE_RESTING){
            this.bodyState = BodyState.POSTABSORPTIVE_EXERCISING;
            this.exerciseOverAt = this.ticks + duration;
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
        
        //for loop to seperate each new line of text file
        for(var line = 0; line < lines.length; line++){
            var exercise = new ExerciseType();
            var properties = lines[line].split(' ');
            exercise.exerciseID = properties[0];
            exercise.name = properties[1];
            exercise.intensity = properties[2];
            
            //exerciseArray[lineNum] = exercise;
    
            //this.exerciseTypesArr[lineNum] = exercise;
            //this.exerciseTypesArr[line] = exercise;
            
            //console.log("exercise: " + this.exerciseTypesArr[lineNum].name + " " + this.exerciseTypesArr[lineNum].intensity);
            
            //console.log("exercise: " + exerciseArray[lineNum].name + " subID: " + exerciseArray[lineNum].exerciseID);
            lineNum++;
            
            console.log("-------------------------------");
        }
    });
    }

    readFoodFile(file){
        var foodArray = [];
        
        jQuery.get(file, function(data){
            console.log("READING FOOD FILE");
            console.log("-------------------------------");
            var lines = data.split('\n');
            var lineNum = 0;

            //var foodArray = [];
            //for loop to seperate each new line of text file
            for(var line = 0; line < lines.length; line++){
                var food = new FoodType();
                var properties = lines[line].split(' ');
                food.foodID = properties[0];
                food.name = properties[1];
                food.servingSize = properties[2];
                food.RAG = properties[3];
                food.SAG = properties[4];
                food.protein = properties[5];
                food.fat = properties[6];

                foodArray[lineNum] = food;

                //this.foodTypesArr[0] = 1;
                //console.log(foodArray.length);

                //console.log(this.foodTypesArr.length);
                //console.log(this.foodLength());
                //this.foodTypesArr[lineNum] = food;

                //console.log("food type: " + this.foodTypesArr[lineNum].name + " subID" + this.foodTypesArr[lineNum].protein);

                //console.log("food types: " + foodArray[lineNum].name + " subID: " + foodArray[lineNum].foodID);

                lineNum++;

                console.log("-------------------------------");
            }
        });
        
        console.log(foodArray[0]);
    }
    
    /*
    readTextFile(file)
    {
        var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var data = rawFile.responseText;
                    var lines = data.split('\n');
                    var lineNum = 0;

                    //var foodArray = [];
                    //for loop to seperate each new line of text file
                    for(var line = 0; line < lines.length; line++){
                        var food = new FoodType();
                        var properties = lines[line].split(' ');
                        food.foodID = properties[0];
                        food.name = properties[1];
                        food.servingSize = properties[2];
                        food.RAG = properties[3];
                        food.SAG = properties[4];
                        food.protein = properties[5];
                        food.fat = properties[6];

                        foodArray[lineNum] = food;

                        //this.foodTypesArr[0] = 1;
                        //console.log(foodArray.length);

                        //console.log(this.foodLength());
                        //this.foodTypesArr[lineNum] = food;

                        //console.log("food type: " + this.foodTypesArr[lineNum].name + " subID" + this.foodTypesArr[lineNum].protein);

                        console.log("food types: " + foodArray[lineNum].name + " subID: " + foodArray[lineNum].foodID);

                        lineNum++;

                        console.log("-------------------------------");
                    }
                }
            }
        }
        rawFile.send(null);
    }
    
    */
    
    run_simulation(){
        while(true){
            //keep looping until fire_event() returns -1
                //
            while(this.fire_event() == 1);
            
            this.processTick();
            this.ticks++;
            
            console.log(this.elapsed_days() + ":" + this.elapsed_hours() + ":" + this.elapsed_minutes);
        }
    }
    
    fire_event(){
        var event_ = this.eventQ.front();

        if(event_ === "No elements in Queue"){
            console.log("No event left");
            break;
        }

        //if executing run_simulation initially it will return -1 
        //because this.ticks is initially 0
        if(event_.fireTime > this.ticks){
            return -1;
        }
        
        console.log("ticks = " + this.ticks + ": " + this.elapsed_days() + "::" + this.elapsed_hours() + "::" + this.elapsed_minutes());
        
        console.log("event fire time: " + event_.fireTime);

        var event_type = event_.ID;

        switch(event_type){
            case EventType.FOOD:
                this.processFoodEvent(event_.subID, event_.howmuch);
                break;
            case EventType.EXERCISE:
                this.processExerciseEvent(event_.subID, event_.howmuch)
                break;
            case EventType.HALT:
                // terminate program
                break;
            default:
                break;
        }

        event_ = this.eventQ.dequeue();
        //delete event_;
        return 1;
    }
    
    addEvent(fireTime, type, subtype, howmuch){
        switch (type){
            case EventType.FOOD:
                var e = new QElement(fireTime, type, subtype, howmuch);
                this.eventQ.enqueue(e);
                break;
            case EventType.EXERCISE:
                var e = new QElement(fireTime, type, subtype, howmuch);
                this.eventQ.enqueue(e);
                break;
            case EventType.HALT:
                var e = new QElement(fireTime, type, subtype, howmuch);
                this.eventQ.enqueue(e);
            default:
                break;
        }
    }
    
    readEvents(file){
        jQuery.get(file, function(data){
        console.log("READING EVENTS FILE");
        console.log("-------------------------------");
        var lines = data.split('\n');
        var lineNum = 0;
        var eventArray = [];
        var event = new Event();
        //for loop to seperate each new line of text file
        //type, subtype, howmuch, day, hour, minutes, fireTime
        for(var line = 0; line < lines.length; line++){
            var properties = lines[line].split(':');
            event.type = properties[0];
            event.subtype = properties[1];
            event.howmuch = properties[2];
            event.day = properties[3];
            event.hour = properties[4];
            event.minutes = properties[5];
            event.fire = event.fireTime = event.day * TICKS_PER_DAY + event.hour * TICKS_PER_HOUR + event.minutes;
    
            eventArray[lineNum] = event;
            
            console.log("event: " + "type: " + eventArray[lineNum].type + " subtype: " +  eventArray[lineNum].subtype + " firetime: " + eventArray[lineNum].fireTime);
            lineNum++;
            
            console.log("-------------------------------");
        }
    });
    }

    currentEnergyExpenditure(){
        return this.bodyWeight_ * this.currEnergyExpenditure;
    }

    stomachEmpty(){
        var oldState = this.bodyState;

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
            //setParams();
            //time_stamp();
            //console.log("Entering State " + this.bodyState);
        }
    }

    /*setParams(){
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
    */

    

    readParams(file){
        // may not need to be implemented depending on real-time database
    }
}

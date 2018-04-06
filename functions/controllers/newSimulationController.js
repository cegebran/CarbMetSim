var firebase = require('firebase');
var async = require('async');

// priorityQueue
// User defined class
// to store element and its priority
class QElement {
    constructor(firetime, activityID, subID, howmuch)
    {
        this.firetime = firetime;
        this.ID = activityID;
        this.subID = subID;
        this.howmuch = howmuch;
    }

    costs_less(oqe){
            if(this.firetime < oqe.firetime){
                return true;
            }
            else if(this.firetime > oqe.firetime){
                return false;
            }
            else if(this.firetime === oqe.firetime){
                return "tie";
            }
            else{
                return false;
            }
        }
}

// PriorityQueue class
class PriorityQueue {
 
    // An array is used to implement priority
    constructor()
    {
        this.items = [];
    }
 
    // enqueue function to add element
    // to the queue as per priority
    enqueue(element)
    {
        // creating object from queue element
        //var qElement = new QElement();
        var contain = false;

        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (var i = 0; i < this.items.length; i++) {
            /*if(this.items[i].costs_less(element) === "tie"){
                this.items.splice(i+1,0, element);
            }*/
            if(this.items[i].costs_less(element) === false){
                this.items.splice(i,0, element);
                contain = true;
                break;
            }
        }

        // if the element have the highest priority
        // it is added at the end of the queue
        if (!contain) {
            this.items.push(element);
        }
    }
    
    // dequeue method to remove
    // element from the queue
    dequeue()
    {
        // return the dequeued element
        // and remove it.
        // if the queue is empty
        // returns Underflow
        if (this.isEmpty())
            return "Underflow";
        return this.items.shift();
    }
    
    // front function
    front()
    {
        // returns the highest priority element
        // in the Priority queue without removing it.
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
        //return this.items[0].ID + ", " + this.items[0].firetime;
    }
    
    // rear function
    rear()
    {
        // returns the lowest priorty
        // element of the queue
        if (this.isEmpty())
            return "No elements in Queue";
        return this.items[this.items.length - 1];
        //return this.items[this.items.length - 1].ID + ", " + this.items[this.items.length - 1].firetime;
    }
    
    // isEmpty function
    isEmpty()
    {
        // return true if the queue is empty.
        return this.items.length == 0;
    }
 
    // printQueue function
    // prints all the element of the queue
    printPQueue()
    {
        var str = "";
        for (var i = 0; i < this.items.length; i++)
            str += this.items[i].ID + ", " + this.items[i].firetime + " || ";
        
        return str;
    }
}

//HumanBody
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
}

// SimCtl
const EventType = {
    FOOD: 'FOOD',
    EXERCISE: 'EXERCISE',
    HALT: 'HALT',
    METFORMIN: 'METFORMIN',
    INSULIN_SHORT: 'INSULIN_SHORT',
    INSULIN_LONG: 'INSULIN_LONG'
}

class Event {
    constructor(fireTime, the_type) {
        this.fireTime_ = fireTime;
        this.eventType_ = the_type;
        this.cost0 = fireTime;
        this.cost1 = 0; // possibly redundant and can delete
    }
}

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

class SimCtl {

    constructor(){
        this.ticks = 0;
        this.eventQ = new PriorityQueue();
        this.body = new HumanBody();
        this.TICKS_PER_DAY = 24 * 60;
        this.TICKS_PER_HOUR = 60;
    }

    run_simulation(){
        while(true){
            var val;
            while( (val = this.fire_event()) == 1);
            body.processTick();
            this.ticks++;
        }
    }

    fire_event(){
        var event_ = this.eventQ.front();

        if(event_ === "No elements in Queue"){
            console.log("No event left");
            // terminate program (returning -1 may not be correct)
            return -1;
        }

        if(event_.firetime > this.ticks){
            return -1;
        }

        var event_type = event_.ID;

        switch(event_type){
            case EventType.FOOD:
                body.processFoodEvent(event_.subID, event_.howmuch);
                break;
            case EventType.EXERCISE:
                body.processExerciseEvent(event_.subID, event_.howmuch)
                break;
            case EventType.HALT:
                // terminate program
                break;
            default:
                break;
        }

        event_ = this.eventQ.dequeue();
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

    readEvents(completedActivitiesArray){
        for(var i = 0; i < completedActivitiesArray.length; i++){
            var type = completedActivitiesArray[i].type;
            var typeUpper = type.toUpperCase();
            this.addEvent(completedActivitiesArray[i].fireTime, typeUpper, completedActivitiesArray[i].subtype, completedActivitiesArray[i].howmuch);
        }
    }

    elapsed_days(){
        return(this.ticks/TICKS_PER_DAY);
    }

    elapsed_hours(){
        var x = this.ticks % TICKS_PER_DAY;
        return(x/TICKS_PER_HOUR);
    }

    elapsed_minutes(){
        var x = this.ticks % TICKS_PER_DAY;
        return(x % TICKS_PER_HOUR);
    }
}

// TODO need to figure out how to implement the main function in JavaScript
// also need to determine how we will pass in the arguments that are used when sim ran in colsole
function run_simulation(){
    while (true) {
        var val;
        while( (val = this.fire_event()) == 1);
        // need to convert body->processTick();
        this.ticks++;
    }

    return 0;
}



var activityTypesArray = [
    {
        _id: "Select Activity Type",
        name: "Select Activity Type"
    },
    {
        _id: "Food",
        name: "Food"
    },
    {
        _id: "Exercise",
        name: "Exercise"
    }
];

var amPmArray = [
    {
        _id: "AM",
        name: "AM"
    },
    {
        _id: "PM",
        name: "PM"
    }
];

var monthArray = [
    {
        _id: "Month",
        name: "Month"
    },
    {
        _id: "01",
        name: "January"
    },
    {
        _id: "02",
        name: "February"
    },
    {
        _id: "03",
        name: "March"
    },
    {
        _id: "04",
        name: "April"
    },
    {
        _id: "05",
        name: "May"
    },
    {
        _id: "06",
        name: "June"
    },
    {
        _id: "07",
        name: "July"
    },
    {
        _id: "08",
        name: "August"
    },
    {
        _id: "09",
        name: "September"
    },
    {
        _id: "10",
        name: "October"
    },
    {
        _id: "11",
        name: "November"
    },
    {
        _id: "12",
        name: "December"
    }
];

function dateConversion(dateToConvert){
    return new Date(dateToConvert).getTime();
}

function timeStringCompiler(year, month, day, hour, minute, second, amPm){
    var timeString = year + "-" + month + "-" + day + "T";

        var hourValue;
        if(amPm == "AM"){
            if(hour == "12"){
                hourValue = "00"
            }else{
                hourValue = hour;
            }
        }else{
            if(hour == "12"){
                hourValue = hour;
            }else{
                var hourConv = parseInt(hour);
                var hourConv12 = hourConv + 12;
                hourValue = hourConv12.toString();
            }
        }

        timeString = timeString + hourValue + ":" + minute + ":" + second + ".000Z";
        return timeString;
}

function runSimulationProgram(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, monthSelection0, daySelection0, yearSelection0, hourSelection0, minuteSelection0, secondSelection0, amPmSelection0, foodQtyInput0, exerciseQtyInput0, activityDbArray, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1){
    var nextActivityTypeID = totalActivitiesInDb_1;
    var nextFoodTypeID = totalFoodTypesinDb_1;
    var nextExerciseTypeID = totalExerciseTypesinDb_1;
    
    var simCtl = new SimCtl();

    var completedActivitiesArray = [];

    for(var ai = 0; ai < activityDbArray.length; ai++){
        var timeString = timeStringCompiler(activityDbArray[ai].year, activityDbArray[ai].month, activityDbArray[ai].day, activityDbArray[ai].hour, activityDbArray[ai].minute, activityDbArray[ai].second, activityDbArray[ai].amPm);

        var time = dateConversion(timeString);
        var activity_TypeValue = activityDbArray[ai].activity_type;
        var subTypeNumberValue = activityDbArray[ai].subtype;
        var quantityValue = activityDbArray[ai].quantity;

        var newActivityObj = {fireTime: time, type: activity_TypeValue, subtype: subTypeNumberValue, howmuch: quantityValue};
        completedActivitiesArray.push(newActivityObj);
    }

    //for each element
    var i = 1;

    while(activity_type0[i] != null){
        var activityType = activity_type0[i];
        if(activityType == "Food"){
            var foodType = food_type0[i];
            if(foodType == "+ New Food"){
                var timeString = timeStringCompiler(yearSelection0[i], monthSelection0[i], daySelection0[i], hourSelection0[i], minuteSelection0[i], secondSelection0[i], amPmSelection0[i]);
                var time = dateConversion(timeString);
                var activityTypeValue = activity_type0[i];
                var subTypeValue = nextFoodTypeID;
                var foodQtyInput = foodQtyInput0[i];

                var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: foodQtyInput};
                completedActivitiesArray.push(newActivityObj);

                nextFoodTypeID++;
            }else if(foodType == "Select Food"){
                // no selection made, do not add to simulation
            }else{
                var timeString = timeStringCompiler(yearSelection0[i], monthSelection0[i], daySelection0[i], hourSelection0[i], minuteSelection0[i], secondSelection0[i], amPmSelection0[i]);
                var time = dateConversion(timeString);
                var activityTypeValue = activity_type0[i];
                var subTypeValue = foodType;
                var foodQtyInput = foodQtyInput0[i];

                var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: foodQtyInput};
                completedActivitiesArray.push(newActivityObj);
            }
        }else if(activityType == "Exercise"){
            var exerciseType = exercise_type0[i];
            if(exerciseType == "+ New Exercise"){

                var timeString = timeStringCompiler(yearSelection0[i], monthSelection0[i], daySelection0[i], hourSelection0[i], minuteSelection0[i], secondSelection0[i], amPmSelection0[i]);
                var time = dateConversion(timeString);
                var activityTypeValue = activity_type0[i];
                var subTypeValue = nextExerciseTypeID;
                var exerciseQtyInput = exerciseQtyInput0[i];

                var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: exerciseQtyInput};
                completedActivitiesArray.push(newActivityObj);
                nextExerciseTypeID++;
            }else if(exerciseType == "Select Exercise"){
                // no selection made, do not add to simulation
            }else{
                var timeString = timeStringCompiler(yearSelection0[i], monthSelection0[i], daySelection0[i], hourSelection0[i], minuteSelection0[i], secondSelection0[i], amPmSelection0[i]);
                var time = dateConversion(timeString);
                var activityTypeValue = activity_type0[i];
                var subTypeValue = exerciseType;
                var exerciseQtyInput = exerciseQtyInput0[i];

                var newActivityObj = {fireTime: time, type: activityTypeValue, subtype: subTypeValue, howmuch: exerciseQtyInput};
                completedActivitiesArray.push(newActivityObj);
            }
        }else{
            // no selection made, do not add to simulation
        }
        i++;
    }

    simCtl.readEvents(completedActivitiesArray);
}

function writeActivitySetToDatabaseArray(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, monthSelection0, daySelection0, yearSelection0, hourSelection0, minuteSelection0, secondSelection0, amPmSelection0, foodQtyInput0, exerciseQtyInput0, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1){
    var nextActivityTypeID = totalActivitiesInDb_1;
    var nextFoodTypeID = totalFoodTypesinDb_1;
    var nextExerciseTypeID = totalExerciseTypesinDb_1;

    var userId = firebase.auth().currentUser.uid;

    var newActivitySequenceKey = firebase.database().ref().child('activitySequences').push().key;

    //for each element
    var i = 1;

    while(activity_type0[i] != null){
        var activityType = activity_type0[i];
        if(activityType == "Food"){
            var foodType = food_type0[i];
            if(foodType == "+ New Food"){
                var newFoodName = newFoodName0[i];
                var newFoodServingSize = newFoodServingSize0[i];
                var newFoodFat = newFoodFat0[i];
                var newFoodProtein = newFoodProtein0[i];
                var newFoodRAG = newFoodRAG0[i];
                var newFoodSAG = newFoodSAG0[i];
                writeFoodSubtypeData(nextFoodTypeID, newFoodName, newFoodServingSize, newFoodRAG, newFoodSAG, newFoodProtein, newFoodFat);
                var foodQtyInput = foodQtyInput0[i];
                var monthSelection = monthSelection0[i];
                var daySelection = daySelection0[i];
                var yearSelection = yearSelection0[i];
                var hourSelection = hourSelection0[i];
                var minuteSelection = minuteSelection0[i];
                var secondSelection = secondSelection0[i];
                var amPmSelection = amPmSelection0[i];
                writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, nextFoodTypeID, foodQtyInput, monthSelection, daySelection, yearSelection, hourSelection, minuteSelection, secondSelection, amPmSelection)
                nextFoodTypeID++;
            }else if(foodType == "Select Food"){
                // no selection made, do not add anything to database
            }else{
                var foodQtyInput = foodQtyInput0[i];
                var monthSelection = monthSelection0[i];
                var daySelection = daySelection0[i];
                var yearSelection = yearSelection0[i];
                var hourSelection = hourSelection0[i];
                var minuteSelection = minuteSelection0[i];
                var secondSelection = secondSelection0[i];
                var amPmSelection = amPmSelection0[i];
                writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, foodType, foodQtyInput, monthSelection, daySelection, yearSelection, hourSelection, minuteSelection, secondSelection, amPmSelection)
            }
        }else if(activityType == "Exercise"){
            var exerciseType = exercise_type0[i];
            if(exerciseType == "+ New Exercise"){
                var newExerciseName = newExerciseName0[i];
                var newExerciseIntensity = newExerciseIntensity0[i];
                writeExerciseSubtypeData(nextExerciseTypeID, newExerciseName, newExerciseIntensity);
                var exerciseQtyInput = exerciseQtyInput0[i];
                var monthSelection = monthSelection0[i];
                var daySelection = daySelection0[i];
                var yearSelection = yearSelection0[i];
                var hourSelection = hourSelection0[i];
                var minuteSelection = minuteSelection0[i];
                var secondSelection = secondSelection0[i];
                var amPmSelection = amPmSelection0[i];
                writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, nextExerciseTypeID, exerciseQtyInput, monthSelection, daySelection, yearSelection, hourSelection, minuteSelection, secondSelection, amPmSelection)
                nextExerciseTypeID++;
            }else if(exerciseType == "Select Exercise"){
                // no selection made, do not add anything to database
            }else{
                var exerciseQtyInput = exerciseQtyInput0[i];
                var monthSelection = monthSelection0[i];
                var daySelection = daySelection0[i];
                var yearSelection = yearSelection0[i];
                var hourSelection = hourSelection0[i];
                var minuteSelection = minuteSelection0[i];
                var secondSelection = secondSelection0[i];
                var amPmSelection = amPmSelection0[i];
                writeNewActivitySequenceElement(newActivitySequenceKey, i, activityType, exerciseType, exerciseQtyInput, monthSelection, daySelection, yearSelection, hourSelection, minuteSelection, secondSelection, amPmSelection)
            }
        }else{
            // no selection made, do not add anything to database
        }

        i++;
    }
}

function writeFoodSubtypeData(totalFoodSubtypesPlus, food_name, servingSize, RAG, SAG, protein, fat){
    var userId = firebase.auth().currentUser.uid;

    var foodSubtypeEntry = {
        _id: totalFoodSubtypesPlus,
        food_name: food_name,
        servingSize: servingSize,
        RAG: RAG,
        SAG: SAG,
        protein: protein,
        fat: fat
    };

    var newFoodSubtypeKey = firebase.database().ref().child('foodSubtypes').push().key;

    var foodSubtype = {};
    foodSubtype['/users/' + userId + '/foodSubtypes/' + newFoodSubtypeKey] = foodSubtypeEntry;

    return firebase.database().ref().update(foodSubtype);
}

function writeExerciseSubtypeData(totalExerciseSubtypesPlus, exercise_activity, intensity){
    var userId = firebase.auth().currentUser.uid;

    var exerciseSubtypeEntry = {
        _id: totalExerciseSubtypesPlus,
        exercise_activity: exercise_activity,
        intensity: intensity,
    };

    var newExerciseSubtypeKey = firebase.database().ref().child('exerciseSubtypes').push().key;

    var exerciseSubtype = {};
    exerciseSubtype['/users/' + userId + '/exerciseSubtypes/' + newExerciseSubtypeKey] = exerciseSubtypeEntry;

    return firebase.database().ref().update(exerciseSubtype);
}

function writeNewActivitySequenceElement(newActivitySequenceKey, totalActivitiesInDb_1, activity, subtype, quantity, month, day, year, hour, minute, second, amPm){
    var userId = firebase.auth().currentUser.uid;
    var timestampRecorded = Date.now();
    var activitySequenceElement = {
        _id: totalActivitiesInDb_1,
        activity_type: activity,
        subtype: subtype,
        quantity: quantity,
        month: month,
        day: day,
        year: year,
        hour: hour,
        minute: minute,
        second: second,
        amPm: amPm
    };

    var newActivitySequenceElementKey = firebase.database().ref().child(newActivitySequenceKey).push().key;    // single quotes around newActivity...
    var activitySequenceElements = {};
    activitySequenceElements['/users/' + userId + '/activitySequences/' + newActivitySequenceKey + '/' + newActivitySequenceElementKey] = activitySequenceElement;

    return firebase.database().ref().update(activitySequenceElements);
}

exports.new_simulation_get = function(req, res) {
    var dayArray31 = [];
    var dayArray30 = [];
    var dayArray28 = [];
    var dayString = "Day";
    var dayID = "Day";
    var dayObj = {name: dayString, _id: dayID};
    dayArray31.push(dayObj);
    dayArray30.push(dayObj);
    dayArray28.push(dayObj);
    for(var i = 1; i < 32; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        if(i < 32){
            dayArray31.push(newObj);
        }
        if(i < 31){
            dayArray30.push(newObj);
        }
        if(i < 29){
            dayArray28.push(newObj);
        }
    }

    var yearArray = [];
    var yearString = "Year";
    var yearID = "Year";
    var yearObj = {name: yearString, _id: yearID};
    yearArray.push(yearObj);
    for(var i = 2018; i > 1989; i--){
        var kaString = i;
        var kaID = i;
        var newObj = {name: kaString, _id: kaID};
        yearArray.push(newObj);
    }

    var hourArray = [];
    var hourString = "Hour";
    var hourID = "Hour";
    var hourObj = {name: hourString, _id: hourID};
    hourArray.push(hourObj);
    for(var i = 0; i < 13; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        hourArray.push(newObj);
    }

    var minutesArray = [];
    var minString = "Minute";
    var minID = "Minute";
    var minObj = {name: minString, _id: minID};
    minutesArray.push(minObj);
    for(var i = 0; i < 60; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        minutesArray.push(newObj);
    }

    var secondsArray = [];
    var secString = "Second";
    var secID = "Second";
    var secObj = {name: secString, _id: secID};
    secondsArray.push(secObj);
    for(var i = 0; i < 60; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        secondsArray.push(newObj);
    }

    if( firebase.auth().currentUser ) {
        var foodKeyArray = [];
        var foodKeyDataArray = [];
        var foodActivitiesArray = [];

        var sfname = "Select Food";
        var sfID = "Select Food";
        var sfrag = "";
        var sfsag = "";
        var sffat = "";
        var sfprotein = "";
        var sfservingSize = "";
        var newObjSF = {rag: sfrag, sag: sfsag, _id: sfID, fat: sffat, name: sfname, protein: sfprotein, servingSize: sfservingSize};
        foodKeyDataArray.push(newObjSF);

        var nfname = "+ New Food";
        var nfID = "+ New Food";
        var nfrag = "";
        var nfsag = "";
        var nffat = "";
        var nfprotein = "";
        var nfservingSize = "";
        var newObjSF = {rag: nfrag, sag: nfsag, _id: nfID, fat: nffat, name: nfname, protein: nfprotein, servingSize: nfservingSize};
        foodKeyDataArray.push(newObjSF);
    
        var userId = firebase.auth().currentUser.uid;
        var query = firebase.database().ref('/users/' + userId + '/foodSubtypes').orderByKey();
        query.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.key = childSnapshot.key;
    
                foodKeyArray.push(item);                                              
            });
            for(i = 0; i < foodKeyArray.length; i++){
                var rag = foodKeyArray[i].RAG;
                var sag = foodKeyArray[i].SAG;
                var _id = foodKeyArray[i]._id;
                var fat = foodKeyArray[i].fat;
                var food_name = foodKeyArray[i].food_name;
                var protein = foodKeyArray[i].protein;
                var servingSize = foodKeyArray[i].servingSize;
                var newObj = {rag: rag, sag: sag, _id: _id, fat: fat, name: food_name, protein: protein, servingSize: servingSize};
                foodKeyDataArray.push(newObj);
            }
    
            foodActivitiesArray = foodKeyDataArray;
    
            var exerciseKeyArray = [];
            var exerciseKeyDataArray = [];
            var exerciseActivitiesArray = [];

            var seName = "Select Exercise";
            var seID = "Select Exercise";
            var seIntensity = "";
            var newObjSE = {name: seName, _id: seID, intensity: seIntensity};
            exerciseKeyDataArray.push(newObjSE);
    
            var neName = "+ New Exercise";
            var neID = "+ New Exercise";
            var neIntensity = "";
            var newObjNewe = {name: neName, _id: neID, intensity: neIntensity};
            exerciseKeyDataArray.push(newObjNewe);
        
            var userId = firebase.auth().currentUser.uid;
            var query = firebase.database().ref('/users/' + userId + '/exerciseSubtypes').orderByKey();
            query.once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var item = childSnapshot.val();
                    item.key = childSnapshot.key;
        
                    exerciseKeyArray.push(item);                                              
                });
                for(i = 0; i < exerciseKeyArray.length; i++){
                    var kaString = exerciseKeyArray[i].exercise_activity;
                    var kaID = exerciseKeyArray[i]._id;
                    var kaIntensity = exerciseKeyArray[i].intensity;
                    var newObj = {name: kaString, _id: kaID, intensity: kaIntensity};
                    exerciseKeyDataArray.push(newObj);
                }
        
                exerciseActivitiesArray = exerciseKeyDataArray;
        
                res.render('newSimulation', {activityTypes: activityTypesArray, foodTypes: foodActivitiesArray, exerciseTypes: exerciseActivitiesArray, hours: hourArray, minutes: minutesArray, seconds: secondsArray, amPms: amPmArray, months: monthArray, days31: dayArray31, days30: dayArray30, days28: dayArray28, years: yearArray});
            });
        });
    } else {
        res.render('loginfirstmsg', {result: "One needs to Sign In first before logging a new Activity."});
    } 
};

exports.new_simulation_post = function(req, res) {
    var dayArray31 = [];
    var dayArray30 = [];
    var dayArray28 = [];
    var dayString = "Day";
    var dayID = "Day";
    var dayObj = {name: dayString, _id: dayID};
    dayArray31.push(dayObj);
    dayArray30.push(dayObj);
    dayArray28.push(dayObj);
    for(var i = 1; i < 32; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        if(i < 32){
            dayArray31.push(newObj);
        }
        if(i < 31){
            dayArray30.push(newObj);
        }
        if(i < 29){
            dayArray28.push(newObj);
        }
    }

    var yearArray = [];
    var yearString = "Year";
    var yearID = "Year";
    var yearObj = {name: yearString, _id: yearID};
    yearArray.push(yearObj);
    for(var i = 2018; i > 1989; i--){
        var kaString = i;
        var kaID = i;
        var newObj = {name: kaString, _id: kaID};
        yearArray.push(newObj);
    }

    var hourArray = [];
    var hourString = "Hour";
    var hourID = "Hour";
    var hourObj = {name: hourString, _id: hourID};
    hourArray.push(hourObj);
    for(var i = 0; i < 13; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        hourArray.push(newObj);
    }

    var minutesArray = [];
    var minString = "Minute";
    var minID = "Minute";
    var minObj = {name: minString, _id: minID};
    minutesArray.push(minObj);
    for(var i = 0; i < 60; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        minutesArray.push(newObj);
    }

    var secondsArray = [];
    var secString = "Second";
    var secID = "Second";
    var secObj = {name: secString, _id: secID};
    secondsArray.push(secObj);
    for(var i = 0; i < 60; i++){
        var kaString;
        var kaID;
        if(i < 10){
            kaString = "0" + i;
            kaID = "0" + i;
        }else{
            kaString = i;
            kaID = i;
        }
        var newObj = {name: kaString, _id: kaID};
        secondsArray.push(newObj);
    }

    var foodKeyArray = [];
    var foodKeyDataArray = [];
    var foodActivitiesArray = [];

    var sfname = "Select Food";
    var sfID = "Select Food";
    var sfrag = "";
    var sfsag = "";
    var sffat = "";
    var sfprotein = "";
    var sfservingSize = "";
    var newObjSF = {rag: sfrag, sag: sfsag, _id: sfID, fat: sffat, name: sfname, protein: sfprotein, servingSize: sfservingSize};
    foodKeyDataArray.push(newObjSF);

    var nfname = "+ New Food";
    var nfID = "+ New Food";
    var nfrag = "";
    var nfsag = "";
    var nffat = "";
    var nfprotein = "";
    var nfservingSize = "";
    var newObjSF = {rag: nfrag, sag: nfsag, _id: nfID, fat: nffat, name: nfname, protein: nfprotein, servingSize: nfservingSize};
    foodKeyDataArray.push(newObjSF);

    var userId = firebase.auth().currentUser.uid;
    var query = firebase.database().ref('/users/' + userId + '/foodSubtypes').orderByKey();
    query.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var item = childSnapshot.val();
            item.key = childSnapshot.key;

            foodKeyArray.push(item);                                              
        });
        for(i = 0; i < foodKeyArray.length; i++){
            var rag = foodKeyArray[i].RAG;
            var sag = foodKeyArray[i].SAG;
            var _id = foodKeyArray[i]._id;
            var fat = foodKeyArray[i].fat;
            var food_name = foodKeyArray[i].food_name;
            var protein = foodKeyArray[i].protein;
            var servingSize = foodKeyArray[i].servingSize;
            var newObj = {rag: rag, sag: sag, _id: _id, fat: fat, name: food_name, protein: protein, servingSize: servingSize};
            foodKeyDataArray.push(newObj);
        }

        foodActivitiesArray = foodKeyDataArray;

        var exerciseKeyArray = [];
        var exerciseKeyDataArray = [];
        var exerciseActivitiesArray = [];

        var seName = "Select Exercise";
        var seID = "Select Exercise";
        var seIntensity = "";
        var newObjSE = {name: seName, _id: seID, intensity: seIntensity};
        exerciseKeyDataArray.push(newObjSE);

        var neName = "+ New Exercise";
        var neID = "+ New Exercise";
        var neIntensity = "";
        var newObjNewe = {name: neName, _id: neID, intensity: neIntensity};
        exerciseKeyDataArray.push(newObjNewe);
    
        var userId = firebase.auth().currentUser.uid;
        var query = firebase.database().ref('/users/' + userId + '/exerciseSubtypes').orderByKey();
        query.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.key = childSnapshot.key;
    
                exerciseKeyArray.push(item);                                              
            });
            for(i = 0; i < exerciseKeyArray.length; i++){
                var kaString = exerciseKeyArray[i].exercise_activity;
                var kaID = exerciseKeyArray[i]._id;
                var kaIntensity = exerciseKeyArray[i].intensity;
                var newObj = {name: kaString, _id: kaID, intensity: kaIntensity};
                exerciseKeyDataArray.push(newObj);
            }
    
            exerciseActivitiesArray = exerciseKeyDataArray;
            
            var activityDbArray = [];

            var userId = firebase.auth().currentUser.uid;
            var query = firebase.database().ref('/users/' + userId + '/activities').orderByKey();
            query.once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var item = childSnapshot.val();
                    item.key = childSnapshot.key;
                    activityDbArray.push(item);                                              
                });
                
                var totalActivitiesInDb_1 = activityDbArray.length + 1;
                var totalExerciseTypesinDb_1 = exerciseActivitiesArray.length - 1;
                var totalFoodTypesinDb_1 = foodActivitiesArray.length - 1;

                var activity_type0 = req.body.activity_type0;
                var food_type0 = req.body.food_type0;
                var exercise_type0 = req.body.exercise_type0;
                var newFoodName0 = req.body.newFoodName0;
                var newFoodServingSize0 = req.body.newFoodServingSize0;
                var newFoodFat0 = req.body.newFoodFat0;
                var newFoodProtein0 = req.body.newFoodProtein0;
                var newFoodRAG0 = req.body.newFoodRAG0;
                var newFoodSAG0 = req.body.newFoodSAG0;
                var newExerciseName0 = req.body.newExerciseName0;
                var newExerciseIntensity0 = req.body.newExerciseIntensity0;
                var monthSelection0 = req.body.monthSelection0;
                var daySelection0 = req.body.daySelection0;
                var yearSelection0 = req.body.yearSelection0;
                var hourSelection0 = req.body.hourSelection0;
                var minuteSelection0 = req.body.minuteSelection0;
                var secondSelection0 = req.body.secondSelection0;
                var amPmSelection0 = req.body.amPmSelection0;
                var foodQtyInput0 = req.body.foodQtyInput0;
                var exerciseQtyInput0 = req.body.exerciseQtyInput0;

                /*console.log(activity_type0);
                console.log(food_type0);
                console.log(exercise_type0);
                console.log(newFoodName0);
                console.log(newFoodServingSize0);
                console.log(newFoodFat0);
                console.log(newFoodProtein0);
                console.log(newFoodRAG0);
                console.log(newFoodSAG0);
                console.log(newExerciseName0);
                console.log(newExerciseIntensity0);
                console.log(monthSelection0);
                console.log(daySelection0);
                console.log(yearSelection0);
                console.log(hourSelection0);
                console.log(minuteSelection0);
                console.log(secondSelection0);
                console.log(amPmSelection0);
                console.log(foodQtyInput0);
                console.log(exerciseQtyInput0);*/

                writeActivitySetToDatabaseArray(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, monthSelection0, daySelection0, yearSelection0, hourSelection0, minuteSelection0, secondSelection0, amPmSelection0, foodQtyInput0, exerciseQtyInput0, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1);

                runSimulationProgram(activity_type0, food_type0, exercise_type0, newFoodName0, newFoodServingSize0, newFoodFat0, newFoodProtein0, newFoodRAG0, newFoodSAG0, newExerciseName0, newExerciseIntensity0, monthSelection0, daySelection0, yearSelection0, hourSelection0, minuteSelection0, secondSelection0, amPmSelection0, foodQtyInput0, exerciseQtyInput0, activityDbArray, totalActivitiesInDb_1, totalExerciseTypesinDb_1, totalFoodTypesinDb_1);

                res.render('newSimulation', {activityTypes: activityTypesArray, foodTypes: foodActivitiesArray, exerciseTypes: exerciseActivitiesArray, hours: hourArray, minutes: minutesArray, seconds: secondsArray, amPms: amPmArray, months: monthArray, days31: dayArray31, days30: dayArray30, days28: dayArray28, years: yearArray});
            });
        });
    });
};

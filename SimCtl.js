//var firebase = require('firebase');
//var async = require('async');

var TICKS_PER_DAY = 24 * 60;
var TICKS_PER_HOUR = 60;
var body = new HumanBody();


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
    }

    run_simulation(){
        while(true){
            var val;
            while( (val = fire_event()) == 1);
            body.processTick();
            ticks++;
        }
    }

    fire_event(){
        var event_ = eventQ.front();

        if(!(event_)){
            console.log("No event left");
            process.exit();
        }

        if(event_.fireTime > ticks){
            return -1;
        }

        var event_type = event_.eventType_;

        switch(event_type){
            case EventType.FOOD:
                body.processFoodEvent(event_.foodID_, event_.quantity_);
                break;
            case EventType.EXERCISE:
                body.processExerciseEvent(event_.exerciseID_, event_.duration_)
                break;
            case EventType.HALT:
                process.ext();
                break;
            default:
                break;
        }

        event_ = eventQ.dequeue();
        //delete event_;
        return 1;
    }

    addEvent(fireTime, type, subtype, howmuch){
        switch (type){
            case EventType.FOOD:
                var e = new QElement(fireTime, subtype, howmuch);
                this.eventQ.enqueue(e);
                break;
            case EventType.EXERCISE:
                var e = new QElement(fireTime, subtype, howmuch);
                this.eventQ.enqueue(e);
                break;
            case EventType.HALT:
                var e = new QElement(fireTime, subtype, howmuch);
                this.eventQ.enqueue(e);
            default:
                break;               
        }
    }

    readEvents(){
        /*var rawFile = new XMLHttpRequest();
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function(){
            if(rawFile.readyState === 4){
                if(rawFile.status === 200 || rawFile.status == 0){
                    var allText = rawFile.responseText;

                    // add stuff here!!!

                }
            }
        }
        rawFile.send(null);*/
        
        // testing
        this.addEvent(2018, EventType.FOOD, '2', 1);
        this.addEvent(2017, EventType.FOOD, '3', 1);
        this.addEvent(2016, EventType.EXERCISE, '2', 1);
        console.log(this.eventQ.front());
    }


    elapsed_days(){
        return(ticks/TICKS_PER_DAY);
    }

    elapsed_hours(){
        var x = ticks % TICKS_PER_DAY;
        return(x/TICKS_PER_HOUR);
    }

    elapsed_minutes(){
        var x = ticks % TICKS_PER_DAY;
        return(x % TICKS_PER_HOUR);
    }
}

// TODO need to figure out how to implement the main function in JavaScript
// also need to determine how we will pass in the arguments that are used when sim ran in colsole
function run_simulation(){
    while (true) {
        var val;
        while( (val = fire_event()) == 1);
        // need to convert body->processTick();
        ticks++;
    }

    return 0;
}

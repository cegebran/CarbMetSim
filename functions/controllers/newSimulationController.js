var firebase = require('firebase');
var async = require('async');

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

    
                res.render('newSimulation', {activityTypes: activityTypesArray, foodTypes: foodActivitiesArray, exerciseTypes: exerciseActivitiesArray, hours: hourArray, minutes: minutesArray, seconds: secondsArray, amPms: amPmArray, months: monthArray, days31: dayArray31, days30: dayArray30, days28: dayArray28, years: yearArray});
            });
        });
    });
};

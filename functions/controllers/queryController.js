var firebase = require('firebase');
var async = require('async');

var activityTypeArray = [
    {
        _id: "All",
        name: "All Activities"
    },
    {
        _id: "Food",
        name: "Food Activities"
    },
    {
        _id: "Exercise",
        name: "Exercise Activities"
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
for(var i = 2018; i > 2009; i--){
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
for(var i = 1; i < 13; i++){
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

function timeCalculation(year, month, day, hour, minute, amPm){
    var yearInt = parseInt(year);
    var monthInt = parseInt(month);
    var dayInt = parseInt(day);
    var hourInt = parseInt(hour);
    var minuteInt = parseInt(minute);

    var yearTicks = yearInt * 525600;
    yearTicks = yearTicks - YEAR_CUTOFF;
    var monthTicks;
    if(monthInt == 1){
        monthTicks = 0;
    }else if(monthInt == 2){
        monthTicks = 31 * 1440;
    }else if(monthInt == 3){
        monthTicks = 59 * 1440;
    }else if(monthInt == 4){
        monthTicks = 90 * 1440;
    }else if(monthInt == 5){
        monthTicks = 120 * 1440;
    }else if(monthInt == 6){
        monthTicks = 151 * 1440;
    }else if(monthInt == 7){
        monthTicks = 181 * 1440;
    }else if(monthInt == 8){
        monthTicks = 212 * 1440;
    }else if(monthInt == 9){
        monthTicks = 243 * 1440;
    }else if(monthInt == 10){
        monthTicks = 273 * 1440;
    }else if(monthInt == 11){
        monthTicks = 304 * 1440;
    }else{
        monthTicks = 334 * 1440;
    }

    var daysBefore = dayInt - 1;
    var dayTicks = daysBefore * 1440;

    var hourConv;
    if(amPm == "AM"){
        if(hourInt == 12){
            hourConv = 0;
        }else{
            hourConv = hourInt;
        }
    }else{
        if(hourInt == 12){
            hourConv = 12;
        }else{
            hourConv = hourInt + 12;
        }
    }

    var hourConvMinus = hourConv - 1;
    var hourTicks = hourConvMinus * 60;

    var minuteMinus = minuteInt - 1;
    var minuteTicks = minuteMinus;

    var totalReturn = yearTicks + monthTicks + dayTicks + hourTicks + minuteTicks;
    return totalReturn;
}

var errorsArray = [];
var activitiesAllArrayFromDatabase = [];
var foodSubtypesArray = [];
var exerciseSubtypesArray =[];

exports.query_get = function(req, res) {
    errorsArray = [];
    if( firebase.auth().currentUser ) {
        var userId = firebase.auth().currentUser.uid;
        var queryActivities = firebase.database().ref('/users/' + userId + '/activities').orderByKey();
        queryActivities.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                item.key = childSnapshot.key;
                activitiesAllArrayFromDatabase.push(item);                                              
            });

            var queryFood = firebase.database().ref('/users/' + userId + '/foodSubtypes').orderByKey();
            queryFood.once('value').then(function(snapshot) {
                snapshot.forEach(function(childSnapshot) {
                    var item = childSnapshot.val();
                    item.key = childSnapshot.key;
                    foodSubtypesArray.push(item);                                              
                });

                var foodSubtypesPassedArray = [];
                var exerciseSubtypesPassedArray = [];

                var foodStartName = "All Food Activities";
                var foodStartId = "0";
                var newObjFoodStart = {name: foodStartName, _id: foodStartId}
                foodSubtypesPassedArray.push(newObjFoodStart);

                for(var k = 0; k < foodSubtypesArray.length; k++){
                    var kaString = foodSubtypesArray[k].food_name;
                    var kaID = foodSubtypesArray[k]._id;
                    var newObj = {name: kaString, _id: kaID};
                    foodSubtypesPassedArray.push(newObj);
                }

                var queryExercise = firebase.database().ref('/users/' + userId + '/exerciseSubtypes').orderByKey();
                queryExercise.once('value').then(function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var item = childSnapshot.val();
                        item.key = childSnapshot.key;
                        exerciseSubtypesArray.push(item);                                              
                    });

                    var exStartName = "All Exercise Activities";
                    var exStartId = "0";
                    var newObjExerciseStart = {name: exStartName, _id: exStartId}
                    exerciseSubtypesPassedArray.push(newObjExerciseStart);

                    for(var p = 0; p < exerciseSubtypesArray.length; p++){
                        var kaString = exerciseSubtypesArray[p].exercise_activity;
                        var kaID = exerciseSubtypesArray[p]._id;
                        var newObj = {name: kaString, _id: kaID};
                        exerciseSubtypesPassedArray.push(newObj);
                    }

                    res.render('query', {activityTypes: activityTypeArray, hours: hourArray, minutes: minutesArray, amPms: amPmArray, months: monthArray, days31: dayArray31, days30: dayArray30, days28: dayArray28, years: yearArray, foodActivityTypes: foodSubtypesPassedArray, exerciseActivityTypes: exerciseSubtypesPassedArray});
                });
            });
        });
    } else {
        res.render('loginfirstmsg', {result: "One needs to Sign In first before logging a new Activity."});
    } 
};

exports.query_post = function(req, res) {
    var activityType = req.body.activity;
    var foodActivityType = req.body.foodActivityType;
    var exerciseActivityType = req.body.exerciseActivity;
    var startMonth = req.body.startMonthSelection0;
    var startDay = req.body.startDaySelection0;
    var startYear = req.body.startYearSelection0;
    var startHour = req.body.startHourSelection0;
    var startMinute = req.body.startMinuteSelection0;
    var startAmPm = req.body.startAmPmSelection0;
    var endMonth = req.body.endMonthSelection0;
    var endDay = req.body.endDaySelection0;
    var endYear = req.body.endYearSelection0;
    var endHour = req.body.endHourSelection0;
    var endMinute = req.body.endMinuteSelection0;
    var endAmPm = req.body.endAmPmSelection0;

    var startTimeValue = timeCalculation(startYear, startMonth, startDay, startHour, startMinute, startAmPm);
    var endTimeValue = timeCalculation(endYear, endMonth, endDay, endHour, endMinute, endAmPm);

    if(activityType == "Food"){
        if(foodActivityType == 0){  // all food activities

        }else{  // specific food activity

        }
    }else if(activityType == "Exercise"){
        if(exerciseActivityType == 0){  // all exercise activities

        }else{  // specific exercise activity

        }
    }else{  // all activities

    }
};

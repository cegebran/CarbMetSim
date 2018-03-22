var firebase = require('firebase');
//var Author = require('../models/author');

var timeStampArray = [
    {
        _id: "00:00:00",
        name: "12:00:00 AM"
    },
    {
        _id: "00:30:00",
        name: "12:30:00 AM"
    },
    {
        _id: "01:00:00",
        name: "01:00:00 AM"
    },
    {
        _id: "01:30:00",
        name: "01:30:00 AM"
    },
    {
        _id: "02:00:00",
        name: "02:00:00 AM"
    },
    {
        _id: "02:30:00",
        name: "02:30:00 AM"
    },
    {
        _id: "03:00:00",
        name: "03:00:00 AM"
    },
    {
        _id: "03:30:00",
        name: "03:30:00 AM"
    },
    {
        _id: "04:00:00",
        name: "04:00:00 AM"
    },
    {
        _id: "04:30:00",
        name: "04:30:00 AM"
    },
    {
        _id: "05:00:00",
        name: "05:00:00 AM"
    },
    {
        _id: "05:30:00",
        name: "05:30:00 AM"
    },
    {
        _id: "06:00:00",
        name: "06:00:00 AM"
    },
    {
        _id: "06:30:00",
        name: "06:30:00 AM"
    },
    {
        _id: "07:00:00",
        name: "07:00:00 AM"
    },
    {
        _id: "07:30:00",
        name: "07:30:00 AM"
    },
    {
        _id: "08:00:00",
        name: "08:00:00 AM"
    },
    {
        _id: "08:30:00",
        name: "08:30:00 AM"
    },
    {
        _id: "09:00:00",
        name: "09:00:00 AM"
    },
    {
        _id: "09:30:00",
        name: "09:30:00 AM"
    },
    {
        _id: "10:00:00",
        name: "10:00:00 AM"
    },
    {
        _id: "10:30:00",
        name: "10:30:00 AM"
    },
    {
        _id: "11:00:00",
        name: "11:00:00 AM"
    },
    {
        _id: "11:30:00",
        name: "11:30:00 AM"
    },
    {
        _id: "12:00:00",
        name: "12:00:00 PM"
    },
    {
        _id: "12:30:00",
        name: "12:30:00 PM"
    },
    {
        _id: "13:00:00",
        name: "1:00:00 PM"
    },
    {
        _id: "13:30:00",
        name: "1:30:00 PM"
    },
    {
        _id: "14:00:00",
        name: "2:00:00 PM"
    },
    {
        _id: "14:30:00",
        name: "2:30:00 PM"
    },
    {
        _id: "15:00:00",
        name: "3:00:00 PM"
    },
    {
        _id: "15:30:00",
        name: "3:30:00 PM"
    },
    {
        _id: "16:00:00",
        name: "4:00:00 PM"
    },
    {
        _id: "16:30:00",
        name: "4:30:00 PM"
    },
    {
        _id: "17:00:00",
        name: "5:00:00 PM"
    },
    {
        _id: "17:30:00",
        name: "5:30:00 PM"
    },
    {
        _id: "18:00:00",
        name: "6:00:00 PM"
    },
    {
        _id: "18:30:00",
        name: "6:30:00 PM"
    },
    {
        _id: "19:00:00",
        name: "7:00:00 PM"
    },
    {
        _id: "19:30:00",
        name: "7:30:00 PM"
    },
    {
        _id: "20:00:00",
        name: "8:00:00 PM"
    },
    {
        _id: "20:30:00",
        name: "8:30:00 PM"
    },
    {
        _id: "21:00:00",
        name: "9:00:00 PM"
    },
    {
        _id: "21:30:00",
        name: "9:30:00 PM"
    },
    {
        _id: "22:00:00",
        name: "10:00:00 PM"
    },
    {
        _id: "22:30:00",
        name: "10:30:00 PM"
    },
    {
        _id: "23:00:00",
        name: "11:00:00 PM"
    },
    {
        _id: "23:30:00",
        name: "11:30:00 PM"
    },
];

var activityTypeArray = [
    {
        _id: "BGL",
        name: "Blood Glucose Level Activities"
    },
    {
        _id: "Food",
        name: "Food Activities"
    },
    {
        _id: "Exercise",
        name: "Exercise Activities"
    },
    {
        _id: "Medication",
        name: "Medication Activities"
    },
    {
        _id: "All",
        name: "All Activities"
    }
];

var errorsArray = [];

function startDateCheck(date, start){
    splitActivityDate = date.split("-");
    splitStartDate = start.split("-");
    var valueToReturn = false;

    if(splitStartDate[0] <= splitActivityDate[0]){
        if(splitStartDate[0] == splitActivityDate[0]){
            if(splitStartDate[1] <= splitActivityDate[1]){
                if(splitStartDate[1] == splitActivityDate[1]){
                    if(splitStartDate[2] <= splitActivityDate[2]){
                        valueToReturn = true;
                    }
                }else{
                    valueToReturn = true;
                }
            }
        }else{
            valueToReturn = true;
        }
    }
    return valueToReturn;
}

function endDateCheck(date, end){
    splitActivityDate = date.split("-");
    splitEndDate = end.split("-");
    var valueToReturn = false;

    if(splitActivityDate[0] <= splitEndDate[0]){
        if(splitActivityDate[0] == splitEndDate[0]){
            if(splitActivityDate[1] <= splitEndDate[1]){
                if(splitActivityDate[1] == splitEndDate[1]){
                    if(splitActivityDate[2] <= splitEndDate[2]){
                        valueToReturn = true;
                    }
                }else{
                    valueToReturn = true;
                }
            }
        }else{
            valueToReturn = true;
        }
    }
    return valueToReturn;
}

function startTimeCheck(time, start){
    splitActivityTime = time.split(":");
    splitStartTime = start.split(":");
    var valueToReturn = false;

    if(splitStartTime[0] <= splitActivityTime[0]){
        if(splitStartTime[0] == splitActivityTime[0]){
            if(splitStartTime[1] <= splitActivityTime[1]){
                if(splitStartTime[1] == splitActivityTime[1]){
                    if(splitStartTime[2] <= splitActivityTime[2]){
                        valueToReturn = true;
                    }
                }else{
                    valueToReturn = true;
                }
            }
        }else{
            valueToReturn = true;
        }
    }
    return valueToReturn;
}

function endTimeCheck(time, end){
    splitActivityTime = time.split(":");
    splitEndTime = end.split(":");
    var valueToReturn = false;

    if(splitActivityTime[0] <= splitEndTime[0]){
        if(splitActivityTime[0] == splitEndTime[0]){
            if(splitActivityTime[1] <= splitEndTime[1]){
                if(splitActivityTime[1] == splitEndTime[1]){
                    if(splitActivityTime[2] <= splitEndTime[2]){
                        valueToReturn = true;
                    }
                }else{
                    valueToReturn = true;
                }
            }
        }else{
            valueToReturn = true;
        }
    }
    return valueToReturn;
}

exports.query_get = function(req, res) {
    errorsArray = [];
    if( firebase.auth().currentUser ) {
        res.render('query', {timestamps: timeStampArray, activityTypes: activityTypeArray});
    } else {
        res.render('loginfirstmsg', {result: "One needs to Sign In first before logging a new Activity."});
    } 
};

exports.query_post = function(req, res) {
    //res.send('NOT IMPLEMENTED: Author list');
    errorsArray = [];
    var activityTypeInput = req.body.activity;
    var startDateInput = req.body.start_date;
    var endDateInput = req.body.end_date;
    var startTimeOfDayInput = req.body.start_timeofday;
    var endTimeOfDayInput = req.body.end_timeofday;

    // mean variance variables
    var bglNumItem = 0;
    var exerciseNumItem = 0;
    var medicationNumItem = 0;
    var foodNumItem = 0;

    var bglSum = 0;
    var exerciseSum = 0;
    var medicationSum = 0;
    var foodSum = 0;

    var bglMean = 0;
    var exerciseMean = 0;
    var medicationMean = 0;
    var foodMean = 0;

    var bglVarianceSum = 0;
    var exerciseVarianceSum = 0;
    var medicationVarianceSum = 0;
    var foodVarianceSum = 0;

    var bglVariance = 0;
    var exerciseVariance = 0;
    var medicationVariance = 0;
    var foodVariance = 0;

    var bglSingleValueArray = [];
    var exerciseSingleValueArray = [];
    var medicationSingleValueArray = [];
    var foodSingleValueArray = [];

    //check if endDate after startDate
    var startDateSplit = startDateInput.split("-");
    var endDateSplit = endDateInput.split("-");

    if(startDateSplit[0] >= endDateSplit[0]){
        if(startDateSplit[0] > endDateSplit[0]){    // bad need to reshow page
            errorsArray.push("Start date needs to come before end date.");
            res.render('query', {timestamps: timeStampArray, activityTypes: activityTypeArray, errors: errorsArray});
        }else{  // same year for both start and end
            if(startDateSplit[1] >= endDateSplit[1]){
                if(startDateSplit[1] > endDateSplit[1]){    // bad need to reshow page
                    errorsArray.push("Start date needs to come before end date.");
                    res.render('query', {timestamps: timeStampArray, activityTypes: activityTypeArray, errors: errorsArray});
                }else{
                    if(startDateSplit[2] >= endDateSplit[2]){
                        if(startDateSplit[2] > endDateSplit[2]){    // bad need to reshow page
                            errorsArray.push("Start date needs to come before end date.");
                            res.render('query', {timestamps: timeStampArray, activityTypes: activityTypeArray, errors: errorsArray});
                        }else{
                            var splitStartTime = startTimeOfDayInput.split(":");
                            var splitEndTime = endTimeOfDayInput.split(":");

                            if(splitStartTime[0] >= splitEndTime[0]){
                                if(splitStartTime[0] > splitEndTime[0]){    // bad need to reshow page
                                    errorsArray.push("Start time needs to come before end time, when start and end dates are the same day.");
                                    res.render('query', {timestamps: timeStampArray, activityTypes: activityTypeArray, errors: errorsArray});
                                }else{
                                    if(splitStartTime[1] > splitEndTime[1]){
                                        errorsArray.push("Start time needs to come before end time, when start and end dates are the same day.");
                                        res.render('query', {timestamps: timeStampArray, activityTypes: activityTypeArray, errors: errorsArray});
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    var activityArray = [];
    var activityKeyArray = [];
    var activityTypeArray = [];

    var userId = firebase.auth().currentUser.uid;
    var query = firebase.database().ref('/users/' + userId + '/activitytypes').orderByKey();
    query.once('value').then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var item = childSnapshot.val();
            item.key = childSnapshot.key;
            activityKeyArray.push(item);                                              
        });
        for(i = 0; i < activityKeyArray.length; i++){
            var activityTypeObject = {activityType: activityKeyArray[i].activity, activityTypeDescription: activityKeyArray[i].description};
            activityTypeArray.push(activityTypeObject);
        }

        var keyArray = [];
        var activitiesArray = [];

        var userId = firebase.auth().currentUser.uid;
        var query = firebase.database().ref('/users/' + userId + '/activities').orderByChild('date');
        query.once('value').then(function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var item = childSnapshot.val();
                keyArray.push(item);                                              
            });
            var startLoopCt = keyArray.length - 1;

            for(i = startLoopCt; i >= 0; i--){
                var activityMainType = "";
                for(z = 0; z < activityTypeArray.length; z++){
                    if(keyArray[i].activity == activityTypeArray[z].activityTypeDescription){
                        activityMainType = activityTypeArray[z].activityType;
                    }
                }
                var activityValueConcatLabel = "";
                if(activityMainType == "Exercise"){
                    if(activityTypeInput == "Exercise" || activityTypeInput == "All"){

                        var startOk = startDateCheck(keyArray[i].date, startDateInput);
                        var endOk = endDateCheck(keyArray[i].date, endDateInput);

                        if(startOk == true && endOk == true){
                            var startTimeOk = startTimeCheck(keyArray[i].recordedTime, startTimeOfDayInput);
                            var endTimeOk = endTimeCheck(keyArray[i].recordedTime, endTimeOfDayInput);

                            if(startTimeOk == true && endTimeOk == true){
                                exerciseNumItem++;
                                exerciseSum = exerciseSum + parseInt(keyArray[i].value);
                                exerciseSingleValueArray.push(parseInt(keyArray[i].value));

                                activityValueConcatLabel = keyArray[i].value + " minutes";
                                var displayedTableDate = "";
                                var dateSplit = keyArray[i].date.split("-");
                                var displayedTableDate = dateSplit[1] + "-" + dateSplit[2] + "-" + dateSplit[0];
                                var activityObject = {maintype: activityMainType, type: keyArray[i].activity, value: activityValueConcatLabel, date: displayedTableDate, timeofday: keyArray[i].recordedTime};
                                activityArray.push(activityObject);
                            }
                        }
                    }
                }else if(activityMainType == "Food"){
                    if(activityTypeInput == "Food" || activityTypeInput == "All"){

                        var startOk = startDateCheck(keyArray[i].date, startDateInput);
                        var endOk = endDateCheck(keyArray[i].date, endDateInput);

                        if(startOk == true && endOk == true){
                            var startTimeOk = startTimeCheck(keyArray[i].recordedTime, startTimeOfDayInput);
                            var endTimeOk = endTimeCheck(keyArray[i].recordedTime, endTimeOfDayInput);

                            if(startTimeOk == true && endTimeOk == true){
                                foodNumItem++;
                                foodSum = foodSum + parseInt(keyArray[i].value);
                                foodSingleValueArray.push(parseInt(keyArray[i].value));

                                activityValueConcatLabel = keyArray[i].value + " grams";
                                var displayedTableDate = "";
                                var dateSplit = keyArray[i].date.split("-");
                                var displayedTableDate = dateSplit[1] + "-" + dateSplit[2] + "-" + dateSplit[0];
                                var activityObject = {maintype: activityMainType, type: keyArray[i].activity, value: activityValueConcatLabel, date: displayedTableDate, timeofday: keyArray[i].recordedTime};
                                activityArray.push(activityObject);
                            }
                        }
                    }
                }else if(activityMainType == "BGL"){
                    if(activityTypeInput == "BGL" || activityTypeInput == "All"){

                        var startOk = startDateCheck(keyArray[i].date, startDateInput);
                        var endOk = endDateCheck(keyArray[i].date, endDateInput);

                        if(startOk == true && endOk == true){
                            var startTimeOk = startTimeCheck(keyArray[i].recordedTime, startTimeOfDayInput);
                            var endTimeOk = endTimeCheck(keyArray[i].recordedTime, endTimeOfDayInput);

                            if(startTimeOk == true && endTimeOk == true){
                                bglNumItem++;
                                bglSum = bglSum + parseInt(keyArray[i].value);
                                bglSingleValueArray.push(parseInt(keyArray[i].value));

                                activityValueConcatLabel = keyArray[i].value + " bgl";
                                var displayedTableDate = "";
                                var dateSplit = keyArray[i].date.split("-");
                                var displayedTableDate = dateSplit[1] + "-" + dateSplit[2] + "-" + dateSplit[0];
                                var activityObject = {maintype: activityMainType, type: keyArray[i].activity, value: activityValueConcatLabel, date: displayedTableDate, timeofday: keyArray[i].recordedTime};
                                activityArray.push(activityObject);
                            }
                        }
                    }
                }else if(activityMainType = "Medication"){
                    if(activityTypeInput == "Medication" || activityTypeInput == "All"){

                        var startOk = startDateCheck(keyArray[i].date, startDateInput);
                        var endOk = endDateCheck(keyArray[i].date, endDateInput);

                        if(startOk == true && endOk == true){
                            var startTimeOk = startTimeCheck(keyArray[i].recordedTime, startTimeOfDayInput);
                            var endTimeOk = endTimeCheck(keyArray[i].recordedTime, endTimeOfDayInput);

                            if(startTimeOk == true && endTimeOk == true){
                                medicationNumItem++;
                                medicationSum = medicationSum + parseInt(keyArray[i].value);
                                medicationSingleValueArray.push(parseInt(keyArray[i].value));

                                activityValueConcatLabel = keyArray[i].value + " grams";
                                var displayedTableDate = "";
                                var dateSplit = keyArray[i].date.split("-");
                                var displayedTableDate = dateSplit[1] + "-" + dateSplit[2] + "-" + dateSplit[0];
                                var activityObject = {maintype: activityMainType, type: keyArray[i].activity, value: activityValueConcatLabel, date: displayedTableDate, timeofday: keyArray[i].recordedTime};
                                activityArray.push(activityObject);
                            }
                        }
                    }
                }else{
                    activityValueConcatLabel = keyArray[i].value;
                }
            }

            var meanResult = "Mean: ";
            var varianceResult = "Variance: ";

            if(activityTypeInput == "Exercise" || activityTypeInput == "All"){
                if(exerciseNumItem > 0){
                    exerciseMean = exerciseSum / exerciseNumItem;

                    for(a = 0; a < exerciseSingleValueArray.length; a++){
                        var difference = exerciseSingleValueArray[a] - exerciseMean;
                        var differenceSquared = difference * difference;

                        exerciseVarianceSum = exerciseVarianceSum + differenceSquared;
                    }

                    exerciseVariance = exerciseVarianceSum / exerciseNumItem;

                    if(activityTypeInput == "Exercise"){
                        meanResult = meanResult + " Exercise = " + exerciseMean;
                        varianceResult = varianceResult + " Exercise = " + exerciseVariance;
                    }else{
                        meanResult = meanResult + " Exercise = " + exerciseMean;
                        varianceResult = varianceResult + " Exercise = " + exerciseVariance;
                    }
                }
                else{
                    if(activityTypeInput == "Exercise"){
                        meanResult = meanResult + " Exercise = No Activites";
                        varianceResult = varianceResult + " Exercise = No Activites";
                    }else{
                        meanResult = meanResult + " Exercise = No Activites";
                        varianceResult = varianceResult + " Exercise = No Activites";
                    }
                }
            }
            
            if(activityTypeInput == "Food" || activityTypeInput == "All"){
                if(foodNumItem > 0){
                    foodMean = foodSum / foodNumItem;

                    for(a = 0; a < foodSingleValueArray.length; a++){
                        var difference = foodSingleValueArray[a] - foodMean;
                        var differenceSquared = difference * difference;

                        foodVarianceSum = foodVarianceSum + differenceSquared;
                    }

                    foodVariance = foodVarianceSum / foodNumItem;

                    if(activityTypeInput == "Food"){
                        meanResult = meanResult + " Food = " + foodMean;
                        varianceResult = varianceResult + " Food = " + foodVariance;
                    }else{
                        meanResult = meanResult + ", Food = " + foodMean;
                        varianceResult = varianceResult + ", Food = " + foodVariance;
                    }
                }else{
                    if(activityTypeInput == "Food"){
                        meanResult = meanResult + " Food = No Activities";
                        varianceResult = varianceResult + " Food = No Activities";
                    }else{
                        meanResult = meanResult + ", Food = No Activities";
                        varianceResult = varianceResult + ", Food = No Activities";
                    }
                }
            }
            
            if(activityTypeInput == "BGL" || activityTypeInput == "All"){
                if(bglNumItem > 0){
                    bglMean = bglSum / bglNumItem;

                    for(a = 0; a < bglSingleValueArray.length; a++){
                        var difference = bglSingleValueArray[a] - bglMean;
                        var differenceSquared = difference * difference;

                        bglVarianceSum = bglVarianceSum + differenceSquared;
                    }

                    bglVariance = bglVarianceSum / bglNumItem;

                    if(activityTypeInput == "BGL"){
                        meanResult = meanResult + " BGL = " + bglMean;
                        varianceResult = varianceResult + " BGL = " + bglVariance;
                    }else{
                        meanResult = meanResult + ", BGL = " + bglMean;
                        varianceResult = varianceResult + ", BGL = " + bglVariance;
                    }
                }else{
                    if(activityTypeInput == "BGL"){
                        meanResult = meanResult + " BGL = No Activities";
                        varianceResult = varianceResult + " BGL = No Activities";
                    }else{
                        meanResult = meanResult + ", BGL = No Activities";
                        varianceResult = varianceResult + ", BGL = No Activities";
                    }
                }
            }
            
            if(activityTypeInput == "Medication" || activityTypeInput == "All"){
                if(medicationNumItem > 0){
                    medicationMean = medicationSum / medicationNumItem;

                    for(a = 0; a < medicationSingleValueArray.length; a++){
                        var difference = medicationSingleValueArray[a] - medicationMean;
                        var differenceSquared = difference * difference;

                        medicationVarianceSum = medicationVarianceSum + differenceSquared;
                    }

                    medicationVariance = medicationVarianceSum / medicationNumItem;

                    if(activityTypeInput == "Medication"){
                        meanResult = meanResult + " Medication = " + medicationMean;
                        varianceResult = varianceResult + " Medication = " + medicationVariance;
                    }else{
                        meanResult = meanResult + ", Medication = " + medicationMean;
                        varianceResult = varianceResult + ", Medication = " + medicationVariance;
                    }
                }else{
                    if(activityTypeInput == "Medication"){
                        meanResult = meanResult + " Medication = No Activities";
                        varianceResult = varianceResult + " Medication = No Activities";
                    }else{
                        meanResult = meanResult + ", Medication = No Activities";
                        varianceResult = varianceResult + ", Medication = No Activities";
                    }
                }
            }
            var queryResult = "Query- Activity: " + activityTypeInput + ", Start Date: " + startDateInput + ", End Date: " + endDateInput + ", Start Time: " + startTimeOfDayInput + ", End Time: " + endTimeOfDayInput;

            res.render('query_results', {activity_list: activityArray, mean: meanResult, queryEntry: queryResult, variance: varianceResult});
        });
    });
};


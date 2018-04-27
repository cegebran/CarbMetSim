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

exports.editSubtype_get = function(req, res) {
    if( firebase.auth().currentUser ) {
        res.render('editActivitySubtype', {mainTypes: activityTypesArray});
    } else {
        res.render('loginfirstmsg', {result: "One needs to Sign In first before logging a new Activity."});
    } 
};

exports.editSubtype_post = function(req, res) {
    
};
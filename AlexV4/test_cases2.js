$('document').ready(function(){
    var body = new HumanBody();
    //body.processTick();
    body.readFoodFile("Food.txt");
    body.readExerciseFile("Exercise.txt");
    
    /*
    for(var i = 0; i < body.foodTypesArr.length; i++){
        console.log("Food ID:" + foodTypesArr[i].foodID + "Food Name: " + foodTypesArr[i].name);
    };
    */
   
});
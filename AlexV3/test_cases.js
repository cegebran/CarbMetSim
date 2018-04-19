$('document').ready(function(){
    // creating object for queue classs
    var priorityQueue = new PriorityQueue();
    var sim2 = new SimCtl();
    var humanBody = new HumanBody();

    // testing isEmpty and front on an empty queue
    // return true
    console.log(priorityQueue.isEmpty());

    // returns "No elements in Queue"
    console.log(priorityQueue.front());
    
    //creating elements
    // (firetime, id, howmuch)
    var element1 = new QElement(100, "heart", "sub1", 2);
    
    var element2 = new QElement(10, "kidney", "sub2", 4);//check
    
    var element3 = new QElement(8, "liver", "sub3", 3);//check
    
    var element4 = new QElement(20, "brain", "sub4", 1);//check
    
    var element5 = new QElement(25, "heart2", "sub5", 2);
    
    // adding elements to the queue
    priorityQueue.enqueue(element1);
    priorityQueue.enqueue(element2);
    priorityQueue.enqueue(element3);
    priorityQueue.enqueue(element4);

    //printing  brain, heart, heart2, liver, kidney
    console.log(priorityQueue.printPQueue());

    //printing brian
    console.log(priorityQueue.front());

    //printing kidney
    console.log(priorityQueue.rear());

    //printing kidney
    console.log(priorityQueue.dequeue());

    // Adding another element to the queue
    priorityQueue.enqueue(element5);

    console.log(priorityQueue.printPQueue());

    sim2.readEvents("Events.txt");
    
    //simCtl.addEvent(2018, EventType.FOOD, '2', 1);
    //simCtl.addEvent(2017, EventType.FOOD, '3', 1);
    //simCtl.addEvent(2016, EventType.EXERCISE, '2', 1);
    //console.log(simCtl.eventQ.front());
    //console.log("fire Events start here")
    //console.log(simCtl.fire_event());
    
    
    console.log(humanBody.currentEnergyExpenditure());

    console.log(sim2.elapsed_days());
    console.log(sim2.elapsed_hours());
    console.log(sim2.elapsed_minutes());
    
    var body = new HumanBody();
    body.readFoodFile("Food.txt");
    body.readExerciseFile("Exercise.txt");
});
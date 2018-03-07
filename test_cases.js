$('document').ready(function(){
    // creating object for queue classs
    var priorityQueue = new PriorityQueue();

    // testing isEmpty and front on an empty queue
    // return true
    console.log(priorityQueue.isEmpty());

    // returns "No elements in Queue"
    console.log(priorityQueue.front());
    
    //creating elements
    var element1 = new QElement("heart", 2);
    
    var element2 = new QElement("kidney", 4);//check
    
    var element3 = new QElement("liver", 3);//check
    
    var element4 = new QElement("brain", 1);//check
    
    var element5 = new QElement("heart2", 2);
    
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

    // prints [Piyush Sumit Sunny Sunil Sheru]
    console.log(priorityQueue.printPQueue());

    var simCtl = new SimCtl();
    simCtl.readEvents();
    
    var humanBody = new HumanBody();
    console.log(humanBody.currentEnergyExpenditure());
});
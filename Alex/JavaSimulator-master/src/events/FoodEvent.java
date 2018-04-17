package events;

import enums.EventType;

public class FoodEvent extends Event {
	
	public long quantity;
	public long foodID;

	public FoodEvent(long fireTime, long quantity, long foodID) {
		super(fireTime, EventType.FOOD);
		this.quantity = quantity;
		this.foodID = foodID;
	}

}

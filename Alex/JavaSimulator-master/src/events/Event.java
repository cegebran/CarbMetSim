package events;

import enums.EventType;
import util.PriQ.PriQElt;

public class Event extends PriQElt {
	public long fireTime;
	public EventType eventType;
	
	public Event(long fireTime, EventType the_type) {
		this.fireTime = fireTime;
		eventType = the_type;
		cost0 = fireTime;
		cost1 = 0;
	}
}

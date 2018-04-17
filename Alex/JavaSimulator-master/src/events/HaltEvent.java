package events;

import enums.EventType;

public class HaltEvent extends Event {
	public HaltEvent(long fireTime) { super(fireTime, EventType.HALT); }
}

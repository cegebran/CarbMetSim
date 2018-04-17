package events;

import enums.EventType;

public class ExerciseEvent extends Event {
	
	public long duration;
	public long exerciseID;
	
	public ExerciseEvent(long fireTime, long duration, long exerciseID) {
		super(fireTime, EventType.EXERCISE);
		this.duration = duration;
		this.exerciseID = exerciseID;
	}
}

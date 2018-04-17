package enums;

public enum EventType {
	FOOD(0),
	EXERCISE(1),
	HALT(2),
	METFORMIN(3),
	INSULIN_SHORT(4),
	INSULIN_LONG(5);
	
	public final int value;
	EventType(int value) { this.value = value; }
}

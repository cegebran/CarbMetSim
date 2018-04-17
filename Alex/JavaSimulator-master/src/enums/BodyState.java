package enums;
public enum BodyState {
	FED_RESTING(0),
	FED_EXERCISING(1),
	FED_POSTEXERCISE(2),
	POSTABSORPTIVE_RESTING(3),
	POSTABSORPTIVE_EXERCISING(4), 
	POSTABSORPTIVE_POSTEXERCISE(5);
	
	public final int state;
	public static final int NUM_STATES = 6;
	BodyState(int state) { this.state = state; }
}
	
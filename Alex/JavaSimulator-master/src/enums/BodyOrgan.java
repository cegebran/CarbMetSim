package enums;
public enum BodyOrgan {
	HUMAN_BODY(0), 
	STOMACH_INTESTINE(1), 
	PORTAL_VEIN(2),
	LIVER(3), 
	BLOOD(4),
	MUSCLES(5),
	BRAIN(6), 
	HEART(7),
	ADIPOSE_TISSUE(8), 
	KIDNEY(9);
	
	public final int value;
	public static final int NUM_ORGANS = 10;
	BodyOrgan(int value) { this.value = value; }
}
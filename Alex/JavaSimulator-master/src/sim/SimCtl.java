package sim;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.Random;

import enums.EventType;
import events.*;
import util.PriQ;

/* The global class implementing
 * the simulation controller.
 */
public class SimCtl {
	
	public static final SimCtl sim = new SimCtl();
	public static final HumanBody body = new HumanBody();
	
	public static final int TICKS_PER_DAY = 24*60;
	public static final int TICKS_PER_HOUR = 60;
	
	public static long ticks = 0;
	
    public static Random myEngine() {
    	return new Random(System.currentTimeMillis());
    }
    
    PriQ eventQ = new PriQ();
    
    public SimCtl() { ticks = 0; }
    
    public long elapsed_days() { return ticks / TICKS_PER_DAY; }
    
    public long elapsed_hours() {
    	long x = ticks % TICKS_PER_DAY;
    	return x / TICKS_PER_HOUR;
    }
    
    public long elapsed_minutes() {
    	long x = ticks % TICKS_PER_DAY;
    	return x % TICKS_PER_HOUR;
    }
    
    public static void time_stamp() {
    	System.out.print(sim.elapsed_days() + ":" + sim.elapsed_hours() + ":" + sim.elapsed_minutes() + " ");
    }
    
    public void readEvents(String filename) {
    	BufferedReader br = null;
    	FileReader fr = null;
    	try {
    		fr = new FileReader(filename);
    		br = new BufferedReader(fr);
    		String line = null;
    		while ((line = br.readLine()) != null) {
    			String[] tok = line.split(" ")[0].split(":");	// double split!
    			int day = Integer.valueOf(tok[0]);
    			int hour = Integer.valueOf(tok[1]);
    			int minutes = Integer.valueOf(tok[2]);
    			int fireTime = day * TICKS_PER_DAY + hour * TICKS_PER_HOUR + minutes;
    			
    			int type = Integer.valueOf(tok[3]);
    			int subtype = Integer.valueOf(tok[4]);
    			int howmuch = Integer.valueOf(tok[5]);
    			
    			addEvent(fireTime,type,subtype,howmuch);
    		}
    		
    	} catch (IOException e) {
    		System.out.println("Error opening file : " + filename);
    		e.printStackTrace();
    		System.exit(-1);
    	} finally {
    		try {
    			if (br != null) br.close();
    			if (fr != null) fr.close();
    		} catch (IOException ioe) { ioe.printStackTrace(); System.exit(-1); }
    	}
    }
    
    void addEvent(long fireTime, int type, long subtype, long howmuch) {
    	switch (type) {
            case 0:
                FoodEvent e = new FoodEvent(fireTime, howmuch, subtype);
                eventQ.priq_add(e);
                break;
            case 1:
                ExerciseEvent f = new ExerciseEvent(fireTime, howmuch, subtype);
                eventQ.priq_add(f);
                break;
            case 2:
                HaltEvent g = new HaltEvent(fireTime);
                eventQ.priq_add(g);
                break;
            default:
                break;
        }
    }
    
    public int fire_event() {
    	Event event_ = null;
    	try {
    		event_ = (Event) eventQ.priq_gethead();
    		if (event_.fireTime > ticks) return -1;
    	} catch (ClassCastException|NullPointerException e) {
    		System.out.println("No event left");
    		System.exit(-1);
    	}
        
        // Fire the event
        
        //System.out.println("ticks =" + ticks + ": " + elapsed_days() + "::" + elapsed_hours() + "::" + elapsed_minutes());
        //System.out.println("event_.fireTime : " + event_.fireTime);
        
        EventType event_type = event_.eventType;
        
        switch(event_type) {
            case FOOD:
                body.processFoodEvent( ((FoodEvent)event_).foodID, ((FoodEvent)event_).quantity);
                break;
            case EXERCISE:
                body.processExerciseEvent(((ExerciseEvent)event_).exerciseID, ((ExerciseEvent)event_).duration);
                break;
            case HALT:
                System.exit(0);
            default:
                break;
        } // end switch case
       	
        event_ = (Event)eventQ.priq_rmhead();
        return 1;
    }
    
    public void run_simulation() {
    	 // Always in this loop
        while(true) {
            @SuppressWarnings("unused")
			int val;
            while( (val = fire_event()) == 1 );
            // At this point:
            // no more event to fire;
            body.processTick();
            ticks++;
            //System.out.println(elapsed_days() + ":" + elapsed_hours() + ":" + elapsed_minutes());
        }
    }
    
    //friend int main(int argc, char *argv[]);
}

package sim;

public class Main {

	public static void main(String[] args) {
		if (args.length != 4) {
			System.out.println("Syntax: foodsfile exercisefile metabolicratesfile eventsfile");
			System.exit(1);
		}
		SimCtl sim = new SimCtl();
		SimCtl.body.readFoodFile(args[0]);
		SimCtl.body.readExerciseFile(args[1]);
		SimCtl.body.readParams(args[2]);
		SimCtl.body.setParams();
		sim.readEvents(args[3]);
		sim.run_simulation();
	}

}

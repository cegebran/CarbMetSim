import "Blood.js";

class Brain{
    constructor(myBody)
    {
        // 6 micromol per kg per minute = 6*180.1559/1000 mg per kg per minute = 1.08 mg per kg per minute
    	// 120 g per day = 83.333 mg per minute of glucose oxidized by brain
        this.glucoseOxidized_ = 83.333;
        this.glucoseToAlanine_ = 0;
        this.bAAToGlutamine_ = 0;
        this.oxidationThisTick = 0;
        this.body = myBody;
    }

    //Release lactate to blood
    /*void Brain::glucoseToLactate(int glucoseRateToLactate){
        
        glucoseRateToLactate_ = glucoseRateToLactate;
        
        Blood::glucose_ -= glucoseRateToLactate_;
        Blood::lactate_ += glucoseRateToLactate_;

        
    }*/

    processTick()
    {
        //static std::poisson_distribution<int> glucoseOxidized__(1000.0*glucoseOxidized_);
        
        var g = (1.0)* ((this.glucoseOxidized__(SimCtl.myEngine()))/1000.0);
        this.oxidationThisTick = g;
        this.body.blood.removeGlucose(g + this.glucoseToAlanine_);
        this.body.blood.alanine += this.glucoseToAlanine_;
        
        //Brain generate glutamine from branched amino acids.
        if( this.body.blood.branchedAminoAcids > this.bAAToGlutamine_ )
        {
            this.body.blood.branchedAminoAcids -= this.bAAToGlutamine_;
            this.body.blood.glutamine += bAAToGlutamine_;
        }
        else
        {
            this.body.blood.glutamine += this.body.blood.branchedAminoAcids;
            this.body.blood.branchedAminoAcids = 0;
        }
    }

    /*void Brain::setParams()
    {
        for( ParamSet::iterator itr = body.metabolicParameters[body.bodyState][BRAIN].begin();
            itr != body.metabolicParameters[body.bodyState][BRAIN].end(); itr++)
        {
            if(itr.first.compare("glucoseOxidized_") == 0)
            {
                glucoseOxidized_ = itr.second;
            }
            if(itr.first.compare("glucoseToAlanine_") == 0)
            {
                glucoseToAlanine_ = itr.second;
            }
            if(itr.first.compare("bAAToGlutamine_") == 0)
            {
                bAAToGlutamine_ = itr.second;
            }

        }
        //std::cout<<"glucoseOxidized: "<<glucoseOxidized_<<std::endl;
    }*/
}

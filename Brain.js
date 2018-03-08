

Brain{
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
        
        var g = (1.0)* ((glucoseOxidized__(SimCtl::myEngine()))/1000.0);
        oxidationThisTick = g;
        body.blood.removeGlucose(g + glucoseToAlanine_);
        body.blood.alanine += glucoseToAlanine_;
        
        //Brain generate glutamine from branched amino acids.
        if( body.blood.branchedAminoAcids > bAAToGlutamine_ )
        {
            body.blood.branchedAminoAcids -= bAAToGlutamine_;
            body.blood.glutamine += bAAToGlutamine_;
        }
        else
        {
            body.blood.glutamine += body.blood.branchedAminoAcids;
            body.blood.branchedAminoAcids = 0;
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

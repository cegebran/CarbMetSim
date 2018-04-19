class PortalVein{    
    constructor(MyBody)
    {
        this.body = MyBody;
        this.glucose = 0;
        this.branchedAA = 0;
        this.unbranchedAA = 0;
        this.fluidVolume_ = 5; // dl
    } 
    processTick()
    {
        var bgl = this.body.blood.getBGL();
        var glucoseFromBlood = bgl * this.fluidVolume_;
        this.body.blood.removeGlucose(glucoseFromBlood);
        this.glucose += glucoseFromBlood;
        
        //SimCtl::time_stamp();
        console.log(" PortalVein:: " + this.glucose + " " + this.glucose/this.fluidVolume_ + " " + this.branchedAA + " " + this.unbranchedAA);
    }

    releaseAllGlucose()
    {
        this.body.blood.addGlucose(this.glucose);
        this.glucose = 0;
    }

    removeGlucose(g)
    {
        this.glucose -= g;
        if(this.glucose < 0)
        {
            console.log("PortalVein glucose went negative");
            //exit(-1);
        }
    }

    getConcentration()
    {
        var gl = (1.0)*(this.glucose/this.fluidVolume_);
        
        //SimCtl::time_stamp();
        console.log("GL in Portal Vein: " + gl + endl);
        
        return gl;
    }

    /*setParams()
    {
        for( ParamSet::iterator itr = this.body.metabolicParameters[this.body.bodyState][PORTAL_VEIN].begin();
            itr != this.body.metabolicParameters[this.body.bodyState][PORTAL_VEIN].end(); itr++)
        {
            if(itr.first.compare("fluidVolume_") == 0)
            {
                fluidVolume_ = itr.second;
            }
        }
    }*/

    addAminoAcids(aa)
    {
        this.branchedAA += 0.15*aa;
        this.unbranchedAA += 0.85*aa;
        //SimCtl::time_stamp();
        console.log(" PortalVein: bAA " + this.branchedAA + ", uAA " + this.unbranchedAA);
    }

    releaseAminoAcids()
    {
        // 93% unbranched amino acids consumed by liver to make alanine
        this.body.blood.alanine += 0.93*unbranchedAA;
        this.body.blood.unbranchedAminoAcids += 0.07 * this.unbranchedAA;
        this.unbranchedAA = 0;
        this.body.blood.branchedAminoAcids += this.branchedAA;
        this.branchedAA = 0;
        // who consumes these amino acids from blood other than liver?
        // brain consumes branched amino acids
    }
}
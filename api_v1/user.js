const { user } = require("../dbconfig");

class users{
    constructor(ID,EmpId,EmailID,EmpRole,ReqDate){
        this.ID = ID; 
        this.EmpId = EmpId; 
        this.EmailID = EmailID;
        this.EmpRole = EmpRole;
        this.ReqDate = ReqDate; 
    }
}

module.exports = user;
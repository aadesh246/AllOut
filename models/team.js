var mongoose = require("mongoose");
var teamSchema = new mongoose.Schema({
	name:String,
    image:String,
	players:[{
	type:mongoose.Schema.Types.ObjectId,
		ref:"Player"
	
}],
	}
);
var Team = mongoose.model("Team",teamSchema);
module.exports=Team;
var mongoose = require("mongoose");
var matchSchema = new mongoose.Schema({
	team1:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Team"
	},
	team2:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Team"
	},
	image:String,
	title:String,
	inning:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Inning"
	}],
    toss:String,
	status:String,
	type:Number,
	commentary:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Ball"
	}],
	date: String,
	location : String
});
var Match = mongoose.model("Match",matchSchema);
module.exports=Match;
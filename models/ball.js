var mongoose = require("mongoose");
var ballSchema = new mongoose.Schema({
	over:Number,
	batsman:String,
	bowler:String,
	desc:String,
	runs:Number,
	isOver:{type:Boolean,default:false},
	overRuns:Number,
	overScore:String,
	isComment:{type:Boolean,default:false},
	comment:String
	
}
);
var Ball = mongoose.model("Ball",ballSchema);
module.exports=Ball;
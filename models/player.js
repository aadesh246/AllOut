var mongoose = require("mongoose");
var playerSchema = new mongoose.Schema({
	name:String,
	runs:{type:Number,default:0},
	ballsFaced:{type:Number,default:0},
	fours:{type:Number,default:0},
	sixes:{type:Number,default:0},
	isOut:{type:Boolean,default:false},
	Out: String,
	isPlaying:{type:Boolean,default:false},
	runsConc:{type:Number,default:0},
	oversBowled:{type:Number,default:0},
	maidens:{type:Number,default:0},
	wickets:{type:Number,default:0}
}
);
var Player = mongoose.model("Player",playerSchema);
module.exports=Player;
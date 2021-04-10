var mongoose = require("mongoose");
var inningSchema = new mongoose.Schema({
	team:String,
	currentScore :{type:Number,default:0},
	overs:{type:Number,default:0},
	offStrike:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Player"
	},
	onStrike:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Player"
	},
	fallOfWickets:[{over:Number,run:Number, wicket:Number, player:String}],
	wickets:{type:Number,default:0},
	currentBowler:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Player"
	},
	last:{type:Number,default:0},
	Wides:{type:Number,default:0},
	Byes:{type:Number,default:0},
	LegByes:{type:Number,default:0},
	Penalty:{type:Number,default:0},
	NoBalls:{type:Number,default:0},
	
	
	batsmen:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Player"
	}],
	bowlers:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Player"
	}]
	
	
}   
);
var Inning = mongoose.model("Inning",inningSchema);
module.exports=Inning;
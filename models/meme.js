var mongoose = require("mongoose");
var memeSchema = new mongoose.Schema({
	likes:{type:Number,default:0},
	loves:{type:Number,default:0},
	url:String,
	date:{type:Date,default:Date.now},
	comments:[{author:String,text:String}]
});
var Meme = mongoose.model("Meme",memeSchema);
module.exports=Meme;
var mongoose = require("mongoose");
var videoSchema = new mongoose.Schema({
	title:String,
	url:String,
	description:String,
	year:Number,
	format:String,
	teams:[{type:String}],
	tags:[{type:String}]
});
var Video = mongoose.model("Video",videoSchema);
module.exports=Video;
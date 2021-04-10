var express = require("express"),
	app = express(),
	request = require("request-promise"),
	bodyParser= require("body-parser"),
	mongoose = require("mongoose"),
	flash = require("connect-flash"),
	axios = require("axios"),
	cheerio = require("cheerio");
const Fuse = require('fuse.js');
var jquery = require('jquery');
var Match = require("./models/match.js");
var Inning = require("./models/inning.js"),
	Ball = require("./models/ball.js");
var Team = require("./models/team.js");
var Player = require("./models/player.js");
var Video = require("./models/video.js"),
	Meme = require("./models/meme.js");

const x="mongodb+srv://aadesh246:aadesh123@cluster0.1lhwg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
	
mongoose.connect(x, {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connected")
});
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + "/public"));
app.use(flash());
app.use(require("express-session")({
	secret: "Betval project",
	resave: false,
	saveUninitialized: false
}));
app.use(async function (req, res, next) {
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});
// app.get("/",async function(req,res)
// 	   {
// 	const options = {
//     token: "E51F2E3FFD49B3B7FC9E7590C4383900",
//     url: "https://www.oddsportal.com/matches/cricket/20210408/",
// 	javascript_enabled: true,
// };

// axios.post("https://api.scraperbox.com/scrape", options)
// .then(response => {
    
// 	var x = response.data;
// 	var $ = cheerio.load(x);
	
// 	var data =[];var pre;
// 	for(var i =1;i<20 ;i++)
// 		{
// 			var z = $('#table-matches > table>tbody>tr:nth-child('+i+')').html();if(z==null)break;
// 		 if(z!=null&&z.includes('<th'))
// 			 {
// 			 pre = $('#table-matches > table > tbody > tr:nth-child('+i+') > th.first2.tl').text();continue;}
// 			var time = $('#table-matches > table>tbody>tr:nth-child('+i+')>td.table-time').text();
// 			var team = $('#table-matches > table>tbody>tr:nth-child('+i+')>td.name>a').text();
// 			var resu = team.split('-');
// 			var team1 = resu[0],team2=resu[1];
// 			var desc = pre;
// 			var status = $('#table-matches > table>tbody>tr:nth-child('+i+')>td.name>span').attr('onmouseover');var a=0, b=0;
// 			for(var j =0; j<status.length;j++)
// 				{
// 					if(a==0&&status[j]=='(')a=j;
// 					if(b==0&&a!=0&&status[j]==','){b=j;break;}
// 				}
// 			status = status.substr(a+2,b-a-3);
// 			var score = $('#table-matches > table>tbody>tr:nth-child('+i+')>td.table-score').text();
// 			var odds_1 = $('#table-matches > table>tbody>tr:nth-child('+i+')>td:nth-child(4)>a').text();
// 			var odds_2 = $('#table-matches > table>tbody>tr:nth-child('+i+')>td:nth-child(5)>a').text();
			
// 			resu = score.split(':');
// 			var team1sc = resu[0];
// 			var team2sc = resu[1];
// 			data.push({time:time,team1:team1,team2:team2,team1score:team1sc,team2sc:team2sc,desc:desc,status:status,desc:desc,team1odds:odds_1,team2odds:odds_2});
			
// 		}
// 	res.send({data});
	
	
	
// }).catch(error => {
//     console.error( error||error.response.data.errors );
// });
// })
app.get("/",async function(req,res){
Video.find({}).limit(2).exec(function(err,videos){
Meme.find({}).limit(3).exec(async function(err,memes)
	{	
		var data =[];
	 var url = "https://www.cricketcountry.com/news";

	 var response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	var $ = cheerio.load(response);
	for(var i =1;i<10;i++)
		{
			var title = $("li:nth-child("+i+") > figure > figcaption > h3>a").attr("title");
			
			if(!title)break;
			 var x = title.toLowerCase();
			if(x.includes("dream11")||x.includes("fantasy")||x.includes("twitter")||x.includes("watch"))
			{continue;}
			title = title.slice(0,100)+"...";
	        var href = $("li:nth-child("+i+") > figure > figcaption > h3>a").attr("href");
				href = href.replace("https://www.cricketcountry.com/news/","");
		
			data.push({title:title,href:href});
		}
	 
	res.render("home.ejs",{data:data,videos:videos,memes:memes});})})
})
app.post("/memes/like/:id",function(req,res){
	Meme.findById(req.params.id,async function(err,meme)
				 {
		meme.likes+=1;
		var z = await meme.save();
		res.redirect("/memes");
	})
})
app.post("/memes/love/:id",function(req,res){
	Meme.findById(req.params.id,async function(err,meme)
				 {
		meme.loves+=1;
		var z = await meme.save();
		res.redirect("/memes");
	})
})
app.post("/memes/comment/:id",function(req,res){
	Meme.findById(req.params.id,async function(err,meme)
				 {
		var comment = {author:req.body.name,text:req.body.comment};
		meme.comments.push(comment);
		var z = await meme.save();
		res.redirect("/memes");
	})
})

app.post("/match/:id1/innings/:id2/scoring",function(req,res){
	Match.findById(req.params.id1).populate("commentary inning").exec(async function(err,match)
				   { var mycomment = req.body.comment.trim();
		if(req.body.isComment==false && mycomment=='' )
			{
					Inning.findById(req.params.id2).populate("batsmen bowlers onStrike offStrike currentBowler").exec(async function(err,inning)
					   {
						if(req.body.isPreNo==1)
					{
						inning.currentScore+=1;
						inning.NoBalls+=1;
						inning.overs = req.body.overs;
						var currentBowler = await Player.findById(req.body.currentbowler);
		                if(match.commentary[match.commentary.length-1].isOver==true)
							{ inning.last = match.commentary[match.commentary.length-1].overScore;
								match.commentary.pop();
								currentBowler.overs -= 1;
								
								currentBowler.overs+=(inning.overs - Math.floor(inning.overs)).toFixed(1);
							}
											var ball = match.commentary[match.commentary.length-1];
						ball.runs+=1;
						ball.desc = '1nb+'+ball.desc;
						var x = await ball.save();
						var z= await currentBowler.save();
						var l = await match.save();
						var t1 = await inning.save();
						 res.redirect("/match/"+req.params.id1+"/inning/"+req.params.id2);
				
						
					}

			inning.overs =Number(req.body.over);
			inning.currentScore += Number(req.body.runs)+Number(req.body.wide)+Number(req.body.legbyes)+Number(req.body.byes)+Number(req.body.penalty)+Number(req.body.noball);
		    inning.offStrike = await Player.findById(req.body.offstrike);
		    inning.onStrike =await Player.findById(req.body.onstrike);
		    inning.currentBowler = await Player.findById(req.body.currentbowler);
		   inning.Wides += Number(req.body.wide);
		inning.Byes+=Number(req.body.byes);
		inning.LegByes+=Number(req.body.legbyes);
		inning.Penalty+=Number(req.body.penalty);
		inning.NoBalls+=Number(req.body.noball);
		var bowler = inning.currentBowler;
		if(req.body.fallofwicket==1)
			{   
				inning.wickets+=1;
				var batsman = await Player.findById(req.body.batsmanout);
				batsman.isOut = true;
				batsman.Out = req.body.howout;
				var x = await batsman.save();
				if(req.body.isrunout != 1)
					{
						
						bowler.wickets+=1;
					}
				inning.fallOfWickets.push({over:inning.overs,run:inning.currentScore,wicket:inning.wickets,player:batsman.name});
			}
		if(req.body.status!='' && req.body.status !=undefined)
			{
				match.status = req.body.status;
			}
		else{
		if(match.inning.length==1)
			{
				match.status=match.toss;
			}
		else
			{
			  if(match.type==2)
				  { var runs = match.inning[0].currentScore-inning.currentScore;
				     var oversrem = 300- Math.floor(inning.overs)*6 - (inning.overs-Math.floor(inning.overs))*10;
				   var rpo = (runs*6/oversrem).toFixed(2);
					  match.status = match.inning[1].team + " need " + runs + " runs at " + rpo.toFixed(2) +" RPO";
				  }
				if(match.type==3)
				  { var runs = match.inning[0].currentScore-inning.currentScore+1;
				     var oversrem = 120- Math.floor(inning.overs)*6 - (inning.overs-Math.floor(inning.overs))*10;
				   var rpo = (runs*6/oversrem).toFixed(2);
					  match.status = match.inning[1].team + " need " + runs + " runs at " + rpo +" RPO";
				  }
			}}
       var x = (inning.overs - Math.floor(inning.overs)).toFixed(1);
		if(req.body.isOver==1){x=1;inning.overs=Math.ceil(inning.overs);}
				var batsman = inning.onStrike;
			   bowler.oversBowled = Math.floor(bowler.oversBowled) +Number(x);
		bowler.runsConc += Number(req.body.runs)+Number(req.body.wide)+Number(req.body.noball);
		if(req.body.isMaiden==1)
			bowler.maidens+=1;
		var q = await bowler.save();
		batsman.runs += Number(req.body.runs);
		if(req.body.wide==0&&req.body.penalty==0)
			batsman.ballsFaced+=1;
		if(req.body.runs==4)
			batsman.fours+=1;
		   	if(req.body.runs==6)
			batsman.sixes+=1;
		var l = await batsman.save();
		var str="";
		if(req.body.fallofwicket==1)
			str+="W";
		if(req.body.wide!=0)
		{if(str.length!=0)str+='+';
			str+= req.body.wide +"wd";}
		if(req.body.noball!=0)
		{if(str.length!=0)str+='+';	str+= req.body.noball +"nb";}
		if(req.body.byes!=0)
		{if(str.length!=0)str+='+';	str+=req.body.byes +"b";}
		if(req.body.legbyes!=0)
		{if(str.length!=0)str+='+';str+=req.body.legbyes +"lb";}
	    {if(str.length!=0)str+='+';  if(req.body.runs>=1 || req.body.fallofwicket!=1)str += req.body.runs;}
		var lew;if(req.body.isComment==0)lew = false;else lew =true;  var num =Number(req.body.runs)+Number(req.body.wide)+Number(req.body.legbyes)+Number(req.body.byes)+Number(req.body.penalty)+Number(req.body.noball);
		var z = await Ball.create({over:req.body.over,runs:num,desc:str,comment:req.body.comment,batsman:batsman.name,bowler:bowler.name});
		match.commentary.push(z);
		var l1 = inning.currentScore-inning.last;
		
		var ovSc = inning.currentScore + "/" + inning.wickets +"(" + inning.overs + ")";
		if(req.body.isOver==1)
			{
				var balli = await Ball.create({isOver:true,overRuns:l1, overScore:ovSc});
		inning.last = inning.currentScore;
			
			match.commentary.push(balli);}
		q=  await match.save();
		q = await inning.save();
		
		res.redirect("/match/"+req.params.id1+"/inning/"+req.params.id2);
		})}
		else if(req.body.isComment==1)
			{
				var x = await Ball.create({comment:mycomment,isComment:true});
				match.commentary.push(x);
				var z = await match.save();
				res.redirect("/match/"+req.params.id1+"/inning/"+req.params.id2);

			}
		else
			{
				match.commentary.reverse();
				for(var i =0; i<match.commentary.length;i++)
					{
						var ball = match.commentary[i];
					   if(!ball.isOver && !ball.isComment)
						     {
								 ball.comment = mycomment;
								 var x = await ball.save();
								 res.redirect("/match/"+req.params.id1+"/inning/"+req.params.id2);
								 break;
							 }
					}
				
			}
	})
	
})
app.get("/videos/search",function(req,res)
	   {
	Video.find({},async function(err,videos)
			  {
		const options = {
  includeScore: true, 
 minMatchCharLength:3,
  threshold:1,
  keys: ['description','title', 'tags','teams','format']
}

const fuse = new Fuse(videos, options)

const results = await fuse.search(req.query.search);var data=[];
		for await (result of results )
		{ if(result.score<=0.50){
			data.push(result.item);}
		}
		data.reverse();
		if(data.length==0){
		req.flash("error","Abhi nahi hai data, Youtube pe jaake dekhle bhai"); return res.redirect("/videos");}
		res.render("videos.ejs",{videos:data});
	})
})
app.get("/videos/filter",function(req,res)
	   {
	var minyear = req.query.minyear;
	var maxyear = req.query.maxyear;
	var team = 	  req.query.team;
	var format =  req.query.format;
	var data = [];
	Video.find({format:{$in: format},teams:{$in: team}},async function(err,videos)
			  { 
		for await (video of videos)
		{
			if(video.year>=minyear&&video.year<=maxyear)
				data.push(video);
		}
		if(data.length==0){
		req.flash("error","Bhai aisa data to nahi hai mere paas"); return res.redirect("/videos");}

			
		res.render("videos.ejs",{videos:data});
	})

})
app.get("/match/:id/commentary",function(req,res)
	   {
	res.render("commentary.ejs",{id:req.params.id});
	
})
app.get("/match/:id/scorecard",function(req,res){
	res.render("scorecard.ejs",{id:req.params.id});
})
app.get("/match/:id/api",function(req,res)
	   {
	Match.findById(req.params.id).populate({
    path: 'inning',
      populate: { path: 'batsmen bowlers onStrike offStrike currentBowler' }
  }).populate('commentary team1 team2').exec(function(err,match)
								{
		res.send(match);
	})
})
app.get("/match/:id/score",function(req,res)
	   {
	Match.findById(req.params.id).populate("commentary").exec(function(err,match)
															 { var z = match.commentary;
		res.send({z});
	})
})
app.post("/match/:id1/innings/:id2/addBatsmen",function(req,res){
	Inning.findById(req.params.id2,async function(err,inning){
		Player.findById(req.body.batsman,async function(err,player){
			inning.batsmen.push(player);
			var z = await inning.save();
			res.redirect("/match/"+req.params.id1+"/inning/"+req.params.id2);
		})
	})
})
app.post("/match/:id1/innings/:id2/addBowlers",function(req,res){
	Inning.findById(req.params.id2,async function(err,inning){
		Player.findById(req.body.bowler,async function(err,player){
			inning.bowlers.push(player);
			var z = await inning.save();
			res.redirect("/match/"+req.params.id1+"/inning/"+req.params.id2);
		})
	})
})
app.get("/matches/api",function(req,res){
	Match.find({}).populate('inning team1 team2').exec(function(err,match)
								{
		res.send(match);
	})
})
app.get("/featured",function(req,res){
	res.render("featured.ejs");
})
app.get("/scorecard",function(req,res)
	   {
	res.render("scorecard.ejs");
})
app.get("/commentary",function(req,res){
	res.render("commentary.ejs");
})
app.get("/news",async function(req,res)
	   {
	res.redirect("/news/1");
})
app.get("/addMatch",function(req,res)
	   {
	res.render("addMatch.ejs");
})
app.post("/addMatch",function(req,res)
		{
	Team.create({name:req.body.team1,image:req.body.team1img},function(err,team1)
			   {
		Team.create({name:req.body.team2, image:req.body.team2img},function(err,team2)
				   {
			Match.create({team1:team1,team2:team2,type:req.body.type,title:req.body.title,image:req.body.matchimg,date:req.body.date,location:req.body.location},function(err,match)
						{
			  res.redirect("/match/"+match._id);
			})
		})
	})
})
app.get("/match/:id",function(req,res)
	   {
	Match.findById(req.params.id).populate({
    path: 'team1',
    // Get friends of friends - populate the 'friends' array for every friend
    populate: { path: 'players' }
  }).populate({
    path: 'team2',
    // Get friends of friends - populate the 'friends' array for every friend
    populate: { path: 'players' }
  }).exec(function(err,match)
				  {
		res.render("addPlayer.ejs",{match:match});
	})
})
app.post("/:id/addPlayer",async function(req,res){
	var team1=req.body.team1; var players1=[],players2=[];
	var team2=req.body.team2;
	for(var i=0;i<team1.length;i++){
		if(team1[i]=="")
			break;
		players1.push(team1[i]);}
 for(var i=0;i<team2.length;i++){
	    if(team2[i]=="")
			break;
		players2.push(team2[i]);}
	Match.findById(req.params.id).populate({
    path: 'team1',
    populate: { path: 'players' }
  }).populate({
    path: 'team2',
    populate: { path: 'players' }
  }).exec(async function(err,match)
				  {
		
		for(player of players1)
			{
			  var x = await Player.create({name:player});
				match.team1.players.push(x);
				var z = await match.team1.save();
			}
		for(player of players2)
			{
			  var x = await Player.create({name:player});
				match.team2.players.push(x);
				var z = await match.team2.save();
			}
		res.redirect("/match/"+req.params.id);
	})
})
app.post("/match/:id/toss",function(req,res)
	   {
	Match.findById(req.params.id,async function(err,match)
				  {
		match.toss = req.body.toss;
		match.status = match.toss;
		var z = await match.save();
		res.redirect("/match/"+req.params.id);
	})
})
app.post("/match/:id/addPlaying",function(req,res)
{  var players1= req.body.team1;
    var players2 = req.body.team2;
		Match.findById(req.params.id).populate({
    path: 'team1',
    populate: { path: 'players' }
  }).populate({
    path: 'team2',
    populate: { path: 'players' }
  }).exec(async function(err,match)
				  {
			for(player of players1)
			{
			  var x = await Player.findById(player);
					x.isPlaying = true;
				
				var z = await x.save();
			}
		for(player of players2)
			{
			  var x = await Player.findById(player);
				x.isPlaying = true;
				
				var z = await x.save();
			}
			res.redirect("/match/"+req.params.id);
	          
		 })
});
app.get("/match/:id1/inning/:id2",function(req,res)
	   {
	Match.findById(req.params.id1).populate({
    path: 'team1',
    populate: { path: 'players' }
  }).populate({
    path: 'team2',
    populate: { path: 'players' }
  }).exec(async function(err,match)
				  {
	Inning.findById(req.params.id2).populate("batsmen bowlers").exec(function(err,inning)
		{ 
		res.render("inning.ejs",{match:match,inning:inning});
	})})
})

app.post("/match/:id/addInning",function(req,res){
	Match.findById(req.params.id,async function(err,match){
		
		var inn=await Inning.create({team:req.body.inning});
		match.inning.push(inn);
		var x = await match.save();
		res.redirect("/match/"+req.params.id+"/inning/"+inn._id);
	})
});
app.get("/news/:id",async function(req,res)
	   {
 var data =[];
	 var url = "https://www.cricketcountry.com/news/page/"+req.params.id;
	 var response = await request({
		 
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	var $ = cheerio.load(response);
	for(var i =1;;i++)
		{
			var title = $("li:nth-child("+i+") > figure > figcaption > h3>a").attr("title");
			
			if(!title)break;
			var x = title.toLowerCase();
			if(x.includes("dream11")||x.includes("fantasy")||x.includes("twitter")||x.includes("watch"))
				continue;
			var img = $(" li:nth-child("+i+") > figure > a > img").attr("data-lazy-src");
			var date = $(" li:nth-child("+i+") > figure > figcaption > span[class='pdate']").text();
			var anc = $(" li:nth-child("+i+") > figure > figcaption > span[class='pdate']>a").text();
			date = date.replace(anc,'');
			var desc = $("li:nth-child("+i+") > figure > figcaption > p").text();
	        var href = $("li:nth-child("+i+") > figure > figcaption > h3>a").attr("href");
			href = href.replace("https://www.cricketcountry.com/news/","");
			
			data.push({title:title,href:href,desc:desc,img:img,date:date});
		}
	 res.render("news.ejs",{data:data,id:req.params.id});
	
})
app.get("/memes",function(req,res){
	Meme.find({},function(err,allMemes){
		res.render("memes.ejs",{memes:allMemes});
	})
})
app.get("/videos",function(req,res){
	Video.find({},function(err,allVideos){
		res.render("videos.ejs",{videos:allVideos});
	})
})
app.get("/addVideo",function(req,res){
	res.render("addVideo.ejs");
})
app.post("/videos",function(req,res){
	var title=req.body.title;
	var url=req.body.url;
	var format=req.body.format;
	var year=req.body.year;
	var desc=req.body.description;
	var x=req.body.tags;
	var tags=x.split(",");
	var y=req.body.teams;
	var teams=y.split(",");
	var newVideo ={title:title,url:url,format:format,year:year,description:desc,tags:tags,teams:teams};
	Video.create(newVideo,function(err,newvid){
		if(err){
			console.log(err);
		}else{
			res.redirect("/videos");
		}
	})
})
app.get("/addMeme",function(req,res){
	res.render("addMeme.ejs");
})
app.post("/memes",function(req,res){
	var url=req.body.url;
	var newMeme={url:url};
	Meme.create(newMeme,function(err,newmeme){
		if(err){
			console.log(err);
		}else{
			res.redirect("/memes");
		}
	})
})
app.get("/single-news/:id",async function(req,res){
	var data,url,response,$;
	 
	 url = "https://www.cricketcountry.com/news/"+ req.params.id;
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
var title =$(" h1").text();
	var desc = $("body > section.container > aside.container-left > section.cc-article-page.zcp-article > h2").text();
	var date =$(" aside.tags-art-news > section > p[class='lupdate']").text();
	var img = $("div.cc-main-content.eventtracker.articleBody > img").attr("src"); var news='';
	for(var i =2;i<=20; i++)
		{
	var ns = $("body > section.container > aside.container-left > section.cc-article-page.zcp-article > div.cc-main-content.eventtracker.articleBody > p:nth-child("+i+")").html();
			if(ns==undefined)
				continue;
			if(news!='')
				news+="<p></p>";
			news+=ns;
		}
	
	data={title:title,date:date,desc:desc,img:img,news:news};
	res.render("single_news.ejs",{data:data});
})
app.get("/players",function(req,res){
	res.render("players.ejs",{ans:true});
})
app.get("/players/search",async function(req,res)
	   {
	var x = req.query.name;
	var url = "https://cricapi.com/api/playerFinder?apikey=9DhRI2ScIJQmkptiJpx5EO1YwzN2&name="+x;
	var resp = await request(url);
	var z = JSON.parse(resp);

	res.render("players.ejs",{players:z.data,ans:false});
	
	
})
app.get("/players/single/:id",async function(req,res){
	var id = req.params.id;

	var data,url,response,$;
	  data =[];
	 url="https://www.espncricinfo.com/india/content/player/"+id+".html";
	response= await request(
	 {
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true,
    
});
	 $ = cheerio.load(response);
	var head = $('div.pnl490M > div.ciPlayernametxt > div > h1').text().trim();
	var country=$('div.pnl490M > div.ciPlayernametxt > div > h3').text().trim();
	var fullname=$(' div.player_overview-grid > div:nth-child(1) > h5').text().trim();
	var born=$('div.player_overview-grid > div:nth-child(2) > h5').text().trim();
	var age=$('div.player_overview-grid > div:nth-child(3) > h5').text().trim();
	var teams="";
	for(var j =1; ;j++)
		{
	var major = $('div.overview-teams-grid.mb-4 > div:nth-child('+j+')');
			if(major==undefined||major==''||!major)
				break;
			teams += major.text()+', ';
			
		}
	
	 teams = teams.substr(0,teams.length-2);
	var bat =$('div.player_overview-grid > div:nth-child(4) > h5');
	if(bat)bat = bat.text().trim();
	var bowl=$('div.player_overview-grid > div:nth-child(5) > h5');
	if(bowl) bowl =bowl.text().trim()
	
	var pic = "https://www.cricapi.com/playerpic/"+req.params.id+".jpg";
	var z=$(' div.playerpage-content > div:nth-child(3) > div > div:nth-child(1) > div > table').html()

	var y=$(' div.playerpage-content > div:nth-child(3) > div > div:nth-child(2) > div > table').html();
	var bio1=$(' div > div.more-content-gradient-content').html()
	
	data.push({head:head,country:country,fullname:fullname,born:born,age:age,teams:teams,bat:bat,bowl:bowl,pic:pic,bio1:bio1,z:z,y:y});
	res.render("singleplayer.ejs",{data:data});
	
})


app.get("/schedule",function(req,res)
	   {
	var url = 'https://cricapi.com/api/matchCalendar/9DhRI2ScIJQmkptiJpx5EO1YwzN2';
		 request(url,function(error,response,body)
			{  var data = JSON.parse(body),matches=[];
		 if(!error&&response.statusCode==200&&data.Response!="False")
		 { matches=data.data;
		 
		   res.render("schedule.ejs",{matches:matches});
		 }
 })

	}); 
app.get("/live",async function(req,res){
	var data,url,response,format,match,$,date,result1,image1,team1,score1,image2,team2,score2;
	 data =[];
	 url = "https://www.icc-cricket.com/live-cricket/mens-results";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	  
	for(var i =1;;i++ )
		{
			format = $("div > a:nth-child("+i+") > div:nth-child(1)> div").text();
	 match =$("div> a:nth-child("+i+") > div:nth-child(2)> div").text().trim();
			var result = match.split("|");
			match = result[0]; var stadium = result[1];

	date =$("div> a:nth-child("+i+") > div:nth-child(2)> time").text().trim();
	result1 =$("div> a:nth-child("+i+") > div:nth-child(3)> div.match-block__result").text().trim();
	team1 =$("div> a:nth-child("+i+") > div:nth-child(3)> div.match-block__teams > div:nth-child(1) > div.match-block__team-content > div.match-block__team-name").text().trim();
	        			
	score1 =$("div> a:nth-child("+i+") > div:nth-child(3)> div.match-block__teams > div:nth-child(1) > div.match-block__team-content > div.match-block__score").text().trim();
	team2 =$("div> a:nth-child("+i+") > div:nth-child(3)> div.match-block__teams > div:nth-child(2) > div.match-block__team-content > div.match-block__team-name").text().trim();
			
	score2 =$("div> a:nth-child("+i+") > div:nth-child(3)> div.match-block__teams > div:nth-child(2) > div.match-block__team-content > div.match-block__score").text().trim();
			var name1,name2;
			 var arr1 = team1.split(" ");
			 var arr2 = team2.split(" ");
			 if(arr1[1])
				 {
					 name1 = arr1[0][0]+arr1[1][0];
					 
				 }
			 else if(arr1[0].length>2)
				 name1 = arr1[0][0]+arr1[0][1]+arr1[0][2];
			 else name1 = team1;
			 if(arr2[1])
				 {
					 name2 = arr2[0][0]+arr2[1][0];
					 
				 }
			 
			 else if(arr2[0].length>2)
				 name2 = arr2[0][0]+arr2[0][1]+arr2[0][2];
			 else name2 = team2;
			 
			 name1 = name1.toLowerCase();
			 name2 = name2.toLowerCase();
			 
		
			if(!format)break;
data.push({format:format,match:match,date:date,result:result1,image1:name1,team1:team1,score1:score1,image2:name2,team2:team2,score2:score2,stadium:stadium});
			
			
		}
	res.render("live.ejs",{data:data});
})

app.get("/ranking",async function(req,res){ var data,url,response,name1,country1,points1,$,match1,rating1;
	 data =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/test/batting";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
	var data1 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/test/bowling";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data1.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data1.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
		var data2 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/test/all-rounder";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data2.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data2.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
	 var data3 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/team-rankings/test";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $("div > table > tbody > tr:nth-child(1)> td > span:nth-child(2)").text();
	 match1 =$("div > table > tbody > tr:nth-child(1) > td:nth-child(3)").text().trim();
	 points1 = $("div > table > tbody > tr:nth-child(1) > td:nth-child(4)").text().trim();
	 rating1= $("div> table > tbody > tr:nth-child(1)> td:nth-child(5)").text().trim();
	data3.push({rank:1,name:name1,match:match1,points:points1,rating:rating1});
	for(var i =2;;i++ )
		{
		name1=	$(" div > table > tbody > tr:nth-child("+i+")> td > span:nth-child(2)").text();
	    match1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
		rating1= $("div> table > tbody > tr:nth-child("+i+")> td:nth-child(5)").text().trim();
			if(!name1)break;
data3.push({rank:i,name:name1,match:match1,points:points1,rating:rating1});
			
			
		}
	
	res.render("rankings.ejs",{bats:data,bowl:data1,all:data2,team:data3});
})
app.get("/rankings_o",async function(req,res){
	 var data,url,response,name1,country1,points1,$,match1,rating1;
	 data =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/odi/batting";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
	var data1 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/odi/bowling";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data1.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data1.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
		var data2 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/odi/all-rounder";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data2.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data2.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
	 var data3 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/team-rankings/odi";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $("div > table > tbody > tr:nth-child(1)> td > span:nth-child(2)").text();
	 match1 =$("div > table > tbody > tr:nth-child(1) > td:nth-child(3)").text().trim();
	 points1 = $("div > table > tbody > tr:nth-child(1) > td:nth-child(4)").text().trim();
	 rating1= $("div> table > tbody > tr:nth-child(1)> td:nth-child(5)").text().trim();
	data3.push({rank:1,name:name1,match:match1,points:points1,rating:rating1});
	for(var i =2;;i++ )
		{
		name1=	$(" div > table > tbody > tr:nth-child("+i+")> td > span:nth-child(2)").text();
	    match1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
		rating1= $("div> table > tbody > tr:nth-child("+i+")> td:nth-child(5)").text().trim();
			if(!name1)break;
data3.push({rank:i,name:name1,match:match1,points:points1,rating:rating1});
			
			
		}
	res.render("rankings_o.ejs",{bats:data,bowl:data1,all:data2,team:data3});
})
app.get("/rankings_t",async function(req,res){
	var data,url,response,name1,country1,points1,$,match1,rating1;
	 data =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/t20i/batting";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
	var data1 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/t20i/bowling";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data1.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data1.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
		var data2 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/player-rankings/t20i/all-rounder";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $(" div > table > tbody > tr > td > div > div:nth-child(2) > a > div").text();
	 country1 =$("div > table > tbody > tr > td:nth-child(3) > div").text().trim();
	 points1 = $("div > table > tbody > tr > td:nth-child(4) > div").text().trim();
	data2.push({rank:1,name:name1,country:country1,points:points1});
	for(var i =2;;i++ )
		{
		name1=	$(" div> table > tbody > tr:nth-child("+i+") > td:nth-child(2) > a").text();
	    country1 = $(" div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
			if(!name1)break;
data2.push({rank:i,name:name1,country:country1,points:points1});
			
			
		}
	 var data3 =[];
	 url = "https://www.icc-cricket.com/rankings/mens/team-rankings/t20i";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
	});
	 $ = cheerio.load(response);
	 name1 = $("div > table > tbody > tr:nth-child(1)> td > span:nth-child(2)").text();
	 match1 =$("div > table > tbody > tr:nth-child(1) > td:nth-child(3)").text().trim();
	 points1 = $("div > table > tbody > tr:nth-child(1) > td:nth-child(4)").text().trim();
	 rating1= $("div> table > tbody > tr:nth-child(1)> td:nth-child(5)").text().trim();
	data3.push({rank:1,name:name1,match:match1,points:points1,rating:rating1});
	for(var i =2;;i++ )
		{
		name1=	$(" div > table > tbody > tr:nth-child("+i+")> td > span:nth-child(2)").text();
	    match1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(3)").text().trim();	
		points1 = $("div > table > tbody > tr:nth-child("+i+") > td:nth-child(4)").text().trim();
		rating1= $("div> table > tbody > tr:nth-child("+i+")> td:nth-child(5)").text().trim();
			if(!name1)break;
data3.push({rank:i,name:name1,match:match1,points:points1,rating:rating1});
			
			
		}
	res.render("rankings_t.ejs",{bats:data,bowl:data1,all:data2,team:data3});
})
app.get("/score1",async function(req,res)
	   {
	var data =[]; var url,response,$,team1,team2,score1,score2,status,desc;
	 url = "https://m.cricbuzz.com/";
	 response = await request({
		uri:url,
		headers:{"accept": "application/json, text/plain, */*",
"accept-encoding": "gzip, deflate, br",
"accept-language": "en-US,en;q=0.8"},
		gzip:true
		 
	});
	$ = cheerio.load(response);
	for(var i =2; ;i++)
	{
	 var title = $(" div > div:nth-child(7) > a:nth-child("+i+") > div > div > h3 > div").text();
		if(!title)
			break; var z; var x;
		for( x =0; x<title.length;x++)
		{ z =(title[x]).charCodeAt();if(z==8226) break;}
		var match = title.slice(0,x);
		var tour = title.slice(x+2,title.length);
		var team1t = $("div > div:nth-child(7) > a:nth-child("+i+") > div > div > div > span > div:nth-child(1) > span").text();
		var team1 = $(" div > div:nth-child(7) > a:nth-child("+i+") > div > div > div > span > div:nth-child(1) > span > span:nth-child(1)").text();
				
    
		var score1 = team1t.replace(team1,'').trim();
		var team2t = $("div > div:nth-child(7) > a:nth-child("+i+") > div > div > div > span > div:nth-child(2) > span").text();
		var team2 = $(" div > div:nth-child(7) > a:nth-child("+i+") > div > div > div > span > div:nth-child(2) > span > span:nth-child(1)").text();
				
    
		var score2 = team2t.replace(team2,'').trim();
		var status = $(" div > div:nth-child(7) > a:nth-child("+i+") > div > div > div > span:nth-child(2)").text();
		if(team1.length>15)
				{ 
					var z = team1.split(" ");var y="";
					for(var a1 =0; a1<z.length;a1++)
					y+=z[a1][0];
					team1=y;
				}
		if(team2.length>15)
				{
					var z = team2.split(" ");var y="";
					for(var a1 =0; a1<z.length;a1++)
					y+=z[a1][0];
					team2=y;
				}
	  	data.push({tour:tour,match:match,team1:team1,score1:score1,team2:team2,score2:score2,status:status});
		
	}	
		res.send({data});
	
	

})
app.listen(3000,function()
		  {
	console.log("Server has started");
});
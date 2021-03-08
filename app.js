var express = require("express"),
	app = express(),
	request = require("request-promise"),
	cheerio = require("cheerio");
var jquery = require('jquery');
app.use(express.static(__dirname + "/public"));
app.get("/",function(req,res){
	res.render("home.ejs");
})
app.get("/news",function(req,res)
	   {
	res.render("news.ejs");
})
app.get("/memes",function(req,res){
	res.render("memes.ejs");
})
app.get("/videos",function(req,res){
	res.render("videos.ejs");
})
app.get("/post",function(req,res){
	res.render("post.ejs");
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
	 var title = $(" div > div:nth-child(6) > a:nth-child("+i+") > div > div > h3 > div").text();
		if(!title)
			break; var z; var x;
		for( x =0; x<title.length;x++)
		{ z =(title[x]).charCodeAt();if(z==8226) break;}
		var match = title.slice(0,x);
		var tour = title.slice(x+2,title.length);
		var team1t = $("div > div:nth-child(6) > a:nth-child("+i+") > div > div > div > span > div:nth-child(1) > span").text();
		var team1 = $(" div > div:nth-child(6) > a:nth-child("+i+") > div > div > div > span > div:nth-child(1) > span > span:nth-child(1)").text();
		var score1 = team1t.replace(team1,'').trim();
		var team2t = $("div > div:nth-child(6) > a:nth-child("+i+") > div > div > div > span > div:nth-child(2) > span").text();
		var team2 = $(" div > div:nth-child(6) > a:nth-child("+i+") > div > div > div > span > div:nth-child(2) > span > span:nth-child(1)").text();
		var score2 = team2t.replace(team2,'').trim();
		var status = $(" div > div:nth-child(6) > a:nth-child("+i+") > div > div > div > span:nth-child(2)").text();
	  	data.push({tour:tour,match:match,team1:team1,score1:score1,team2:team2,score2:score2,status:status});
		
	}	
		res.send({data});
	
	

})
app.listen(3000,function()
		  {
	console.log("Server has started");
});
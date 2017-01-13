var express = require('express');
var bodyParser = require('body-parser');
var request1 = require('sync-request');
var request2 = require('request');

var accountSid = 'AC6d54a88615b537e86ad83b249e0d51e6'; // Your Account SID from www.twilio.com/console
var authToken = 'f0e9a38fd1f1c4110bf1a929e0db03eb';// Your Auth Token from www.twilio.com/console
var fromPhone = ''

var twilio = require('twilio');
var client = new twilio.RestClient(accountSid, authToken);

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
 
app.post("/message", function (request, response) {
  console.log(request.body); 
  var message = request.body; //JSON.parse(request.body);
  var messageArray = message.Body.split(" ");
  var from = message.From; //number of customer who sent msg
  var fromPhone = message.To //the twilio number to which the customer sent the message
  console.log(messageArray);
  // console.log(!isNaN(messageArray[1]));
  // console.log(messageArray[2].toUpperCase === "FAMILY");
  if(!(messageArray.length < 3) && messageArray[0].toUpperCase() === "register".toUpperCase() && !isNaN(messageArray[1]) && (messageArray[2].toUpperCase() === "FAMILY" || messageArray[2].toUpperCase() === "SENIOR" || messageArray[2].toUpperCase() === "SPECIAL")){
    console.log(messageArray[1] + " " + from);
    response.send("<Response><Message>You are subscribed to receive alerts when new homes are available.</Message></Response>")
  
    var db = "https://autobots-nagesh-sk.c9users.io/api/user/subscribe"
    
    var post_data = {
      'phone' : message.From,
      'zipcode' : messageArray[1],
      'category': messageArray[2].toLowerCase()
    };
  
    var res = request1('POST', db, {
      json: post_data
    });
    console.log(post_data);
    
  } else if(!(messageArray.length < 3) && messageArray[0].toUpperCase() === "search".toUpperCase() && !isNaN(messageArray[1]) && (messageArray[2].toUpperCase() === "FAMILY" || messageArray[2].toUpperCase() === "SENIOR" || messageArray[2].toUpperCase() === "SPECIAL")){
    
    var category = messageArray[2];   
    var zipcode = messageArray[1];
    var url = "https://autobots-nagesh-sk.c9users.io/api/houses/"+category.toLowerCase()+"/"+zipcode;
    
    request2(url, function(error2,res,bod){
      if(error2){
        console.log(error2);
      }else{
        var houses = JSON.parse(bod);
        
        if(houses.length == 0){
          
           msgBody = "No listings found in "+zipcode+" for "+category+" category.";
          
            sendTo = message.From;
            client.messages.create({
                  body: msgBody,
                  to: sendTo,  // Text this number
                  from: fromPhone // From a valid Twilio number
                }, function(err, message) {
                  console.log(message.sid);
                });
          
        } else {
        
          console.log(houses);  
          var j=0;    
          
          var msgBody = "";
          var sendTo = "";
          
          var step = function(j){
            var house = houses[j];
            if(j==0){
                msgBody = "There are some affordable houses available at "+house.zipcode
                sendTo = message.From;
            client.messages.create({
                  body: msgBody,
                  to: sendTo,  // Text this number
                  from: fromPhone // From a valid Twilio number
                }, function(err, message) {
                  console.log(message.sid);
                  step(j+1);
                });
            }
            if( j > 0 && j < 5 ) {
                
                console.log(house.zipcode+"\n");      
                //console.log("sending SMS for "+ user.phone+"\n");
                msgBody = house.developer+"\n"+ house.address+"\n Call " + house.phone +" for more info !!";
                
                sendTo = message.From;
            client.messages.create({
                  body: msgBody,
                  to: sendTo,  // Text this number
                  from: fromPhone // From a valid Twilio number
                }, function(err, message) {
                  console.log(message.sid);
                  step(j+1);
                });
            }
            if(j==5){
                msgBody = "For more listings check out our website.";
                
                sendTo = message.From;
            client.messages.create({
                  body: msgBody,
                  to: sendTo,  // Text this number
                  from: fromPhone // From a valid Twilio number
                }, function(err, message) {
                  console.log(message.sid);
                  step(j+1);
                });
            }
            
          } 
          
          step(0);
        }
      }
    });
    
  } else {
    console.log("other")
    response.send("<Response><Message>Hello! \n Subscribe to San Jose affordable homes by replying \n register &lt;zipcode&gt; &lt;type of home&gt; \n\nSearch places in a zipcode by replying \n search &lt;zipcode&gt; &lt;type of home&gt; \nType of home can be: family, senior, special</Message></Response>")
  }
});
 
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});
 
var listener = app.listen(8082, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

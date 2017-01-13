var http = require('http');
var https = require('https');
var parse = require('csv-parse');
var async = require('async');
var request = require('sync-request');
var querystring = require('querystring');
var request2 = require('request');
var cron = require('cron');
var StringDecoder = require('string_decoder').StringDecoder;

var lastModifiedDate;

var accountSid = 'AC6d54a88615b537e86ad83b249e0d51e6'; // Your Account SID from www.twilio.com/console
var authToken = 'f0e9a38fd1f1c4110bf1a929e0db03eb';// Your Auth Token from www.twilio.com/console
var fromPhone = '+15017084875'

var twilio = require('twilio');
var client = new twilio.RestClient(accountSid, authToken);


str="";
var index =0;
var header=0;
var zip_code ;

var db ="";

callback = function(response) {

  response.on('data', function (chunk) {
    str += chunk;
  });
  response.on('end', function () {
    var jsonObject = JSON.parse(str);

    while(jsonObject.result.fArray[index].fHeader) {
     header++;
     index++;     
   }
   var count =0;
   var length = (jsonObject.result.fLength)*header;
   var obj =[];
   while (index < length ){

    while (count < header ) {
     obj[count] = jsonObject.result.fArray[index];
     count++;
     index++;
   }

   var res = request ('GET','https://maps.googleapis.com/maps/api/geocode/json?address='+obj[2].fStr+'&key=AIzaSyC63VEBroUtm9pGK8VAC-nzGHToYXiKPCs');


   var jsonObject2 = JSON.parse(res.getBody());
   var lat = "";
   var lng = "";
   if(jsonObject2.results[0] == undefined){
    zip_code = 0;
  } else{
    var add_comp = jsonObject2.results[0].address_components
    for(var i = 0; i < add_comp.length; i++){
      if(add_comp[i].types[0] == 'postal_code'){
       zip_code = add_comp[i].long_name;
					//console.log(zip_code);
       }
     }
     lat = jsonObject2.results[0].geometry.location.lat;
     lng = jsonObject2.results[0].geometry.location.lng;
   }					
   var post_data = {
    'developer' : obj[1].fStr,
    'address': obj[2].fStr,
    'website' : obj[3].fStr,
    'company' : obj[4].fStr,
    'phone' : obj[5].fStr,
    'zipcode' : zip_code,
    'lat' : lat,
    'lng' : lng
    
  };
  
  var res = request('POST', db, {
    json: post_data
  });
  console.log(post_data);
  count = 0;
}
});
}


db='https://autobots-nagesh-sk.c9users.io/api/houses/family';

var cronJob = cron.job('00 06 03 * * *', function(){
  request2('http://api.data.sanjoseca.gov/api/v2/datastreams/AFFOR-HOUSI-FAMIL-HOUSI-77081/data.json/?auth_key=10a944b29e6494e3322356d741e97ff8d0b2ae50&limit=1',function(error,response,body){
    if(!error && response.statusCode == 200){
      var bodyData = JSON.parse(body);
      var dt = new Date(bodyData.modified_at);
      if(lastModifiedDate == null || dt > lastModifiedDate){
        lastModifiedDate = dt;
        // MarkEverything to Delete
         var res = request ('GET','https://autobots-nagesh-sk.c9users.io/api/houses/markDelete');
        http.get('http://api.data.sanjoseca.gov/api/v2/datastreams/AFFOR-HOUSI-FAMIL-HOUSI-77081/data.json/?auth_key=10a944b29e6494e3322356d741e97ff8d0b2ae50', callback).end();
      }  
}
  });
});

cronJob.start();

var cronJob2 = cron.job('00 49 05  * * *', function(){
var decoder = new StringDecoder('utf8');
// Delete old records  
 var res = request ('GET','http://autobots-nagesh-sk.c9users.io/api/houses/DeleteRecords');
// get all users       
     request2('http://autobots-nagesh-sk.c9users.io/api/user/subscribe/family', function(error,response,body){
   if(error){
  console.log(error);
  }else{
    var users = JSON.parse(body);
      for (var i = 0; i < users.length; i++){
      var user = users[i];
      console.log(user.phone+"\n");   
// get all houses from family
  request2('https://autobots-nagesh-sk.c9users.io/api/houses/familyfilter/'+user.zipcode+'/'+user.last_notified, function(error2,res,bod){
   if(error2){
  console.log(error2);
  }else{
    var houses = JSON.parse(bod);
      console.log(houses);  
      var j=0;    
var step = function(j){
   if( j < houses.length ) {
      house = houses[j];
       console.log(house.zipcode+"\n");      
  //console.log("sending SMS for "+ user.phone+"\n");
  var msgBody = "There is a new affordable house in"+ house.address+" you can call " + house.phone +"for more info !!";
var sendTo = '+16692928087'
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

   var res = request('POST', 'https://autobots-nagesh-sk.c9users.io/api/houses/updateLastNotified', {
    json: {
    last_notified: new Date().toISOString().slice(0, 19).replace('T', ' '),
    phone:user.phone, 
    zipcode :user.zipcode

}
});

}
});
}
}
});
});


cronJob2.start();


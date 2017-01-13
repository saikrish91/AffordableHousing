var http = require('http');
var https = require('https');
var parse = require('csv-parse');
var async = require('async');
var request = require('sync-request');
var querystring = require('querystring');
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
					}					
 var post_data = {
  'developer' : obj[1].fStr,
   'address': obj[2].fStr,
   'website' : obj[3].fStr,
   'company' : obj[4].fStr,
   'phone' : obj[5].fStr,
   'zipcode' : zip_code
  };
  
  var res = request('POST', db, {
  json: post_data
});
  console.log(post_data);

count = 0;
 }
 });
 }


db ='https://autobots-nagesh-sk.c9users.io/api/houses/special';
var req2 = http.get('http://api.data.sanjoseca.gov/api/v2/datastreams/AFFOR-HOUSI-SPECI-NEEDS-46892/data.json/?auth_key=10a944b29e6494e3322356d741e97ff8d0b2ae50', callback).end();


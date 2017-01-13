var express = require('express');
var app = express();

// app.use(express.static('html'));
// app.use(express.static('images'));
// app.use(express.static('public'));
// app.use(express.static('css'));
app.use(express.static('client'));

var bodyParser = require('body-parser');

var http = require("http");

var mysql  = require('mysql');

var accountSid = 'AC6d54a88615b537e86ad83b249e0d51e6'; // Your Account SID from www.twilio.com/console
var authToken = 'f0e9a38fd1f1c4110bf1a929e0db03eb';// Your Auth Token from www.twilio.com/console
var fromPhone = '+15017084875'

var twilio = require('twilio');
var client = new twilio.RestClient(accountSid, authToken);

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'versiontwo'
});

connection.connect();


// app.get('/api/user/subscribe', function(req, res){

//   var result =[];
//   var queryStr = "select * from user_info";
//   console.log("Query is "+queryStr);
//   connection.query(queryStr, function(err, rows, fields) {
//       if (!err){
//         console.log('The solution is: ', rows);
// 		for(var i = 0; i<rows.length; i++){

// 			result.push(rows[i]);
// 		}
// 		  	res.send(result);
// 	}

//       else{
//         console.log('Error while performing Query.'+err);
//       }
//       });
// });



// app.delete('/api/user/subscribe/:phone/:zipcode', function (req, res){

//     console.log(req.params.phone);
//     var queryStr = 'DELETE FROM user_info WHERE phone like '+req.params.phone +" and zipcode like "+req.params.zipcode;
//     var body = req.body;
//     //Delete a record.
//     connection.query(queryStr, function(err, res){
//         if(err) throw err;
//         else {
//             console.log('An customer is removed.');
//         }
//     });
//     res.send();

// });

// //HTTP to FAMILY INSERT
app.post('/api/houses/family', function (req, res) {

   //  console.log(req.body.name);
     var body = req.body;
     var user = {
    
    developer : body.developer,
    address: body.address,
    website : body.website,
    company : body.company,
    phone : body.phone,
    zipcode : body.zipcode,
    delete_id : 0,
    //last_modified : new Date().getTime()
    
}
var result =[];
  var queryStr = "select * from family_house where developer = '" +user.developer+"' AND address = '"+user.address +"' AND company = '"+user.company+"'";
  console.log("Query is "+queryStr);
  
  connection.query(queryStr, function(err, rows, fields) {
      if (err){
          console.log(err);
      }else{
        console.log('The solution is: ', rows);
		if(rows == undefined || rows.length == 0) {
    try{
   connection.query('INSERT INTO family_house SET ?', user, function(err,res){
       console.log('Last inserted ID:',res);
            if(err) throw err;
   console.log('Last inserted ID:',body.name);
   });
        
    }
   catch (e) {
  console.log("Error occured"+e);
       
   }
   }else {
try{
   connection.query("UPDATE family_house SET delete_id=0 WHERE developer = '" +user.developer+"AND address = '"+user.address +"' AND company= '"+user.company+"'", function(err,res){       
           if(err){
               console.log(err);
           }
   });
        
    }
   catch (e) {
  console.log("Error occured"+e);
}
}
   }
   });
   res.writeHeader(200, {"Content-Type": "application/json"});
   res.end();
  
});

// Mark Delete True
app.get('/api/houses/markDelete', function (req, res) {

    try{
   connection.query('UPDATE family_house SET delete_id=1' ,function(err,res){
       if(err){
           console.log(err);
       }
       
   });
        
     }
   catch (e) {
  console.log("Error occured"+e);
       
  }
   res.writeHeader(200, {"Content-Type": "application/json"});
   res.end();
  
 });


//  Delete records of delete_id = 1
app.get('/api/houses/DeleteRecords', function (req, res) {

    try{
   connection.query('DELETE family_house where delete_id=1' , function(err,res){
       if(err ){
  console.log("Error occured"+err);
       }
       
   });
        
    }
   catch (e) {
  console.log("Error occured"+e);
       
   }

   res.writeHeader(200, {"Content-Type": "application/json"});
   res.end();
  
});


//  Update user last notified records of delete_id = 1
app.post('/api/houses/updateLastNotified', function (req, res) {
console.log(req.body.name);
    var body = req.body;
    var last_notified = body.last_modified;
    var phone = body.phone;
    var zipcode = body.zipcode;
    
    try{
   connection.query("UPDATE user_info SET last_notified = '"+last_notified +"'where phone = '"+phone+"' AND zipcode = '"+zipcode+"'" , function(err,res){
       if(err){
           console.log(err);
       }
   });
        
    }
   catch (e) {
  console.log("Error occured"+e);
       
   }

   res.writeHeader(200, {"Content-Type": "application/json"});
   res.end();
  
});




app.get('/api/houses/family', function(req, res){

  var result =[];
  var queryStr = "select * from family_house where delete_id = 0";
  console.log("Query is "+queryStr);
  
   connection.query(queryStr, function(err, rows, fields) {
       if (!err){
         console.log('The solution is: ', rows);
 		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
 		}
 		  	res.send(result);
 	}

      else{
               console.log('Error while performing Query.'+err);
       }
       });
});

// app.delete('/api/houses/family', function (req, res){

//     var cust_id = req.body.cust_id;

//     var queryStr = 'DELETE FROM family_house';
//     var body = req.body; 
//     //Delete a record.
//     try{
//     connection.query(queryStr, function(err, res){
//         if(!err)
//             console.log('An house is removed.');
//     });
//     }
//     catch(e){
//         console.log(e);
//     }
        
    
//   res.send();
// });


//HTTP to FAMILY 
app.post('/api/houses/senior', function (req, res) {

    console.log(req.body.name);
    var body = req.body;
    var user = {
    
    developer : body.developer,
    address: body.address,
    website : body.website,
    company : body.company,
    phone : body.phone,
    zipcode : body.zipcode
    
}

try{
   connection.query('INSERT INTO senior_house SET ?', user, function(err,res){
   if(!err)
   console.log('Last inserted ID:',body.name);
   });
    }
   catch (e) {
  console.log("Error occured"+e);
   }
   res.writeHeader(200, {"Content-Type": "application/json"});
   res.end();
  
});

app.get('/api/houses/senior', function(req, res){

  var result =[];
  var queryStr = "select * from senior_house";
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.delete('/api/houses/senior', function (req, res){

    var cust_id = req.body.cust_id;

    var queryStr = 'DELETE FROM family_house';
    var body = req.body; 
    //Delete a record.
    connection.query(queryStr, function(err, res){
        if(err) throw err;
        else {
            console.log('An house is removed.');
        }
    });
  res.send();
});



//HTTP to FAMILY 
app.post('/api/houses/special', function (req, res) {

    console.log(req.body.name);
    var body = req.body;
    var user = {
    
    developer : body.developer,
    address: body.address,
    website : body.website,
    company : body.company,
    phone : body.phone,
    zipcode : body.zipcode
    
}

try{
   connection.query('INSERT INTO special_house SET ?', user, function(err,res){
   if(!err)
   console.log('Last inserted ID:',body.name);
   });
}
 catch (e) {
  console.log("Error occured"+e);
   }
   res.writeHeader(200, {"Content-Type": "application/json"});
   res.end();
  
});

app.get('/api/houses/special', function(req, res){

  var result =[];
  var queryStr = "select * from special_house";
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.delete('/api/houses/special', function (req, res){

    var cust_id = req.body.cust_id;

    var queryStr = 'DELETE FROM special_house';
    var body = req.body; 
    //Delete a record.
    connection.query(queryStr, function(err, res){
        if(err) throw err;
        else {
            console.log('An house is removed.');
        }
    });
  res.send();
});

app.get('/api/houses/special', function(req, res){

  var result =[];
  var queryStr = "select * from special_house";
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.get('/api/houses/special/:zipcode', function(req, res){

  var result =[];
  var queryStr = "select * from special_house where zipcode="+req.params.zipcode;
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.get('/api/houses/family/:zipcode', function(req, res){

  var result =[];
  var queryStr = "select * from family_house where zipcode="+req.params.zipcode;
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.get('/api/houses/senior/:zipcode', function(req, res){

  var result =[];
  var queryStr = "select * from senior_house where zipcode="+req.params.zipcode;
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){

			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

//Nikhil changes for V2 

app.get('/api/user/subscribe/:category', function(req, res){

  var result =[];
  var queryStr = "select * from user_info where category='"+req.params.category+"'";
  console.log("Query is "+queryStr);
  connection.query(queryStr, function(err, rows, fields) {
      if (!err){
        console.log('The solution is: ', rows);
		for(var i = 0; i<rows.length; i++){
			result.push(rows[i]);
		}
		  	res.send(result);
	}

      else{
        console.log('Error while performing Query.'+err);
      }
      });
});

app.post('/api/sms', function (req, res) {
console.log("yes");
  
var msgBody = 'This is great. I love Twilio!!'
var sendTo = '+14087979115'
try{
client.messages.create({
    body: msgBody,
    to: sendTo,  // Text this number
    from: fromPhone // From a valid Twilio number
}, function(err, message) {
    if(!err)
    console.log(message.sid);
});
}
catch(e){
    console.log(e);
    
}

  
});

//HTTP to subscribe
app.post('/api/user/subscribe', function (req, res) {

    console.log("body is "+req.body);
    var body = req.body;
    
    var phone = body.phone;
    phone.replace(/\(|\)/g,'');
    phone.replace(/\-|/g,'');
    phone.replace(/\+|/g,'');
    console.log("Phone number is "+phone);

    var user = {
    
    phone: phone,
    email : body.email,
    zipcode : body.zipcode,
    category : body.category
    //uncomment: lat : body.lat,
    //uncomment: lng : body.lng,
    //uncomment: miles: body.miles,
    //uncomment: last_notified: body.last_notified,
    //uncomment: delete_id: body.delete_id
    
}

    try{
   connection.query('INSERT INTO user_info SET ?', user, function(err,res){
       if(!err){
        console.log('Inserted :');
       }
   });
        
    }
    catch(err){
        console.log(err);
    }
    
   res.writeHeader(201, {"Content-Type": "text"});
   res.end();
  
});



console.log("Listening on port"+process.env.PORT);
app.listen(process.env.PORT);
var helper = require('./helper.js');
function encodeHTML(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

function randomToken() {
  return randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
}

Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('forgotPassword', function (req,res) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query('AppUser');
  query.equalTo("email",req.params.email);
  var logToken = randomToken();
  console.log(logToken,"#forgotPassword","#request",req.params);
  query.find({
    success: function(results) {
      console.log(logToken,"#forgotPassword","#found.user",results);
      if (results.length == 0) {
        return res.error("no user is found");
      }
      else if (results.length == 1) {
        var user = results[0]; // type: PFObject
        var password = user.get("password");
        // Send Email
        //helper.sendEmail(process.env.FROM_EMAIL,process.en)

        var htmlString = "Your password is <i>"+encodeHTML(password)+"</i>";
        var sendgridKey = process.env.SENDGRID_KEY;
        var sendgrid  = require('sendgrid')(sendgridKey);
        var toEmail = user.get("email");
        var fromEmail =  process.env.FORGOTPASSWORD_FROM;
        var subject = process.env.FORGOTPASSWORD_SUBJECT;
        var text = 'Your password is "'+password+"'";
        var payload   = {
          to      : toEmail,
          from    : fromEmail,
          subject : subject,
          text    : text,
          html    : htmlString
        };
        console.log(logToken,"#forgotPassword","#send.before",payload);
        sendgrid.send(payload, function(err, json) {
          console.log(logToken,"#forgotPassword","#send.after",err,json);
          if(err) {
            return res.error(err);
          }
          else {
            return res.success(json);
          }
        });
        //helper.sendEmail(user.get("email"),process.env.FORGOTPASSWORD_FROM,process.env.FORGOTPASSWORD_SUBJECT,'Your password is "'+password+"'",htmlString,function(error,result){
        //  if(error) {
        //    res.error("Server error: Password email is not sent.");
        //  }
        //  else {
        //    res.success("Password email is sent.");
        //  }
        //});
      }
      else {
        return res.error("more than one user is found");
      }
    },
    error:function(error) {
      console.log(logToken,"#forgotPassword","#finduser.error",error);
      return res.error(error);
    }
  });
});

Parse.Cloud.define('finduser',function(req,res) {
  Parse.Cloud.useMasterKey();
  var query = new Parse.Query('AppUser');
  query.equalTo("email",req.params.email);
  query.find({
    success: function(results) {
      if (results.length == 0) {
        return res.error("no user is found");
      }
      else if (results.length == 1) {
        return res.success(results[0]);
      }
      else {
        return res.error("more than one user is found");
      }
    },
    error:function(error) {
      return res.error(error);
    }
  });
});
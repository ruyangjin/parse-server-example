exports.sendEmail = function(toEmail,fromEmail,subject,text,html,callback) {
    var sendgridKey = process.env.SENDGRID_KEY;
    var sendgrid  = require('sendgrid')(sendgridKey);
    var payload   = {
        to      : toEmail,
        from    : fromEmail,
        subject : subject,
        text    : text,
        html    : html
    };
    sendgrid.send(payload, function(err, json) {
        callback(err,json);
    });
}
var express = require('express');
var app     = express();
var ECT = require('ect');

var crypto  = require('crypto');
var server  = app.listen(3000);

app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

function crypto_convert(text)
{
    var cipher = crypto.createCipher('aes-256-cbc', 'password');
    var crypted = cipher.update(text, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypto_convert(text)
{
    decipher = crypto.createDecipher('aes-256-cbc', 'password');
    dec = decipher.update(text, 'hex', 'utf-8');
    dec += decipher.final('utf-8');
    return dec;
}

// console.log(decrypto_convert(crypto_convert('test')));

app.get('/', function(req, res) {
  res.render('index', {title1 : 'express test title1'});
});


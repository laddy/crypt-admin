var express    = require('express');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var crypto     = require('crypto');
var ECT        = require('ect');

var crypt_salt = 'GYw-HB35AHsTVmKVyJ7Ur6JLhaQHPiWS';

var app = express();
var server  = app.listen(3000);

app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

console.log(crypto.createHash('sha256').update('hoge'+crypt_salt).digest('hex'));

/*
var db = new mongo.Db('crypt-admin', new mongo.Server('ds030829.mlab.com', 30829, {}), {});
var Collection;
db.open(function() {
    db.authenticate('laddy', 'laddymongo', function(err, result) {
        });
    db.collection('teacherCollection', function(err, collection) {
        doc = {
            "firstname" : "Taro",
            "familyname" : "Yamada",
            "age" : 42,
            "work" : ["professor", "writer", "TV Caster"]
        };
        collection.insert(doc, function() {
            console.log("insert success");
        });

    });
    db.collection('teacherCollection').find();
    db.cursor.each(function(err, doc) {
        console.log(doc);
    });
    db.close();
});
*/

function crypto_convert(text)
{
    var cipher  = crypto.createCipher('aes-256-cbc', 'password');
    var crypted = cipher.update(text, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypto_convert(text)
{
    decipher  = crypto.createDecipher('aes-256-cbc', 'password');
    dec       = decipher.update(text, 'hex', 'utf-8');
    dec      += decipher.final('utf-8');
    return dec;
}

// console.log(decrypto_convert(crypto_convert('test')));

app.get('/', function(req, res) {
  res.render('index', {title1 : 'express test title1'});
});


app.get('/test', function(req, res){


});

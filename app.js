var express    = require('express');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var crypto     = require('crypto');
var ECT        = require('ect');

var crypt_salt = 'GYw-HB35AHsTVmKVyJ7Ur6JLhaQHPiWS';

var app     = express();
var server  = app.listen(3000);

app.use(bodyParser.urlencoded({extended: true}));
app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

console.log(crypto.createHash('sha256').update('hogehoge'+crypt_salt).digest('hex'));

mongodb.MongoClient.connect("mongodb://ds030829.mlab.com:30829/crypt-admin", function(err, database) {
    users = database.collection("users");
});

users.find().toArray(function(err, items) {
    console.log(items);
});
/*
var Collection;
db.open(function() {
    db.authenticate('laddy', 'laddymongo', function(err, result) {
        });
    /*
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
    db.collection('service').find();
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

// ログイン画面表示
app.get('/', function(req, res) {
    res.render('index', {title1 : 'express test title1'});
});
app.post('/', function(req, res) {
    console.log(req.body);
    res.render('index', {title1 : 'post', hoge: req.body.test});
});


// ログイン後画面表示
app.get('/acclist', function(req, res) {
    res.render('acclist', {
        service: [
            { service: 'Google', url: 'https://google.co.jp/', id: '12345', pass: 'xxxxxxxx'},
            { service: 'Facebook', url: 'https://facebook.com/', id: '12345', pass: 'yyyyy'},
            { service: 'Twitter', url: 'https://twitter.com/', id: '12345', pass: 'zzzzz' }
        ]
    });
});


// ユーザ登録
app.get('/admin-user', function(req, res) {
    res.render('admin-user');
});

// サービス登録
app.get('/admin-service', function(req, res) {
    res.render('admin-service');
});



app.get('/test', function(req, res){


});

var express    = require('express');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var crypto     = require('crypto');
var ECT        = require('ect');

var crypt_salt = 'GYw-HB35AHsTVmKVyJ7Ur6JLhaQHPiWS';

var app     = express();
var server  = app.listen(3000);

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

app.use(bodyParser.urlencoded({extended: true}));
app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

console.log(crypto.createHash('sha256').update('hogehoge'+crypt_salt).digest('hex'));

var service;
var users;
mongo.MongoClient.connect("mongodb://laddy:laddymongo@ds030829.mlab.com:30829/crypt-admin", function(err, database) {
    users   = database.collection("users");
    service = database.collection("service");
});


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
    service.find().toArray(function(err, items) {
        console.log(items);
        res.render('acclist', items);
    });
});


// ユーザ登録
app.get('/admin-user', function(req, res) {
    res.render('admin-user');
});

// サービス登録
app.get('/admin-service', function(req, res) {
    console.log(req.query);
    
    service.find().toArray(function(err, items) {
//        console.log(items);
        res.render('admin-service', {list: items});
    });
});
app.post('/admin-service', function(req, res) {
    console.log(res.body);
    // Save Mongo
    service.insert(req.body);
    res.redirect('/admin-service');
});


app.get('/test', function(req, res){


});

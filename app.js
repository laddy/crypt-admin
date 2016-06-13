var express    = require('express');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var crypto     = require('crypto');
var ECT        = require('ect');
var session    = require('express-session');
// var MongoStore = require('connect-mongo')(session);


var app     = express();
var server  = app.listen(3000);

var crypt_salt = 'GYw-HB35AHsTVmKVyJ7Ur6JLhaQHPiWS';


function crypto_convert(text)
{
    var cipher  = crypto.createCipher('aes-256-cbc', 'password');
    var crypted = cipher.update(text, 'utf-8', 'hex');
    crypted    += cipher.final('hex');
    return crypted;
}

function decrypto_convert(text)
{
    try {
        var decipher  = crypto.createDecipher('aes-256-cbc', 'password');
        var dec       = decipher.update(text, 'hex', 'utf-8');
        dec          += decipher.final('utf-8');
        return dec;        
    } catch (error) {
        return text;
    }

}

// Session 
/*
app.use(session({
    secret: 'secret',
    store: new MongoStore({
        db: 'crypt-admin',
        host: 'laddy:laddymongo@ds030829.mlab.com:30829',
        clear_interval: 60 * 60
    }),
    cookie: {
        httpOnly: true,
        maxAge: new Date(Date.now() + 60 * 60 * 1000)
    }
}));
*/

app.use(bodyParser.urlencoded({extended: true}));
app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

console.log(crypto.createHash('sha256').update('admin'+crypt_salt).digest('hex'));
// console.log(decrypto_convert(crypto_convert('admin')));

var service;
var users;
mongo.MongoClient.connect("mongodb://laddy:laddymongo@ds030829.mlab.com:30829/crypt-admin", function(err, database) {
    users   = database.collection("users");
    service = database.collection("service");
    user    = database.collection("user");
    console.log('in connect');
});



// ログイン画面表示
app.get('/', function(req, res) {
    res.render('index', {title1 : 'express test title1'});
});
app.post('/', function(req, res) {
//    console.log(req.body);
    var usr = user.find({login : req.body.userid, password : crypto.createHash('sha256').update(req.body.password + crypt_salt).digest('hex')});
    console.log(usr);
    res.render('index');
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


/*
 * Admin Area
 */
// 全サービス表示
app.get('/admin-service/', function(req, res) {
    service.find().toArray(function(err, items) {
        items.forEach(function(element) {
            element.pass = decrypto_convert(element.pass);
        }, this);
        res.render('admin-service', {list: items});
    });
});
// Save Service Data
app.post('/admin-service', function(req, res) {
    console.log(req.body);

    req.body.pass = crypto_convert(req.body.pass);
    if ( "" !== req.body._id )
    {
        console.log('update');
        req.body._id = mongo.ObjectID(req.body._id);
        console.log('mongoID: ' + req.body._id);
        service.update({'_id' : req.body._id}, req.body);
    }
    else {
        // Save Mongo
        console.log('insert');
        req.body._id = null;
        service.insert(req.body);
    }
    res.redirect('/admin-service');
});


// Service Edit
app.get("/admin-edit/:_id", function(req, res) {
    if ( 'new' !== req.params._id )
    {
        service.findOne({_id: mongo.ObjectID(req.params._id)}, function(err, item) {
            item.pass = decrypto_convert(item.pass);
            res.render('admin-edit', item);
        });
    }
    else
    {
        res.render('admin-edit');
    }
});

app.get('/test', function(req, res){


});


app.use(express.static('public'));

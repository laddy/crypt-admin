var express    = require('express');
var bodyParser = require('body-parser');
var mongo      = require('mongodb');
var crypto     = require('crypto');
var ECT        = require('ect');

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

// Login Check
var loginCheck = function(req, res, next) {
    if(req.session.user){
      next();
    }else{
      res.redirect('/');
    }
};


// Session 
/*
app.use(express.cookieParser());
app.use(express.session({
    secret: 'secret',
    store: new MongoStore({
        db: 'session',
        host: 'localhost',
        clear_interval: 60 * 60
    }),
    cookie: {
        httpOnly: false,
        maxAge: new Date(Date.now() + 60 * 60 * 1000)
    }
})); //追加
*/


app.use(bodyParser.urlencoded({extended: true}));
app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');

// console.log(crypto.createHash('sha256').update('hogehoge'+crypt_salt).digest('hex'));

var service;
var users;
mongo.MongoClient.connect("mongodb://laddy:laddymongo@ds030829.mlab.com:30829/crypt-admin", function(err, database) {
    users   = database.collection("users");
    service = database.collection("service");
    console.log('in connect');
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
app.post('/admin-service', function(req, res) {
    console.log(req.body['pass']);

    req.body.pass = crypto_convert(req.body.pass);
    if ( "" !== req.body._id )
    {
         req.body._id = mongo.ObjectID(req.body._id);
         console.log(req.body._id);
         service.update(req.body);
    }
    // Save Mongo
    service.insert(req.body);
    res.redirect('/admin-service');
});


// Service Edit
app.get("/admin-edit/:_id", function(req, res) {
    if ( 'new' !== req.params._id )
    {
        service.findOne({_id: mongo.ObjectID(req.params._id)}, function(err, item) {
            console.log(item);
//            item.pass = decrypto_convert(item.pass);
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

var express      = require('express');
var mongo        = require('mongodb');
var crypto       = require('crypto');
var ECT          = require('ect');

var session      = require('express-session');
var mongoStore   = require('connect-mongo')(session);
var cookieParser = require('cookie-parser')

var bodyParser = require('body-parser');


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

app.use(cookieParser());
app.use(session({         // cookieに書き込むsessionの仕様を定める
    secret: 'secret',               // 符号化。改ざんを防ぐ
    store: new mongoStore({
        db: 'session',
        url: 'mongodb://laddy:laddymongo@ds030829.mlab.com:30829/crypt-admin',
        clear_interval: 60 * 60     // mongodbに登録されたsession一覧を見て、expireしている物を消す、ということをする周期
    }),
    cookie: { //cookieのデフォルト内容
        httpOnly: false,
        maxAge: 60 * 60 * 1000//1 hour. ここを指定しないと、ブラウザデフォルト(ブラウザを終了したらクッキーが消滅する)になる
    }
}));

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
    console.log('in connect');
});



// ログイン画面表示
app.get('/', function(req, res) {
    console.log(req.session.id);
    res.render('index', {title1 : 'express test title1'});
});
app.post('/', function(req, res) {
    users.findOne({
            login : req.body.userid,
            password : crypto.createHash('sha256').update(req.body.password + crypt_salt).digest('hex')
        },
        function (err, authuser) {
            if ( !authuser ) {
                res.render('index');
            }
            else if ( 1 < Object.keys(authuser).length ) {
                req.session.user = {
                    id   : authuser.login,
                    name : authuser.name,
                    pwd  : authuser.password,
                };
                console.log('in login');

                // Admin go all service page
                if ( 'admin' == authuser.login ) {
                    res.redirect('admin-service');
                }
                else {
                    res.redirect('acclist');
                }
            }
        }
    );
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
    if ( 'admin' == req.session.id ) {
        res.render('admin-user');
    }
    else {
        res.render('acclist');
    }
});


/*
 * Admin Area
 */
// 全サービス表示
app.get('/admin-service/', function(req, res) {
    if ( 'admin' != req.session.id ) {
        res.render('acclist');
    }

    service.find().toArray(function(err, items) {
        items.forEach(function(element) {
            element.pass = decrypto_convert(element.pass);
        }, this);
        res.render('admin-service', {list: items});
    });
});
// Save Service Data
app.post('/admin-service', function(req, res) {
    if ( 'admin' != req.session.id ) {
        res.render('acclist');
    }

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
    if ( 'admin' != req.session.id ) {
        res.render('acclist');
    }
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

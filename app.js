var express      = require('express');
var mongo        = require('mongodb');
var crypto       = require('crypto');
var ECT          = require('ect');

var session      = require('express-session');
var mongoStore   = require('connect-mongo')(session);
var cookieParser = require('cookie-parser')
var bodyParser   = require('body-parser');


var app     = express();
var server  = app.listen(3000);

var crypt_salt = 'GYw-HB35AHsTVmKVyJ7Ur6JLhaQHPiWS';
var config = require('./config');

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

var service;
var users;

mongo.MongoClient.connect("mongodb://" +config.dbuser+
    ":" +config.dbpass+ "@" +config.dbhost+ ":" +config.dbport+ "/" +config.dbdb,
    function(err, database) {
        users   = database.collection("users");
        service = database.collection("service");
        console.log('in connect');
    }
);

/*
 * Middle Ware
 */
app.use(bodyParser.urlencoded({extended: true}));
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

console.log(crypto.createHash('sha256').update('admin'+crypt_salt).digest('hex'));
// console.log(decrypto_convert(crypto_convert('admin')));

app.engine('ect', ECT({ watch: true, root: __dirname + '/views', ext: '.ect' }).render);
app.set('view engine', 'ect');




// ログイン画面表示
app.get('/', function(req, res) {
    console.log('Get /');
    // Has Session Admin
    if ( undefined != req.session.user && 'admin' == req.session.user.id  ) {
        console.log('Redirect /admin-service');
        res.redirect('admin-service');
    }
    else {
        console.log('Redirect /index');
        res.render('index');
    }
});
// Post Login Data
app.post('/', function(req, res) {
    console.log('Post /');
    users.findOne({
        login    : req.body.userid,
        password : crypto.createHash('sha256').update(req.body.password + crypt_salt).digest('hex')
    },
    function (err, authuser) {
        if ( null != authuser && 1 < Object.keys(authuser).length ) {
            req.session.user = {
                id   : authuser.login,
                name : authuser.name,
            };
        }
        res.render('index', {err : 'Error: UserID or Password'});
    });
});


/*
 * Admin Area
 */
// 全サービス表示
app.get('/admin-service/', function(req, res) {
    if ( 'admin' != req.session.user.id ) {
        res.redirect('/');
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
    if ( 'admin' != req.session.user.id ) {
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
    if ( 'admin' == req.session.user.id ) {
        res.render('admin-edit');
    }
    if ( 'new' !== req.params._id )
    {
        service.findOne({_id: mongo.ObjectID(req.params._id)}, function(err, item) {
            item.pass = decrypto_convert(item.pass);
            res.render('admin-edit', item);
        });
    }
    else {
        res.redirect('acclist');
    }
});


app.use(express.static('public'));

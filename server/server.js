var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var bodyParser = require('body-parser');
require('ejs');
var data = require('./config.json');
var passport = require('passport');

var port = data['port'];
var templates = __dirname + '/views'

app.use('/static', express.static('static'));

// Setup Passport

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.use( passport.initialize());
app.use( passport.session());

// Setup Google

var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
 
passport.use(new GoogleStrategy({
    clientID: data.google.clientID,
    clientSecret: data.google.clientSecret,
    callbackURL: "/login/google/callback",
    passReqToCallback   : true
  },
  function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      google_login(profile, function(data){
        if (!data.err) {
          req.session.user = data.result;
          return done(null, data.result);
        }
      })
    });
  }
));

// Sessions
var session = require("express-session")({
    secret: data.secret,
    resave: true,
    saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");
app.use(session);
io.use(sharedsession(session)); 


// Settings
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Web Server Functions

app.get('/', function(req, res){
  if (req.session && req.session.user) {
    res.redirect('/chat')
  } else {
    res.redirect(302, '/login');
  }
});

app.get('/login', function(req, res){
  if (req.session && req.session.user) {
    res.redirect('/chat')
  } else {
    res.render('login', { error:'' });
  }
});

app.post('/login', function(req, res) {
  login(req.body.username, req.body.password, function(data){
    if (data.err) {
      res.render('login', { error: data.err});
    } else {
      req.session.user = data.result;
      res.redirect('/chat');
    }
  });
});

app.get('/login/google',
  passport.authenticate('google', { scope: 
  	[ 'profile', 'email' ] }
));
 
app.get('/login/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
//    req.session.user = profile;
    res.redirect('/');
});

app.get('/chat', function(req, res) {
  if (req.session && req.session.user) {
    login(req.session.user.username, req.session.user.password, function(data){
      if (data.err) {
        req.session.destroy();
        res.redirect(302, '/login');
      } else {
        req.session.user = data.result;
        res.render('server', {'name': req.session.user.name_full});
      }
    });
  } else {
    req.session.destroy();
    res.redirect(302, '/login');
  }
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect(302,'/login');
});

// Socket.IO Server Functions

io.on('connect', function(socket){
  var user = socket.handshake.session.user
  if (user) {
    io.emit('message', user.name_first +' has connected')
    socket.on('message', function(msg){
      if (msg) {
        io.emit('message', user.name_first + ': '+ msg);
      }
    });
    socket.on('disconnect', function(){
      io.emit('message', user.name_first + ' has disconnected');
    });
  } else {
    io.emit('message', 'Please refresh or reopen the app to log back in')
  }
});

// Start Server

http.listen(port, function(){
    console.log('listening on *:' + port);
});


// Database Functions

var DBisConnected = false;

var db = mysql.createConnection({
  host: data.mysql.url,
  user: data.mysql.user,
  password: data.mysql.password,
  database: data.mysql.database
});

db.connect(function(err) {
  if (err) {
    console.log("myQSL ERROR: " +err.code)
    console.log("Please create database '"+data.mysql.database+"' in your mySQL server")
  } else {
    if (data.mysql.database == ""){
      console.log("Please enter a database in the config.json file!")
    } else {
      console.log("Connection Established");
      DBisConnected = true;
      console.log("Checking database...");
      db.query("CREATE TABLE IF NOT EXISTS log (id int(5) NOT NULL UNIQUE KEY PRIMARY KEY,user varchar(25) NOT NULL,msg text NOT NULL,color varchar(6) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=latin1;", function (err, result) {
        if (err) { 
          console.log(err); 
          console.log("CREATE TABLE log .... Failed")
        } else {
          console.log("TABLE log .... Good");
        }
      });
      db.query("CREATE TABLE IF NOT EXISTS users (name_first varchar(25) NOT NULL,name_last varchar(25) NOT NULL,name_full varchar(50) NOT NULL,username varchar(18) NOT NULL PRIMARY KEY UNIQUE KEY,password varchar(25) NOT NULL,email varchar(50) NOT NULL,created date NOT NULL,google_id varchar(21) DEFAULT NULL UNIQUE KEY,admin tinyint(1) NOT NULL DEFAULT 0,color varchar(6)) ENGINE=InnoDB DEFAULT CHARSET=latin1;", function (err, result) {
        if (err) { 
          console.log(err); 
          console.log("CREATE TABLE users .... Failed")
        } else {
          console.log("TABLE users .... Good");
          console.log("Database Check Done")
        }
      });
    }
  }
});

var login = function (usern, passwd, callback) {
  if (DBisConnected) {
    db.query("SELECT * FROM users", function (err, result) {
      if (err) throw err;
      for (i = 0; i < result.length; i++){
        if (result[i].username == usern && result[i].password == passwd){
          return callback( {"result": result[i], "err": ""} );
        }
      }
      return callback( {"err": "Invalid username or password!"} );
    });
  } else {
    return callback( {"err": "No database connected!"} )
  }
}

var google_login = function (profile, callback) {
  if (DBisConnected) {
    db.query("SELECT * FROM users", function (err, result) {
      if (err) throw err;
      for (i = 0; i < result.length; i++){
        if (result[i].google_id == profile.id && result[i].email == profile.email){
          return callback( {"result": result[i], "err": ""} );
        }
      }
      return callback( {"err": "Invalid username or password!"} );
    });
  } else {
    return callback( {"err": "No database connected!"} )
  }
}

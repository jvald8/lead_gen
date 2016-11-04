require(`dotenv`).config();
// node dashboard, runs with 'npm dev'

var express = require('express'),
 	app = express(),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash'),
	logger = require('morgan'),
	flash = require('connect-flash'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	RedisStore = require('connect-redis')(session);

var passport = require('passport'),
	Strategy = require('passport-local').Strategy;

var userDb = require('../database/user');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({store: new RedisStore({
	host: '127.0.0.1',
	port: 6379
}), secret: 'kitty-kat-meow', key: 'express.sid', resave: false, saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

passport.use(new Strategy(
  function(email, password, cb) {
  	console.log({email: email})
  	console.log({password: password})
    userDb.findByEmail(email, function(err, user) {
      if (err) {console.log({err: err}); return cb(err); }
      if (!user) { console.log({user2: user}); return cb(null, false); }
      if (user.password !== password) {console.log({user: user}); return cb(null, false); }
      console.log({user1:user})
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.user_id);
});

passport.deserializeUser(function(id, cb) {
	userDb.findById(id, function(err, user) {
		if(err) {return cb(err);}
		cb(null, user);
	})
});

app.set('views' ,'./views');

app.set('view engine', 'pug');

app.get('/',
  function(req, res) {
  	console.log({requestUser: req.user})
    res.render('home', { user: req.user});
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: 'Invalid credentials' }),
  // function(req, res) {
  // 	console.log({requestBody:req.user})
  //   res.redirect('/');
  // });
  function(){console.log('after login')}
);
  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

app.listen(3000);

console.log('listen on 3000')
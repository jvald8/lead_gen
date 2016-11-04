require(`dotenv`).config();
// node dashboard, runs with 'npm dev'

var express = require('express'),
 	app = express(),
	bodyParser = require('body-parser'),
	fs = require('fs'),
	path = require('path'),
	_ = require('lodash');

var passport = require('passport'),
	Strategy = require('passport-local').Strategy;

var userDb = require('../database/user');

//app.use(require('morgan')('combined'));

passport.use(new Strategy(
  function(email, password, cb) {
  	console.log({email: email})
    userDb.findByEmail(email, function(err, user) {
    	console.log(err)
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password !== password) { return cb(null, false); }
      console.log({user:user})
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	userDb.findById(id, function(err, user) {
		if(err) {return cb(err);}
		cb(null, user);
	})
});

console.log('something')

app.use(passport.initialize());
app.use(passport.session());

app.set('views' ,'./views');

app.set('view engine', 'pug');

app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    res.render('login');
  });
  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login'}),
  function(req, res) {
  	console.log({requestBody:req.user})
    res.redirect('/');
  });
  
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
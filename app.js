const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bodyPaser = require('body-parser');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/basic_aith', { useNewUrlParser: true, });

const port = 3000;
const app = express();

// remember that order of these methods below is important
app.set('view engine', 'ejs');
app.use(bodyPaser.urlencoded({ extended: true, }));
app.use(require('express-session')({
  secret: 'asdgwegqgjlkwfkqwq',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Encodes the sessions for us
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/', (req, res) => {
  res.render('home');
});


// Auth Routes
// show sign in form
app.get('/register', (req, res) => {
  res.render('register');
});

// user sign up
app.post('/register', (req, res) => {
  // register a new user
  // second argument is always the password to be hashed
  // third argument is always the callback with returned user with hashed password and error
  User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register');
    }

    console.log('it registered', user);
    passport.authenticate('local')(req, res, function () {
      res.redirect('/secret');
    });
  });
});


// login routes
// render login form
app.get('/login', (req, res) => {
  res.render('login');
});

// submit login form
// use middleware
app.post('/login', passport.authenticate('local', {
  successRedirect: '/secret',
  failureRedirect: '/dogs',
}), function (req, res) {

});

// logout route
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/home');
});

// secret page requires a logged in user
app.get('/secret', isLoggedIn, (req, res) => {
  res.render('secret');
});


// middleware to check if user is logged in
// next is the next thing that must happen after middleware is called
function isLoggedIn(req, res, next) {
  // check if user is logged in
  if (req.isAuthenticated()) {
    return next();
  }

  // return user to login if not authenticated
  res.redirect('/secret');
}


app.listen(port, () => {
  console.log(`We are live on ${port}`); // eslint-disable-line
});

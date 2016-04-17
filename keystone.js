'use strict';

// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

// Require keystone
var keystone = require('keystone');

var express = require('express');
//var swig = require('swig');
var subdomainOffset = process.env.SUBDOMAIN_OFFSET || 0;
var secrets = require('./config/secrets');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')({ session: session });
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var compress = require('compression')();
var lodash = require('lodash');
// var Authentication = require('./authentication');
var expressValidator = require('express-validator');
var errorHandler = require('./middleware/error');
var viewHelper = require('./middleware/view-helper');
var flash = require('express-flash');
var cors = require('cors');
var corsOptions = {
  origin: '*'
};
var staticDir;
staticDir = path.join(__dirname + '/../static');
// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.

keystone.init({

	'name': 'qigong',
	'brand': 'qigong',
	
	'sass': 'static',
	'static': 'static',
	'favicon': 'static/favicon.ico',
	'views': 'templates/views',
	'view engine': 'jade',
	
	'emails': 'templates/emails',
	
	'auto update': true,
	'session': true,
	'auth': true,
	'user model': 'User'

});

// Load your project's Models

keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});

// setup db
mongoose.connect(secrets.db);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Make sure MongoDB is running.');
});

var corsOptions = {
  origin: '*'
};

// express setup
var app = express();


// This is where all the magic happens!

app.locals._ = lodash;
app.locals.stripePubKey = secrets.stripeOptions.stripePubKey;


app.use(favicon(path.join(__dirname + '/static/favicon.ico')));
app.use(logger('dev'));

app.use(compress);
app.use(bodyParser());
app.use(expressValidator());

//var cookieSecret = 'Fr0b0z'
//app.use(cookieParser(cookieSecret));

app.use(express.static(staticDir));
if(app.get('env') !== 'production'){
  app.use('/styles', express.static(__dirname + '/../.tmp/styles'));
  // app.use('/', routes.styleguide);
}

app.use(session({
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 1000 // 1 minute
  },
  secret: secrets.sessionSecret,
  store: new MongoStore({
    url: secrets.db,
    auto_reconnect: true
  })
}));

// setup passport authentication
app.use(passport.initialize());
app.use(passport.session());

// other
app.use(flash());
app.use(cors(corsOptions));

var passportMiddleware = require('./middleware/passport');
passportMiddleware(passport);

// setup view helper
app.use(viewHelper);


keystone.app = app;
// Load your project's Routes

keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

keystone.set('email locals', {
	logo_src: '/images/logo-email.gif',
	logo_width: 194,
	logo_height: 76,
	theme: {
		email_bg: '#f9f9f9',
		link_color: '#2697de',
		buttons: {
			color: '#fff',
			background_color: '#2697de',
			border_color: '#1a7cb7'
		}
	}
});

// Setup replacement rules for emails, to automate the handling of differences
// between development a production.

// Be sure to update this rule to include your site's actual domain, and add
// other rules your email templates require.

keystone.set('email rules', [{
	find: '/images/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/images/' : 'http://localhost:3000/images/'
}, {
	find: '/keystone/',
	replace: (keystone.get('env') == 'production') ? 'http://www.your-server.com/keystone/' : 'http://localhost:3000/keystone/'
}]);

// Load your project's email test routes

keystone.set('email tests', require('./routes/emails'));

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
	'posts': ['posts', 'post-categories'],
	'galleries': 'galleries',
	'enquiries': 'enquiries',
	'users': 'users'
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();

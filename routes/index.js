/**
 * This file is where you define your application routes and controllers.
 * 
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 * 
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 * 
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 * 
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 * 
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);


'use strict';

// middleware
var StripeWebhook = require('stripe-webhook-middleware'),
isAuthenticated = require('../middleware/auth').isAuthenticated,
isUnauthenticated = require('../middleware/auth').isUnauthenticated,
setRender = require('middleware-responder').setRender,
setRedirect = require('middleware-responder').setRedirect,
stripeEvents = require('../middleware/stripe-events'),
secrets = require('../config/secrets');
// controllers
var users = require('../controllers/users-controller'),
main = require('../controllers/main-controller'),
dashboard = require('../controllers/dashboard-controller'),
passwords = require('../controllers/passwords-controller'),
registrations = require('../controllers/registrations-controller'),
sessions = require('../controllers/sessions-controller');

var path = require('path');

var stripeWebhook = new StripeWebhook({
  stripeApiKey: secrets.stripeOptions.apiKey,
  respond: true
});


// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
var routes = {
	views: importRoutes('./views')
};

// Setup Route Bindings
exports = module.exports = function(app, passport) {
	
	// Views
	app.get('/', routes.views.index);
	app.get('/blog/:category?', routes.views.blog);
	app.get('/blog/post/:post', routes.views.post);
	app.get('/gallery', routes.views.gallery);
	app.all('/contact', routes.views.contact);
	
	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
	  // homepage and dashboard

  //commented / to get to keystone

  //app.get('/',
  //  setRedirect({auth: '/dashboard'}),
  //  isUnauthenticated,
  //  setRender('index'),
  //  main.getHome);

  app.get('/login',
    setRedirect({auth: '/dashboard', success: '/dashboard', failure: '/'}),
    isUnauthenticated,
    setRender('login'),
    main.getHome);

  // sessions
  app.post('/login',
    setRedirect({auth: '/dashboard', success: '/dashboard', failure: '/'}),
    isUnauthenticated,
    sessions.postLogin);
  app.get('/logout',
    setRedirect({auth: '/', success: '/'}),
    isAuthenticated,
    sessions.logout);

  // registrations
  app.get('/signup',
    setRedirect({auth: '/dashboard'}),
    isUnauthenticated,
    setRender('signup'),
    registrations.getSignup);
  app.post('/signup',
    setRedirect({auth: '/dashboard', success: '/dashboard', failure: '/signup'}),
    isUnauthenticated,
    registrations.postSignup);

  // forgot password
  app.get('/forgot',
    setRedirect({auth: '/dashboard'}),
    isUnauthenticated,
    setRender('forgot'),
    passwords.getForgotPassword);
  app.post('/forgot',
    setRedirect({auth: '/dashboard', success: '/forgot', failure: '/forgot'}),
    isUnauthenticated,
    passwords.postForgotPassword);

  // reset tokens
  app.get('/reset/:token',
    setRedirect({auth: '/dashboard', failure: '/forgot'}),
    isUnauthenticated,
    setRender('reset'),
    passwords.getToken);
  app.post('/reset/:token',
    setRedirect({auth: '/dashboard', success: '/dashboard', failure: 'back'}),
    isUnauthenticated,
    passwords.postToken);

  app.get('/dashboard',
    setRender(path.join('dashboard','index')),
    setRedirect({auth: '/login'}),
    isAuthenticated,
    dashboard.getDefault);
  app.get('/billing',
    setRender('dashboard/billing'),
    setRedirect({auth: '/'}),
    isAuthenticated,
    dashboard.getBilling);
  app.get('/profile',
    setRender('dashboard/profile'),
    setRedirect({auth: '/'}),
    isAuthenticated,
    dashboard.getProfile);

  // user api stuff
  app.post('/user',
    setRedirect({auth: '/', success: '/profile', failure: '/profile'}),
    isAuthenticated,
    users.postProfile);
  app.post('/user/billing',
    setRedirect({auth: '/', success: '/billing', failure: '/billing'}),
    isAuthenticated,
    users.postBilling);
  app.post('/user/plan',
    setRedirect({auth: '/', success: '/billing', failure: '/billing'}),
    isAuthenticated,
    users.postPlan);
  app.post('/user/password',
    setRedirect({auth: '/', success: '/profile', failure: '/profile'}),
    isAuthenticated,
    passwords.postNewPassword);
  app.post('/user/delete',
    setRedirect({auth: '/', success: '/'}),
    isAuthenticated,
    users.deleteAccount);

  // use this url to receive stripe webhook events
  app.post('/stripe/events',
    stripeWebhook.middleware,
    stripeEvents
  );
};

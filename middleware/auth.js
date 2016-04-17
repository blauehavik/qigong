'use strict';

exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()){
    console.log("isAuthenticated")
    return next();
  }

  res.redirect(req.redirect.auth);
};

exports.isUnauthenticated = function(req, res, next) {
  if (!req.isAuthenticated()){
    console.log("isUNauthenticated")
    return next();
  }

  res.redirect(req.redirect.auth);
};
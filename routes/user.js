const express = require('express');
const router = express.Router();
var csrf = require('csurf');
// const { route } = require('./users');
const passport = require('passport');
var Order = require('../models/Order');
var Cart = require('../models/Cart');

var csrfProtection = csrf();
router.use(csrfProtection);

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/signup', {csrfToken : req.csrfToken(), messages : messages, hasErrors : messages.length > 0});
});

router.post('/signup', passport.authenticate('local-signup' ,{
    failureRedirect : '/user/signup',
    failureFlash : true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/profile',isLoggedIN, function(req, res, next) {
    Order.find({user : req.user}, function(err, orders) {
        if(err) {
            return res.write('Error');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile',{orders : orders });
    });
});

router.get('/logout', function(req, res, next) {
    req.logout();   //method provided by passport
    res.redirect('/');
})

router.get('/login', function(req, res, next) {
    var messages = req.flash('error');
    res.render('user/login', {csrfToken : req.csrfToken(), messages : messages, hasErrors : messages.length > 0});
});

router.post('/login', passport.authenticate('local-login', {
    failureRedirect : '/user/login',
    failureFlash : true
}), function(req, res, next) {
    if(req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    } 
});

module.exports = router;

function isLoggedIN(req, res, next) {
    if(req.isAuthenticated()) {   //method provided by passport
        return next();  //this means continue
    }
    res.redirect('/');
}
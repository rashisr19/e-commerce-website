const express = require('express');
const router = express.Router();
var Product = require('../models/product');
var Cart = require('../models/Cart');
var Order = require('../models/Order');

// require('../config/passport');

router.get('/', (req, res) => {
    var successMsg = req.flash('success')[0];
    var products = Product.find(function(err, docs) {
        var productChunks = [];
        var chunkSize = 1;
        for(var i=0;i<docs.length;i += chunkSize) {
            productChunks.push(docs.slice(i, i+chunkSize));
        }
        res.render('shop/welcome', {products : productChunks, successMsg : successMsg, noMessages : !successMsg});
    });
});

router.get('/add-to-cart/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});

    Product.findById(productId, function(err, product) {
        if(err) {
            return res.redirect('/');
        }
        cart.add(product, productId);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    })
});

router.get('/reduce/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.reduceByOne(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    cart.removeItem(productId);
    req.session.cart = cart;
    res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next) {
    if(!req.session.cart) {
        return res.render('shop/shopping-cart', {products : null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products : cart.generateArray(), totalPrice : cart.totalPrice});
});

router.get('/checkout',isLoggedIN, function(req,res,next) {
    if(!req.session.cart) {
        return res.redirect('shop/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var errMsg = req.flash('error')[0];
    res.render('shop/checkout', {total: cart.totalPrice, errMsg : errMsg, noErrors : !errMsg});
});

router.post('/checkout',isLoggedIN, function(req, res, next) {
    if(!req.session.cart) {
        return res.redirect('shop/shopping-cart');
    }
    var cart = new Cart(req.session.cart);
    var stripe = require('stripe') (
        "sk_test_51H3k03JHonsU9cmp4rLV860CWC3akt3Ui0zcW7LhXl39L3Renfrt3nmtMzj81zJwbWUxdnGhdOCDZ7jpLvPtJYB6005vpWiGPI"
    );
    stripe.charges.create({
        amount : cart.totalPrice * 64.2,
        currency : "inr",
        source : req.body.stripeToken,
        description : "Test charge"
    }, function(err, charge) {
        // if(err) {
        //     req.flash('error', message);
        //     res.redirect('/checkout');
        // }
        var order = new Order({
            user : req.user,
            cart : cart,
            address : req.body.address,
            name : req.body.name
        });
        order.save(function(err, result) {
            req.flash('success', 'Payment Successful. Order Placed.')
            req.session.cart = null;
            res.redirect('/');
        });
    })
})

module.exports = router;

function isLoggedIN(req, res, next) {
    if(req.isAuthenticated()) {   //method provided by passport
        return next();  //this means continue
    }
    req.session.oldUrl = req.url;
    res.redirect('/user/login');
}
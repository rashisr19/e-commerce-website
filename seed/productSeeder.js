var Product = require('../models/product');
const mongoose = require('mongoose');

//DB config
const db = require('../config/keys').MongoURI;

//Connect to MongoDB
mongoose.connect(db, { useNewUrlParser : true, useUnifiedTopology: true});

var products = [
    new Product({
        imagePath : '/images/image6.png',
        title : 'Way Kambas Mini Ebony',
        description : "MATOA Way Kambas - This wood is chosen to represent the Sumatran Rhino's skin which is designed with an overlap effect on its strap to represent Rhino's skin.",
        price : 11999
    }),
    new Product({
        imagePath : '/images/image8.png',
        title : 'Fossil',
        description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        price : 14999
    }),
    new Product({
        imagePath : '/images/men.png',
        title : 'Titan',
        description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        price : 13999
    }),
    new Product({
        imagePath : '/images/tissot.png',
        title : 'Tissot',
        description : "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        price : 12999
    })
];
var done=0;
for(var i=0;i<products.length;i++){
    products[i].save(function(err,result){
        done++;
        if(done == products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
const express = require('express');
const app = express();
const path = require("path");
var swig = require('swig');
var cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');
const Handlebars = require('handlebars');
const session = require('express-session');
var expresshbs = require('express-handlebars');
const flash = require('connect-flash');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
var validator = require('express-validator');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

//DB config
const db = require('./config/keys').MongoURI;

//Connect to MongoDB
mongoose.connect(db, { useNewUrlParser : true, useUnifiedTopology: true})
.then(() => console.log('Connected to MongoDB..'))
.catch(err => console.log(err));

require('./config/passport');

//EJS
// app.engine('handlebars', expresshbs({
//     handlebars: allowInsecurePrototypeAccess(Handlebars)
// }));
app.engine('.hbs', expresshbs({ handlebars: allowInsecurePrototypeAccess(Handlebars), defaultLayout : 'layout', extname : '.hbs'}));
app.set('view engine', '.hbs');

//BODY PARSER
app.use(express.json()) 
app.use(express.urlencoded({ extended : false }));
// app.use(validator());
app.use(cookieParser());
app.use(session({
    secret:'mysecret',
    resave : false, 
    saveUninitialized : false,
    store : new MongoStore({ mongooseConnection : mongoose.connection }),
    cookie : { maxAge : 180 * 60 * 1000}
}));
app.use(flash());  //ordering does matter
// //GLOBAL VARS
// app.use((req,res,next) => {
//     res.locals.success_msg = req.flash('success_msg');
//     res.locals.error_msg = req.flash('error_msg');
//     res.locals.error = req.flash('error');
//     next();
// });
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname+'/public'));

app.use(function(req,res,next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
})

app.use('/user', require('./routes/user'));
app.use('/', require('./routes/index'));

//view engine 
// app.set('views', path.join(__dirname, 'views'));
// app.engine('html', swig.renderFile);
// app.set('view engine', 'html');

const port = 3000;
app.listen(port, console.log(`Connected to port ${port}...`));

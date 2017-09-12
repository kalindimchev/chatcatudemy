'use strict';

const express = require('express');
const app = express();
const chatCat = require('./app');
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(chatCat.session);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'), () => {
    console.log(app.get('port'));
    console.log(process.env.PORT);
    console.log('ChatCAT Running on Port: ' + app.get('port'));
})

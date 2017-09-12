'use strict';
const helper = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = () => {
    let routes = {
        'get': {
            '/': (req, res, next) => {
                res.render('login', {title: 'title hoi'});
            },
            '/login': (req, res, next) => {
                res.render('login', {title: 'title hoi'});
            },
            '/rooms': [helper.isAuthenticated, (req, res, next) => {
                res.render('rooms', {
                    user: req.user,
                    host: config.host
                });               
            }],
            '/chat/:id': [helper.isAuthenticated, (req, res, next) => {
                let getRoom = helper.findRoomById(req.app.locals.chatrooms, req.params.id);
                console.log('-------------------- req.app.locals.chatrooms --------------------')
                console.log(req.app.locals.chatrooms);
                console.log(req.params.id);
                console.log(getRoom);
                console.log(getRoom.room);
                console.log(getRoom.roomID);
                if(getRoom === undefined) {
                    return next();
                } else {
                    res.render('chatroom', {
                        user: req.user,
                        host: config.host,
                        room: getRoom.room,
                        roomID: getRoom.roomID
                    });
                }

            }],
            '/auth/facebook': passport.authenticate('facebook'),
            '/auth/facebook/callback': passport.authenticate('facebook', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/auth/twitter': passport.authenticate('twitter'),
            '/auth/twitter/callback': passport.authenticate('twitter', {
                successRedirect: '/rooms',
                failureRedirect: '/'
            }),
            '/logout':  (req, res, next) => {
                req.logout();
                res.redirect('/');
            }

        },
        'post': {
        },
        'NA': (req, res, next) => {
            res.status(404).sendFile(process.cwd() + '/views/404.htm'); //process.cwd() = server.js folder
            console.log('nema page');
        }      
    }

    return helper.route(routes);
}

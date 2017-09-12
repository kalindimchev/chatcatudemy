'use strict';

const router = require('express').Router();
const db = require('../db');
const crypto = require('crypto');

let _registerRoutes = (routes, method) => {
    for(let key in routes) {
        if(typeof routes[key] === 'object' && routes[key] != null && !(routes[key] instanceof Array)) {
            _registerRoutes(routes[key], key);
        } else {
            if(method === 'get') {
                router.get(key, routes[key]);
            } else if(method === 'post') {
                router.post(key, routes[key]);
            } else {
                router.use(routes[key]);
            }
        }
    }
}

let route = (routes) => {
    _registerRoutes(routes);
    return router;
}

//Find a single user based on a key
let findOne = profileID => {
    return db.userModel.findOne({
        'profileId': profileID
    });
}

//Create  new user
let createNewUser = profile => {
    return new Promise((resolve, reject) => {
        let newChatUser = new db.userModel({
            profileId: profile.id,
            fullName: profile.displayName,
            profilePic: profile.photos[0].value || ''
        }); 

        newChatUser.save(error => {
            if (error) {
                reject(error);
            } else {
                resolve(newChatUser);
            }
        });
    });
}

let findById = id => {
    return new Promise((resolve, reject) => {
        db.userModel.findById(id, (error, user) => {
            if (error) {
                reject(error);
            } else {
                resolve(user);
            }
        }); 
    });
}

//Check if the user is authenticated
let isAuthenticated = (req, rex, next) => {
    if (req.isAuthenticated) {
        next();
    } else {
        res.redirect('/');
    }
}

//Find room by a given name
let findRoomByName = (allrooms, room) => {
    let findRoom = allrooms.findIndex((element, index, array) => {
        if(element.room === room) {
            return true;
        } else {
            return false;
        }
    });

    return findRoom > -1 ? true : false;
}

let randomHex = () => {
    return crypto.randomBytes(24).toString('hex');
}

let findRoomById = (allrooms, roomID) => {
    let findRoom = allrooms.find((element, index, array) => {
        if(element.roomID === roomID) {
            return true;
        } else {
            return false;
        }
    });

    return findRoom;
}

let addUserToRoom = (allrooms, data, socket) => {
    let getRoom = findRoomById(allrooms, data.roomID);
    if(getRoom !== undefined) {
        // Get the active user Id (ObjectID as used in session)
        let userID = socket.request.session.passport.user;
        
        //Check if the user already exists in the chatroom
        let checkUser = getRoom.users.findIndex((element, index, array) => {
            if(element.userID === userID) {
                return true;
            } else {
                return false
            }
        });

        // First remove the user
        if(checkUser > -1) {
            getRoom.users.splice(checkUser, 1);
        }

        getRoom.users.push({
            socketID: socket.id,
            userID,
            user: data.user,
            userPic: data.userPic
        });

        //Join the room channel
        socket.join(data.roomID);

        //Return the updated room object

        return getRoom;              
    }
}

//Find and remove the user when a socket disconnects
let removeUserFromRoom = (allrooms, socket) => {
    console.log('----------- REMOVE USER FROM ROOM -----------');
    console.log(allrooms);
    for (let room of allrooms) {
        console.log('----------- REMOVE USERS -----------');
        console.log(room);
        console.log(room.users);
        console.log(socket.id);
        console.log('----------- END REMOVE USERS -----------');
        let findUser = room.users.findIndex((element, index, array) => {
            if (element.socketID === socket.id) {
                return true;
            } else {
                return false;
            }
            // return element.socketID === socket.id ? true : false;
        });

        console.log(findUser);
        console.log(room);

        if (findUser > -1) {
            socket.leave(room.roomID);
            room.users.splice(findUser, 1);
            console.log('----------- END REMOVE USER FROM ROOM -----------');

            return room;
        }
             
    }
    console.log('----------- END REMOVE USER FROM ROOM -----------');

}


module.exports = {
    route,
    findOne,
    createNewUser,
    findById,
    isAuthenticated,
    findRoomByName,
    randomHex, 
    findRoomById,
    addUserToRoom,
    removeUserFromRoom
}


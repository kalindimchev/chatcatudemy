'use strict';

const helper = require('../helpers');

module.exports = (io, app) => {
    let allRooms = app.locals.chatrooms;

    io.of('/roomslist').on('connection', socket => {
        console.log('Socket.io connected to client -> /roomslist');
        
        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allRooms));
        });

        socket.on('createNewRoom', newRoomInput => {
            if(!helper.findRoomByName(allRooms, newRoomInput)){
                allRooms.push({
                    room: newRoomInput,
                    roomID: helper.randomHex(),
                    users: []
                });

                //Emit an updated list to the creator
                socket.emit('chatRoomsList', JSON.stringify(allRooms));

                //Emit an updated list to everyone connected to the rooms page
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allRooms));         
            }            
        });
        
    });

    io.of('/chatter').on('connection', socket => {
        console.log('Socket.io connected to client -> /chatter');

        socket.on('join', data => {
            console.log('-------------------- SOCKET --------------------');
            console.log(socket.id);
            console.log('-------------------- END SOCKET --------------------');

            let usersList = helper.addUserToRoom(allRooms, data, socket);

            //Update the list of active users as shown on the chatroom page
            console.log(usersList);
            console.log(data.roomID);
            socket.broadcast.to(data.roomID).emit('updateUsersList', JSON.stringify(usersList.users));
            socket.emit('updateUsersList', JSON.stringify(usersList.users));        
        });

        socket.on('disconnect', () => {
            //Find the room, to which the socket is connected to and purge the user


                    
            let room = helper.removeUserFromRoom(allRooms, socket);
            console.log('RAZLOGNAHME SEEEEEEEEEEEEEEEEEE');
            console.log(room);
            socket.broadcast.to(room.roomID).emit('updateUsersList', JSON.stringify(room.users));

            //TODO: BUG          
        });

        socket.on('newMessage', data => {
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
        });




    });
}

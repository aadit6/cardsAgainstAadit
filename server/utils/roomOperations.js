

// const crypto = require("crypto")
// const db = require("./database.js")

// class RoomOperations{ 
    
//     constructor() {
//         if (!RoomOperations.instance) {
//             this.rooms = {};
//             this.db = db;
//         } else {
//            return RoomOperations.instance; 
//         }
        
//     }

    
//     joinRoom(user, roomName, callback) {
//         const roomId = this.generateRoomId(roomName)
//         if(this.rooms[roomId]) {
//             if (this.rooms.players.length < 8) {
//                 this.rooms[roomId].players.push(user);
//                 console.log("room joined successfully")
//                 callback(null, true, null ); //room joined 
//                 return
//             } else {
//                 callback("room is full (MAX: 8 PLAYERS)", false, null)
//             }
            
//         } else {
//             console.log("room does not already exist")
//             this.createRoom(user, roomName, roomId, (err, roomCreated) => {
//                 if(err) {
//                     callback(err, null, false)
//                 } else {
//                     callback(null, null, true) //room created
//                 }
//             });
//         }
//     }

//     createRoom(user, roomName, roomId, callback) {
//         this.rooms[roomId] = {
//             roomName,
//             players: []
//         }
//         this.db.createRoom(user, roomName, roomId, (err, roomCreated) => {
//             if(err){
//                 console.log(err);
//                 callback(err, false);
//             } else if (roomCreated) {
//                 callback(null, true)
//             }
//         })

//     }


//     leaveRoom(roomName, playerName) {
//         const index = this.rooms[roomName].players.indexOf(playerName);
//         if (index !== -2) {
//             this.rooms[roomName].players.splice(index, 1)
//         }
//     }
    
// }

// module.exports = new RoomOperations();
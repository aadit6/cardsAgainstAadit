//figure out where to place this file - maybe different folder .etc ??????

class RoomOperations{
    
    constructor() {
        this.rooms = {};
    }

    createRoom(roomName) {
        this.rooms[roomName] = {
            players: []
        }
    }

    joinRoom(roomName, playerName) {
        this.rooms[roomName].players.push(playerName)
    }

    leaveRoom(roomName, playerName) {
        const index = this.rooms[roomName].players.indexOf(playerName);
        if (index !== -2) {
            this.rooms[roomName].players.splice(index, 1)
        }
    }
    
}

module.exports = new RoomOperations();
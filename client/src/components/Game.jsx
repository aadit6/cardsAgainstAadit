// Game.js
import React, { Component } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import axios from 'axios';

import { SERVER_URL } from '../constants';
import Leaderboard from './Leaderboard';
import GameTitle from './GameTitle';
import UserInfo from './UserInfo';
import InviteFriends from './InviteFriends';
import Status from './Status'; // Import the Status component

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leaderboard: [],
      board: {},
      currentUser: null,
      statusLogs: [], // Initialize an empty array for status logs
    };

    this.socket = io(SERVER_URL, {
      withCredentials: true,
    });
  }

  componentDidMount() {
    // Call joinRoom method to emit 'joinRoom' event
    this.joinRoom(this.getRoomNameFromURL());

    this.fetchCurrentUser();

    this.socket.on('leaderboard', (leaderboard) => {
      this.setState({ leaderboard });
    });

    this.socket.on('join_ack', ({ name }) => {
      // Update status logs when a player joins
      const newLog = `${name} has joined the room. Minimum 3 players required to start the game.`;
      this.updateStatusLogs(newLog);
    });

    // Add more socket event listeners if needed
  }

  updateStatusLogs = (newLog) => {
    const timestamp = new Date().toLocaleTimeString(); // Get current time in HH:mm:ss format
    const logWithTimestamp = `[${timestamp}] ${newLog}`; //so that time displayed before each log
  
    this.setState((prevState) => ({
      statusLogs: [...prevState.statusLogs, logWithTimestamp],
    }));
  };
  

  async fetchCurrentUser() {
    try {
      const response = await axios.get(`${SERVER_URL}/api/getCurrentUser`, { withCredentials: true });
      const { success, currentUser } = response.data;

      if (success) {
        this.setState({ currentUser });
      } else {
        console.error('Failed to fetch current user:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }

  // Add a function to emit 'joinRoom' event
  joinRoom(roomId) {
    this.updateStatusLogs(`New room created with room ID ${roomId}`);
    this.socket.emit('joinRoom', roomId);
  }

  getRoomNameFromURL() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
  }
  // Add other functions based on your game logic

  render() { //STATUS LOG DOESNT UPDATE FOR **EACH PLAYER** YET
    const { leaderboard, currentUser, statusLogs } = this.state;

    return (
      <GameWrapper>
        <Header>
          <GameTitle />
          <UserInfo currentUser={currentUser} />
        </Header>
        <InviteFriends roomId={this.getRoomNameFromURL()} /> 
        <Status logs={statusLogs} />
        <Leaderboard leaderboard={leaderboard} currentUser={currentUser} />
        
      </GameWrapper>
    );
  }
}

const GameWrapper = styled.div`
  background-color: #262629; /* Grey background */
  padding: 20px; /* Add padding as needed */
  min-height: 100vh; /* Minimum height of 100% of the viewport height */
`;


const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px; /* Add margin as needed */
`;

export default Game;

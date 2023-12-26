// Import necessary modules
import React, { Component } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import axios from 'axios';

import { SERVER_URL } from '../constants';

// Import additional components
import Leaderboard from './Leaderboard';
import GameTitle from './GameTitle';
import UserInfo from './UserInfo';
import InviteFriends from './InviteFriends';

// Define a theme object with an empty object for now

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leaderboard: [],
      board: {},
      currentUser: null,
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
      console.log("this is leaderboard: ", leaderboard);
      this.setState({ leaderboard });
    });

    this.socket.on('join_ack', ({ id, name }) => {
      console.log(`Joined room with ID: ${id} and username: ${name}`);
    });
    // Add more socket event listeners if needed
  }

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
    console.log("joining room");
    this.socket.emit('joinRoom', roomId);
  }

  getRoomNameFromURL() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
  }
  // Add other functions based on your game logic

  render() {
    const { leaderboard, currentUser } = this.state;

    return (
      <GameWrapper>
        <Header>
          {/* Title component */}
          <GameTitle />
          {/* User info component */}
          <UserInfo currentUser={currentUser} />
        </Header>
        {/* Invite friends component */}
        <InviteFriends roomId={this.getRoomNameFromURL()} />
        {/* Leaderboard component */}
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

import React, { Component } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import Leaderboard from './Leaderboard'; // Import the Leaderboard component
import axios from "axios";

import { SERVER_URL } from '../constants';

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
      const response = await axios.get(`${SERVER_URL}/api/getCurrentUser`, {withCredentials: true}); //calling API. withcredentials: true ensures cookies included in header so can get value of user in session
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
        {/* Pass the current user to the Leaderboard component */}
        <Leaderboard leaderboard={leaderboard} currentUser={currentUser} />
      </GameWrapper>
    );
  }
}

const GameWrapper = styled.div`
  /* Add your styling for the game wrapper */
`;

export default Game;

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
import Status from './Status';
import StartButton from './StartButton';
import WhiteCard from './WhiteCard';
import BlackCard from './BlackCard';

class Game extends Component {
  constructor(props) {
    super(props);

    this.state = {
      leaderboard: [],
      board: {},
      currentUser: null,
      statusLogs: [],
      isStartButtonDisabled: true,
      gameStarted: false,
      dealtCards: [],
    };

    this.socket = io(SERVER_URL, {
      withCredentials: true,
    });
  }

  componentDidMount() {
    this.joinRoom(this.getRoomNameFromURL());

    this.fetchCurrentUser();

    this.socket.on('leaderboard', (leaderboard) => {
      this.setState({ leaderboard });
      this.handlePlayerCountChange(leaderboard.length);
    });

    this.socket.on('join_ack', ({ name }) => {
      const newLog = `${name} has joined the room. Minimum 3 players required to start the game.`;
      this.updateStatusLogs(newLog);
    });

    this.socket.on('playerCountChanged', (playerCount) => {
      this.handlePlayerCountChange(playerCount);
    });

    this.socket.on('gameStarted', () => {
      this.handleGameStart();
    });
  }

  handlePlayerCountChange = (playerCount) => {
    this.setState({
      isStartButtonDisabled: playerCount < 3,
    });
  };

  handleGameStart = () => {
    this.setState({
      gameStarted: true,
    });

    const dealtCards = Array.from({ length: 8 }, (_, index) => `Card ${index + 1}`);
    this.setState({
      dealtCards,
    });
  };

  handleStartButtonClick = (roomid) => {
    this.socket.emit('startGame', roomid);
  };

  updateStatusLogs = (newLog) => {
    const timestamp = new Date().toLocaleTimeString();
    const logWithTimestamp = `[${timestamp}] ${newLog}`;

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

  joinRoom(roomId) {
    this.updateStatusLogs(`New room created with room ID ${roomId}`);
    this.socket.emit('joinRoom', roomId);
  }

  getRoomNameFromURL() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
  }

  render() {
    const { leaderboard, currentUser, statusLogs, isStartButtonDisabled, gameStarted, dealtCards } = this.state;
    const roomid = this.getRoomNameFromURL();

    return (
      <GameWrapper>
        <Header>
          <GameTitle />
          <UserInfo currentUser={currentUser} />
        </Header>
        <InviteFriends roomId={roomid} />
        <Status logs={statusLogs} roomid={roomid} />
        <Leaderboard leaderboard={leaderboard} currentUser={currentUser} />
        {!gameStarted && (
          <StartButton onClick={() => this.handleStartButtonClick(roomid)} disabled={isStartButtonDisabled} />
        )}
        {gameStarted && (
          <div>
            <DealtCardsContainer>
              {dealtCards.map((card, index) => (
                <WhiteCard key={index} text={card} />
              ))}
            </DealtCardsContainer>
            <BlackCard text="This is a black card." />
          </div>
        )}
      </GameWrapper>
    );
  }
}

const GameWrapper = styled.div`
  background-color: #262629;
  padding: 0px;
  margin: 0px;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DealtCardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

export default Game;

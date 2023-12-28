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
import Board from './Board'; 
import Hand from './Hand'; 

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
      let newLog
      if (this.state.leaderboard.length < 2) {
        newLog = `${name} has joined the room. ${2 - (this.state.leaderboard.length)} more player(s) required to start the game.`;
      } else {
        newLog = `${name} has joined the room.`;
      }
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

    this.updateStatusLogs(`New game started with ${this.state.leaderboard.length} players`);
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
        <GameContent>
          <LeaderboardContainer>
            <Leaderboard leaderboard={leaderboard} currentUser={currentUser} />
          </LeaderboardContainer>
          <Container>
            {!gameStarted && (
              <StartButton onClick={() => this.handleStartButtonClick(roomid)} disabled={isStartButtonDisabled} />
            )}
            {gameStarted && (
              <div>
                <ContentContainer>
                  <ContentTitle>Board</ContentTitle>
                  <Board>
                    <BlackCard text="This is a black card." />
                  </Board>
                </ContentContainer>
                <ContentContainer>
                  <ContentTitle>Hand</ContentTitle>
                  <Hand>
                    {dealtCards.map((card, index) => (
                      <WhiteCard key={index} text={card} />
                    ))}
                  </Hand>
                </ContentContainer>
              </div>
            )}
          </Container>
        </GameContent>
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

const GameContent = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 20px;
`;

const LeaderboardContainer = styled.div`
  width: 200px;
  margin-right: 20px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 0px;
`;

const ContentContainer = styled.div`
  background-color: #333;
  padding-bottom: 0px;
  border-radius: 8px;
  margin-left: 80px;
  margin-top: 15px;
  max-width: 100%;
`;

const ContentTitle = styled.h2`
  color: #fff;
  margin-bottom: 10px;
`;


export default Game;
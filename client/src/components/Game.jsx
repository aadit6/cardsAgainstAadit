// Game.jsx
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
      board: {
        whiteDeck: [],
        blackDeck: [],
        playedBlackCard: [], 
        playedWhites: [],
        czar: 0,
        selected: false,
        picking: false,
        statusLog: [],
      },
      currentUser: null,
      isStartButtonDisabled: true,
      gameStarted: false,
      dealtCards: [],
      updateUser: [],
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

    this.socket.on('playerCountChanged', (playerCount) => {
      this.handlePlayerCountChange(playerCount);
    });

    this.socket.on('gameStarted', () => {
      this.handleGameStart();

    });

    // Listen for the 'hand' event to update dealtCards
    this.socket.on('hand', (handData) => {
      console.log('Received hand:', handData.hand);
      this.setState({
        dealtCards: handData.hand,
      });
    });

    this.socket.on('board', (newBoard) => {
      this.setState({
        board: newBoard.data,
      });

    });

    this.socket.on("updateUser", (updateUser) => {
      this.state.updateUser.push(updateUser.data)

    })
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

  };

  handleStartButtonClick = (roomid) => {
    this.socket.emit('startGame', roomid);
  };

  handlePlayCard = (text, index, roomid) => {
    this.socket.emit("playCard", text, index, roomid)
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

  joinRoom(roomId) {
    this.socket.emit('joinRoom', roomId);

    // Listen for 'hand' event to receive the dealt hand
    this.socket.on('hand', (handData) => {
      this.setState({
        dealtCards: handData.hand,
      });
    });
  }

  getRoomNameFromURL() {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
  }

  render() {
    const { leaderboard, currentUser, isStartButtonDisabled, gameStarted, dealtCards, board, updateUser } = this.state;
    const roomid = this.getRoomNameFromURL();



    return (
      <GameWrapper>
        <Header>
          <GameTitle />
          <UserInfo currentUser={currentUser} />
        </Header>
        <InviteFriends roomId={roomid} />
        <Status logs={board.statusLog} roomid={roomid} />
        <GameContent>
          <LeaderboardContainer>
            <Leaderboard leaderboard={leaderboard} currentUser={currentUser} />
          </LeaderboardContainer>
          <Container>
            {!gameStarted && (
              <StartButton onClick={() => this.handleStartButtonClick(roomid)} disabled={isStartButtonDisabled} numPlayers={this.state.leaderboard.length} />
              
            )}
            {gameStarted && (
              <div>
                <ContentContainer>
                  <ContentTitle>Board</ContentTitle>
                  <Board>
                    <BlackCard text={board.playedBlackCard[0].text} />
                    {board.playedWhites.map((card, index) => (
                      <WhiteCard key={index} text={updateUser[index]} onClick={null}/>
                    ))}

                  </Board>
                </ContentContainer>
                <ContentContainer>
                  <ContentTitle>Hand</ContentTitle>
                  <Hand>
                    {dealtCards.map((card, index) => (
                      <WhiteCard key={index} text={card.text} onClick={() => this.handlePlayCard(card.text, index, roomid)}/>
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

//NOTE: currently there isnt a username attached to every single white card on board. Right now, if 3 different users 
//play a card then will just have all 3 names as third user. fix this

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
  width: 100%;
  position: relative;
  overflow: hidden;
`;

const ContentTitle = styled.h2`
  color: #fff;
  margin-bottom: 10px;
`;

export default Game;

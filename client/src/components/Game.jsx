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
import GameOverScreen from "./GameOverScreen"

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
        czar: null,
        selected: false,
        picking: false,
        statusLog: [],
      },
      currentUser: null,
      isStartButtonDisabled: true,
      gameStarted: false,
      dealtCards: [],
      winningPlayer: null,
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

    this.socket.on("gameOver", (data) => {
      this.setState({
        winningPlayer: data.winner,
      })

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
    console.clear();
  };

  handlePlayCard = (index, roomid) => {
    this.socket.emit("playCard", index, roomid)
  }

  handleSelectWinner = (roomid, winningUser) => {
    this.socket.emit("selectWinner", roomid, winningUser)
  }

  handleAdvanceRound = (roomid) => {
    this.socket.emit("advanceRound",roomid )
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
    const pathArray = window.location.pathname.split('/')
    return pathArray[pathArray.length - 1]
  }

  render() {
    const { leaderboard, currentUser, isStartButtonDisabled, gameStarted, dealtCards, board, winningPlayer } = this.state;
    const roomid = this.getRoomNameFromURL();

    const currentUserStatusObject = leaderboard.find(p => p.name === currentUser);
    const currentUserStatus = currentUserStatusObject ? currentUserStatusObject.status : '';

    console.log("currentUserStatus is: ", currentUserStatus);

    console.log("playedwhite: ", board.playedWhites);
    




    return (
      <GameWrapper>
        <Header>
          <GameTitle />
          <UserInfo currentUser={currentUser} />
        </Header>
        <InviteFriends roomId={roomid} />
        <Status logs={board.statusLog} roomid={roomid} />
        <GameContent>
        {winningPlayer ? (
          <GameOverScreen
            winningPlayer={winningPlayer}
            currentUser={currentUser}
            onNewGame={() => this.handleStartButtonClick(roomid)} // Implement new game action
            onBack={() => console.log('Back button clicked')} // Implement back action
          />
        ) : (
          <>
          <LeaderboardContainer>
            <Leaderboard leaderboard={leaderboard} currentUser={currentUser} czar={board.czar} />
          </LeaderboardContainer>
          <Container>
            {(!gameStarted  || board.selected) && (
              <StartButton 
              onClick={!gameStarted ? () => this.handleStartButtonClick(roomid) : () => this.handleAdvanceRound(roomid)} 
              disabled={isStartButtonDisabled} 
              numPlayers={this.state.leaderboard.length}
              buttonText={!gameStarted ? "Start Game" : "Advance Round"} />
              
            )}
            {gameStarted && (
              <div>
                <ContentContainer>
                  <ContentTitle>Board</ContentTitle>
                  <Board>
                  <BlackCard text={board.playedBlackCard[0].text} pick={board.playedBlackCard[0].pick} />
                  {board.playedWhites.map((playedWhite, index) => (
                  <WhiteCard
                    key={index}
                    text={
                      (board.selected || board.picking)
                        ? playedWhite.cards.map(card => card.text).join('\n\n')
                        : playedWhite.playerName 
                    }
                    onClick={board.picking && currentUser === board.czar ? () => this.handleSelectWinner(roomid, playedWhite.playerName) : null}
                    hoverEffect={board.picking && currentUser === board.czar && !board.selected} // only hover for czar when picking winner
                    selected={board.selected && playedWhite.winner} // selected prop for when selected by czar
                    selectedPlayer={board.selected ? playedWhite.playerName : null} //so all playernames displayed at bottom when selection complete
                  />
                ))}

                </Board>
                </ContentContainer>
                <ContentContainer>
                  <ContentTitle>Hand</ContentTitle>
                  <Hand>
                    {dealtCards.map((card, index) => (
                      <WhiteCard 
                      key={index}
                      text={card.text} 
                      onClick={() => this.handlePlayCard(index, roomid)}
                      disabled={currentUserStatus === "played"}
                      hoverEffect={true}/>
                    ))}
                  </Hand>
                </ContentContainer>
              </div>
            )}
          </Container>
          </>
        )}
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
  min-height: 100%
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
  width: 95%;
  position: relative;
  overflow: hidden;
`;

const ContentTitle = styled.h2`
  color: #fff;
  margin-bottom: 10px;
`;

export default Game;

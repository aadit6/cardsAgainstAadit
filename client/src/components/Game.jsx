import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

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
import GameOverScreen from './GameOverScreen';

const Game = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [board, setBoard] = useState({
    whiteDeck: [],
    blackDeck: [],
    playedBlackCard: [],
    playedWhites: [],
    czar: null,
    selected: false,
    picking: false,
    statusLog: [],
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [isStartButtonDisabled, setIsStartButtonDisabled] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [dealtCards, setDealtCards] = useState([]);
  const [winningPlayer, setWinningPlayer] = useState(null);

  const [socket, setSocket] = useState(null);
  const [searchParams] = useSearchParams();
  const pointsToWin = searchParams.get('pointsToWin');

  console.log("pointstowin: ", pointsToWin)

  const getRoomNameFromURL = () => {
    const pathArray = window.location.pathname.split('/');
    return pathArray[pathArray.length - 1];
  };

  const handleStartButtonClick = (roomid) => {
    socket.emit('startGame', roomid);
    console.clear();
  };

  const handlePlayCard = (index, roomid) => {
    socket.emit('playCard', index, roomid);
  };

  const handleSelectWinner = (roomid, winningUser) => {
    socket.emit('selectWinner', roomid, winningUser);
  };

  const handleAdvanceRound = (roomid) => {
    socket.emit('advanceRound', roomid);
  };

  useEffect(() => {
    const initSocket = () => {
      const newSocket = io(SERVER_URL, {
        withCredentials: true,
      });
      setSocket(newSocket);
      return newSocket;
    };
  
    const handlePlayerCountChange = (playerCount) => {
      setIsStartButtonDisabled(playerCount < 3);
    };
  
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`${SERVER_URL}/api/getCurrentUser`, { withCredentials: true });
        const { success, currentUser } = response.data;
  
        if (success) {
          setCurrentUser(currentUser);
        } else {
          console.error('Failed to fetch current user:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
  
    const joinRoom = (roomId, pointsToWin) => {
      socket.emit('joinRoom', roomId, pointsToWin);
  
      // Listen for 'hand' event to receive the dealt hand
      socket.on('hand', (handData) => {
        setDealtCards(handData.hand);
      });
    };
  
    const handleLeaderboardUpdate = (leaderboard) => {
      setLeaderboard(leaderboard);
      handlePlayerCountChange(leaderboard.length);
    };
  
    const handleGameStarted = () => {
      setGameStarted(true);
    };
  
    const handleHandUpdate = (handData) => {
      console.log('Received hand:', handData.hand);
      setDealtCards(handData.hand);
    };
  
    const handleBoardUpdate = (newBoard) => {
      setBoard(newBoard.data);
    };
  
    const handleGameOver = (data) => {
      setWinningPlayer(data.winner);
      setGameStarted(false);
    };
  
    // ComponentDidMount equivalent
    const socket = initSocket();
  
    joinRoom(getRoomNameFromURL(), pointsToWin);
    fetchCurrentUser();
  
    socket.on('leaderboard', handleLeaderboardUpdate);
    socket.on('playerCountChanged', handlePlayerCountChange);
    socket.on('gameStarted', handleGameStarted);
    socket.on('hand', handleHandUpdate);
    socket.on('board', handleBoardUpdate);
    socket.on('gameOver', handleGameOver);
  
    // ComponentWillUnmount equivalent
    return () => {
      socket.disconnect();
    };
  }, []); // Empty dependency array to run only once when the component mounts
  

  const currentUserStatusObject = leaderboard.find((p) => p.name === currentUser);
  const currentUserStatus = currentUserStatusObject ? currentUserStatusObject.status : '';


  return (
    <GameWrapper>
      <Header>
        <GameTitle />
        <UserInfo currentUser={currentUser} />
      </Header>
      <InviteFriends roomId={getRoomNameFromURL()} />
      <Status logs={board.statusLog} roomid={getRoomNameFromURL()} />
      <GameContent>
        {winningPlayer ? (
          <GameOverScreen
            winningPlayer={winningPlayer}
            currentUser={currentUser}
            onNewGame={() => handleStartButtonClick(getRoomNameFromURL())} // Implement new game action
            onBack={() => console.log('Back button clicked')} // Implement back action
          />
        ) : (
          <>
            <LeaderboardContainer>
              <Leaderboard leaderboard={leaderboard} currentUser={currentUser} czar={board.czar} />
            </LeaderboardContainer>
            <Container>
              {(!gameStarted || (board.selected && currentUser === board.czar)) && (
                <StartButton
                  onClick={!gameStarted ? () => handleStartButtonClick(getRoomNameFromURL()) : () => handleAdvanceRound(getRoomNameFromURL())}
                  disabled={isStartButtonDisabled}
                  numPlayers={leaderboard.length}
                  buttonText={!gameStarted ? "Start Game" : "Advance Round"}
                />
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
                          text={(board.selected || board.picking) ? playedWhite.cards.map(card => card.text).join('\n\n') : playedWhite.playerName}
                          onClick={board.picking && currentUser === board.czar ? () => handleSelectWinner(getRoomNameFromURL(), playedWhite.playerName) : null}
                          hoverEffect={board.picking && currentUser === board.czar && !board.selected}
                          selected={board.selected && playedWhite.winner}
                          selectedPlayer={board.selected ? playedWhite.playerName : null}
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
                          onClick={() => handlePlayCard(index, getRoomNameFromURL())}
                          disabled={currentUserStatus === "played"}
                          hoverEffect={true}
                        />
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
};

// Remaining styled components...


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

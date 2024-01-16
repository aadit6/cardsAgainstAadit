import React, { useState, useEffect, useRef } from 'react';
import { FaComments } from 'react-icons/fa';
import { MdGif, MdSend } from 'react-icons/md'; // Import Gif icon
import styled from 'styled-components';
import axios from 'axios';
import { GIPHY_API_KEY, GIPHY_URL } from '../constants';

const ChatBox = ({ socket, roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mostRecentUnreadIndex, setMostRecentUnreadIndex] = useState(-1);
  const [gifSearch, setGifSearch] = useState(''); // State for gif search
  const [gifs, setGifs] = useState([]); // State for storing search results
  const [showGifSearch, setShowGifSearch] = useState(false);
  const [selectedGif, setSelectedGif] = useState(null);
  const [gifIndex, setGifIndex] = useState(0);
  const chatInputRef = useRef(null);
  const chatMessagesRef = useRef(null);

  
  useEffect(() => {

    const handleChatMessage = (message) => {
      setMessages((prevMessages) => {
        if (!message.messageId || !prevMessages.some((msg) => msg.messageId === message.messageId)) {
          return [...prevMessages, message];
        } else {
          return prevMessages;
        }
      });
  
      if (!isChatOpen && message.user !== currentUser) {
          setMostRecentUnreadIndex(messages.length); // Set most recent unread index
          setUnreadCount((prevCount) => prevCount + 1);
      }
    };

    
    if (socket) {
      socket.on('chatMessage', handleChatMessage);

      return () => {
        socket.off('chatMessage', handleChatMessage);
      };
    }
  }, [socket, isChatOpen, currentUser, messages.length]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      if (isChatOpen || messages.length > 0) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }
  }, [isChatOpen, messages]);

  const handleSendMessage = () => {
    if (socket && (newMessage.trim() !== '' || selectedGif)) {
      let message;

      if (selectedGif) {
        message = {
          user: currentUser,
          text: selectedGif.images.fixed_height.url,
          timestamp: new Date().toISOString(),
          isGif: true,
        };
      } else {
        message = {
          user: currentUser,
          text: newMessage.trim(),
          timestamp: new Date().toISOString(),
        };
      }

      socket.emit('sendMessage', roomId, message, (ack) => {
        setNewMessage('');
        setSelectedGif(null);
        setGifIndex(0);
        setShowGifSearch(false);
      });

      
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => {
      if (!prev) {
        setUnreadCount(0);
      } else {
        // Clear unread count when closing chat
        setUnreadCount(0);
        setMostRecentUnreadIndex(-1); // Set most recent unread index when closing chat

      }
      return !prev;
    });
  };

  // Function to search for GIFs
  const searchGifs = async () => {
    try {
      const response = await axios.get(`${GIPHY_URL}/v1/gifs/search`, {
        params: {
          api_key: GIPHY_API_KEY,
          q: gifSearch,
          limit: 200, // Increased limit to 200
        },
      });

      setGifs(response.data.data.slice(0, 5)); // Show the first 5 gifs
      setGifIndex(0);
      setSelectedGif(null);
    } catch (error) {
      console.error('Error searching for GIFs', error);
    }
  };

  const handleSendGif = () => {
    if (gifs.length > 0 && selectedGif) {
      handleSendMessage();
    }
  };

  const handleGifSelection = (index) => {
    if (gifs.length > 0) {
      setGifIndex(index);
      setSelectedGif(gifs[index]);
    }
  };

  const toggleGifSearch = () => {
    setShowGifSearch((prev) => !prev);
    setGifs([]);
    setSelectedGif(null);
    setGifIndex(0);
  };

  const isUnread = (index) => {
    return index === mostRecentUnreadIndex;

  };
  return (
    <>
      <Overlay onClick={toggleChat} isChatOpen={isChatOpen} />
      <ChatButton onClick={toggleChat} isChatOpen={isChatOpen}>
        <FaComments size={50} />
        {unreadCount > 0 && <UnreadIndicator>{unreadCount}</UnreadIndicator>}
      </ChatButton>
      <ChatBoxWrapper isChatOpen={isChatOpen}>
        <ChatHeader>Chat</ChatHeader>
        <ChatMessages ref={chatMessagesRef}>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
               {isUnread(index) && isChatOpen && (
              <Separator>New Messages Start Here</Separator>
            )}
              <ChatMessage>
                <Timestamp>{new Date(message.timestamp).toLocaleTimeString()}</Timestamp>
                <strong>{message.user}:</strong> {message.isGif ? <Gif src={message.text} /> : message.text}
              </ChatMessage>
            </React.Fragment>
          ))}
        </ChatMessages>
        <ChatInputContainer>
          <ChatInput
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            ref={chatInputRef}
          />
          {/* Toggle the GIF search container */}
          <GifIcon size={50} onClick={toggleGifSearch} />
          {/* GIF search container */}
          {showGifSearch && (
            <>
              <GifSearchInput
                type="text"
                placeholder="Search for GIFs..."
                value={gifSearch}
                onChange={(e) => setGifSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchGifs()}
              />
              <MdSend size={24} onClick={searchGifs} style={{ cursor: 'pointer', marginLeft: '8px' }} />
              {/* Render GIF search results */}
              {gifs.length >= 0 && (
                <>
                  <GifResults>
                {gifs.map((gif, index) => (
                  <GifThumbnail
                    key={gif.id}
                    src={gif.images.fixed_height.url}
                    alt={gif.title}
                    isSelected={index === gifIndex}
                    onClick={() => handleGifSelection(index)}
                  />
                ))}
              </GifResults>
              <SendButton onClick={handleSendGif}>
                <MdSend size={24} style={{ cursor: 'pointer' }} />
                Send
              </SendButton>
                </>
              )}
            </>
          )}
        </ChatInputContainer>
      </ChatBoxWrapper>
    </>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 1px;
  left: 0;
  width: 100%;
  height: calc(100%);
  background: ${(props) => (props.isChatOpen ? 'rgba(0, 0, 0, 0.7)' : 'transparent')};
  z-index: ${(props) => (props.isChatOpen ? '998' : '0')};
  pointer-events: ${(props) => (props.isChatOpen ? 'auto' : 'none')};
  opacity: ${(props) => (props.isChatOpen ? '1' : '0')};
  transition: opacity 0.25s;
`;

const ChatButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: ${(props) => (props.isChatOpen ? '630px' : '20px')};
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: left 0.3s ease-in-out;

  &:hover {
    background-color: #3f9942;
  }
`;

const ChatBoxWrapper = styled.div`
  position: fixed;
  left: ${(props) => (props.isChatOpen ? '20px' : '-650px')};
  bottom: 20px;
  top: px;
  z-index: 998;
  display: flex;
  flex-direction: column;
  width: 600px;
  height: 95%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  transition: left 0.3s ease-in-out;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`;

const ChatHeader = styled.div`
  background-color: #4caf50;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  font-size: 30px;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: auto;
`;

const ChatMessage = styled.div`
  margin-bottom: 8px;
  font-size: 17px;

  strong {
    margin-right: 4px;
  }
`;

const ChatInputContainer = styled.div`
  display: flex;
  flex-direction: row; /* Updated to row */
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ccc;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  margin-right: 8px;
`;

const SendButton = styled.button`
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 2px;
`;

const Timestamp = styled.span`
  font-size: 0.8em;
  color: #888;
  margin-right: 8px;
`;

const UnreadIndicator = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: red;
  color: white;
  font-size: 15px;
  padding: 1px 5px;
  border-radius: 100%;
`;

const Separator = styled.div`
  text-align: center;
  margin: 2px 0;
  font-weight: bold;
  color: #4caf50; /* Adjust color as needed */
  position: relative;

  &:before,
  &:after {
    content: '';
    display: inline-block;
    height: 2px;
    background-color: #4caf50; /* Adjust color as needed */
    width: 100px;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
  }

  &:before {
    left: 0;
    animation: lineAnimation 3s ease-in-out infinite;
  }

  &:after {
    right: 0;
    animation: lineAnimation 3s ease-in-out infinite reverse;
  }

  @keyframes lineAnimation {
    0% {
      width: 0;
    }
    50% {
      width: 180px;
    }
    100% {
      width: 0;
    }
  }
`;



const GifIcon = styled(MdGif)`
  cursor: pointer;
`;

const GifSearchInput = styled.input`
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  margin-right: 8px;
`;

const GifResults = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const GifThumbnail = styled.img`
  max-width: 100px;
  max-height: 100px;
  cursor: pointer;
  border-radius: ${(props) => (props.isSelected ? '8px' : '0')};
  border: ${(props) => (props.isSelected ? '6px solid #4caf50' : 'none')};
  transition: border 0.3s ease-in-out;
`;

const Gif = styled.img`
  max-width: 100%;
  height: auto;
  cursor: pointer;
  margin-top: 8px;
`;

export default ChatBox;

import React, { useState, useEffect, useRef } from 'react';
import { FaComments } from 'react-icons/fa';
import styled from 'styled-components';

const ChatBox = ({ socket, roomId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const chatInputRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const mostRecentUnreadIndexRef = useRef(-1);

  const handleChatMessage = (message) => {
    setMessages((prevMessages) => {
      if (!message.messageId || !prevMessages.some((msg) => msg.messageId === message.messageId)) {
        return [...prevMessages, message];
      } else {
        return prevMessages;
      }
    });

    if (!isChatOpen) {
      setUnreadCount((prevCount) => prevCount + 1);
      mostRecentUnreadIndexRef.current = messages.length;
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on('chatMessage', handleChatMessage);

      return () => {
        socket.off('chatMessage', handleChatMessage);
      };
    }
  }, [socket, isChatOpen]);

  useEffect(() => {
    if (chatMessagesRef.current) {
      if (isChatOpen || messages.length > 0) {
        chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
      }
    }
  }, [isChatOpen, messages]);

  const handleSendMessage = () => {
    if (socket && newMessage.trim() !== '') {
      const message = {
        user: currentUser,
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      socket.emit('sendMessage', roomId, message, (ack) => {
        setNewMessage('');
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
      if (!prev && unreadCount > 0) {
        setUnreadCount(0);
        mostRecentUnreadIndexRef.current = messages.length;
      }
      return !prev;
    });
  };

  return (
    <>
      <Overlay onClick={toggleChat} isChatOpen={isChatOpen} />
      <ChatButton onClick={toggleChat} isChatOpen={isChatOpen}>
        <FaComments size={36} />
        {unreadCount > 0 && <UnreadIndicator>{unreadCount}</UnreadIndicator>}
      </ChatButton>
      <ChatBoxWrapper isChatOpen={isChatOpen}>
        <ChatHeader>Chat</ChatHeader>
        <ChatMessages ref={chatMessagesRef}>
          {messages.map((message, index) => (
            <React.Fragment key={index}>
              {index === mostRecentUnreadIndexRef.current && isChatOpen && (
                <Separator>--- New Messages Start Here ---</Separator>
              )}
              <ChatMessage>
                <Timestamp>{new Date(message.timestamp).toLocaleTimeString()}</Timestamp>
                <strong>{message.user}:</strong> {message.text}
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
          <SendButton onClick={handleSendMessage}>Send</SendButton>
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
  background: ${(props) => (props.isChatOpen ? 'rgba(0, 0, 0, 0.5)' : 'transparent')};
  z-index: ${(props) => (props.isChatOpen ? '998' : '0')};
  pointer-events: ${(props) => (props.isChatOpen ? 'auto' : 'none')};
  opacity: ${(props) => (props.isChatOpen ? '1' : '0')};
  transition: opacity 0.25s;
`;

const ChatButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: ${(props) => (props.isChatOpen ? '550px' : '20px')};
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  transition: left 0.3s ease-in-out;
`;

const ChatBoxWrapper = styled.div`
  position: fixed;
  left: ${(props) => (props.isChatOpen ? '20px' : '-550px')};
  bottom: 20px;
  top: px;
  z-index: 998;
  display: flex;
  flex-direction: column;
  width: 500px;
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

  strong {
    margin-right: 4px;
  }
`;

const ChatInputContainer = styled.div`
  display: flex;
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
  padding: 3px 6px;
  border-radius: 50%;
`;

const Separator = styled.div`
  text-align: center;
  margin: 8px 0;
  color: #4caf50; /* Adjust color as needed */
  font-weight: bold;
`;

export default ChatBox;

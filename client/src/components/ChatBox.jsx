import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaComments } from 'react-icons/fa';

const ChatBox = ({ socket, roomId, currentUser }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatInputRef = useRef(null);
  
    useEffect(() => {
        if (socket) {
            const handleChatMessage = (message) => {
                // Check if the message with this id already exists
                if (!messages.some((msg) => msg.messageId === message.messageId)) {
                    setMessages((prevMessages) => [...prevMessages, message]);
                }
            };
    
            socket.on('chatMessage', handleChatMessage);
    
            return () => {
                socket.off('chatMessage', handleChatMessage);
            };
        }
    }, [socket, messages]);
    
  
    const handleSendMessage = () => {
        if (socket && newMessage.trim() !== '') {
          const message = {
            user: currentUser,
            text: newMessage.trim(),
            timestamp: new Date().toISOString(),
          };
      
          // Emit the message through the socket
          socket.emit('sendMessage', roomId, message, (ack) => {
            // Check if the server acknowledged the message
            if (ack === 'sent') {
              // Update the state only after the message is sent
              setMessages((prevMessages) => [...prevMessages, message]);
              setNewMessage(''); // Clear the input box
            }
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
      setIsChatOpen((prev) => !prev);
    };
  
    useEffect(() => {
        if (socket) {
          const handleChatMessage = (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
          };
      
          // Use 'on' instead of 'once' if you want to keep listening for multiple messages
          socket.on('chatMessage', handleChatMessage);
      
          return () => {
            socket.off('chatMessage', handleChatMessage);
          };
        }
      }, [socket]);
      
  

  return (
    <React.Fragment>
      <ChatButton onClick={toggleChat} isChatOpen={isChatOpen}>
        <FaComments size={24} />
      </ChatButton>
      {isChatOpen && (
        <ChatBoxWrapper>
          <ChatHeader>Chat</ChatHeader>
          <ChatMessages>
            {messages.slice(-12).map((message, index) => (
              <ChatMessage key={index}>
                <Timestamp>{new Date(message.timestamp).toLocaleTimeString()}</Timestamp>
                <strong>{message.user}:</strong> {message.text}
              </ChatMessage>
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
      )}
    </React.Fragment>
  );
};


const ChatButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: ${(props) => (props.isChatOpen ? '320px' : '20px')};
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 999; /* Ensure it is on top of other elements */
`;

const ChatBoxWrapper = styled.div`
  position: fixed;
  left: 20px;
  bottom: 20px;
  z-index: 998; /* Ensure it is on top of other elements */
  display: flex;
  flex-direction: column;
  width: 300px;
  background-color: #fff; /* Change this to your preferred background color */
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  background-color: #4caf50;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
`;

const ChatMessages = styled.div`
  flex: 1;
  max-height: 300px; /* Fixed height, adjust as needed */
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


export default ChatBox;

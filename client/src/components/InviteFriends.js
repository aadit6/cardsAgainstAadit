import React, { useRef, useState } from 'react';
import styled from 'styled-components';

const InviteFriends = ({ roomId }) => {
  const roomIdRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    if (roomIdRef.current) {
      roomIdRef.current.select();
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };

  return (
    <InviteContainer
      onClick={copyToClipboard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      isHovered={isHovered}
      isCopied={isCopied}
    >
      <InviteText>Invite Your Friends</InviteText>
      <RoomIdContainer>
        <RoomIdInput ref={roomIdRef} value={roomId} readOnly />
      </RoomIdContainer>
      {isCopied && <SuccessMessage>Copied!</SuccessMessage>}
    </InviteContainer>
  );
};

const InviteContainer = styled.div`
  background-color: ${({ isHovered, isCopied }) =>
    isCopied ? '#1f9a6f' : isHovered ? '#1a8daa' : '#20b9c7'};
  padding-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;

  &:hover {
    cursor: pointer;
  }
`;

const InviteText = styled.h2`
  color: white;
  font-size: 24px;
  margin-bottom: 10px;
`;

const RoomIdContainer = styled.div`
  display: flex;
  align-items: center;
`;

const RoomIdInput = styled.input`
  flex-grow: 1;
  background-color: transparent;
  border: none;
  color: #fff;
  font-size: 40px;
  margin-bottom: 10px;
  text-align: center;
  outline: none;
  cursor: pointer; /* Ensure pointer cursor over the RoomIdInput */
`;

const SuccessMessage = styled.div`
  position: absolute;
  bottom: 0;
  color: #fff;
  font-size: 18px;
`;

export default InviteFriends;

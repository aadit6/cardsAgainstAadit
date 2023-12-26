import React from 'react';
import styled from 'styled-components';

const UserInfo = ({ currentUser }) => {
  return (
    <UserContainer>
      <UserName>{currentUser}</UserName>
    </UserContainer>
  );
};

const UserContainer = styled.div`
  display: flex;
  align-items: center;
`;


const UserName = styled.span`
  font-size: 24px; /* Adjust the font size as needed */
  font-weight: bold; /* Make the username bold */
  color: white; /* Adjust the color as needed */
`;

export default UserInfo;

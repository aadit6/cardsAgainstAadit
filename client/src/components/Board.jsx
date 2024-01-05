import React from 'react';
import styled from 'styled-components';

const BoardWrapper = styled.div`
  margin-top: 20px;
  text-align: center;
  width: 100%;
  max-width: 100%; /* Set a maximum width to prevent shrinking */
  height: 300px;
  padding-bottom: 0px;
  display: flex;
  align-items: center;
  overflow-x: auto; /* Allow horizontal overflow without scrolling */
`;

const BlackCardWrapper = styled.div`
  flex-shrink: 0;
`;

const Board = ({ children }) => {
  return (
    <BoardWrapper>
      <BlackCardWrapper>{children[0]}</BlackCardWrapper>
      {children.slice(1)}
    </BoardWrapper>
  );
};

export default Board;

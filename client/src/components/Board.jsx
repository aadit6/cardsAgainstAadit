import React from 'react';
import styled from 'styled-components';

const BoardWrapper = styled.div`
  width: 100%;
  height: 250px;
  padding-bottom: 0px;
  display: flex;
  overflow-x: auto;
  gap: 10px;

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

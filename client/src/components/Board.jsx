// Board.jsx
import React from 'react';
import styled from 'styled-components';

const BoardWrapper = styled.div`
  margin-top: 20px;
  text-align: center;
  width: calc(100% - 240px);
  height: 250px;
  padding-bottom: 0px;
`;

const Board = ({ children }) => {
  return <BoardWrapper>{children}</BoardWrapper>;
};

export default Board;
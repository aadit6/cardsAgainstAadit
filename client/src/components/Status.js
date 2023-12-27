// Status.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Status = ({ logs }) => {
  const [statusLogs, setStatusLogs] = useState([]);

  useEffect(() => {
    // Update the statusLogs state whenever logs prop changes
    setStatusLogs(logs);
  }, [logs]);

  return (
    <StatusWrapper>
      <StatusTitle>Status</StatusTitle>
      {statusLogs.map((log, index) => (
        <StatusMessage key={index}>{log}</StatusMessage>
      ))}
    </StatusWrapper>
  );
};

const StatusWrapper = styled.div`
  background-color: #333;
  color: #fff;
  padding-bottom: 2px;
  border-radius: 8px;
  margin-bottom: 20px;
  margin-top: 20px;
  margin-right: 1%;
  margin-left: 1%;
  align-items: center;
`;

const StatusTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  text-align: center;
`;

const StatusMessage = styled.div`
  margin-bottom: 8px;
  font-size: 20px;
  text-align: center;
`;

export default Status;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinGame from './JoinGame';
import Game from "./Game";
//import

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<JoinGame />} />
        <Route path="/game/:roomid" element={<Game />}/>
      </Routes>
    </Router>
  );
};

export default App;


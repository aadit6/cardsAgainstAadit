import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import JoinGame from './JoinGame';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<JoinGame />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;


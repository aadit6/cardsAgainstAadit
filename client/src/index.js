import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// );

//strict mode good for development but might cause some issues...

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(<App />);



import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dialer from './components/Dialer';
import CallHistory from './components/CallHistory';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#0f172a', padding: '2rem' }}>
          <Dialer />
          <CallHistory />
          <button 
            onClick={handleLogout}
            style={{
              position: 'fixed',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem 1rem',
              background: '#475569',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;

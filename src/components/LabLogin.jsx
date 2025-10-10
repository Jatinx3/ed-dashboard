import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabAuth } from '../context/LabAuthContext';

const LabLogin = () => {
  const { setIsLabAuthenticated } = useLabAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Hardcoded Lab credentials (separate from ED)
    if (username === 'lab_user' && password === 'labpass') {
      setIsLabAuthenticated(true);
      setError('');
      navigate('/lab/dashboard');
    } else {
      setError('Invalid Lab username or password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-card">
        <h2>Lab Status Entry Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Lab Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="lab_user"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="labpass"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit">Log In</button>
        </form>
      </div>
    </div>
  );
};

export default LabLogin;

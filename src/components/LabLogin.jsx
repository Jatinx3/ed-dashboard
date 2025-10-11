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
    if (username === 'lab_user' && password === 'labpass') {
      setIsLabAuthenticated(true);
      setError('');
      navigate('/lab/dashboard');
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-card">
        <h2>Lab Dashboard Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
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
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="labpass"
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-submit-button">Log In</button>
        </form>
        <button className="forgot-password-link" onClick={() => alert("Forgot Password functionality is not yet implemented.")}>Forgot Password?</button>
      </div>
    </div>
  );
};

export default LabLogin;
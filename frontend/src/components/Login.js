// src/Login.js

import React, { useState, useContext } from 'react'; // ✅ FIX: include useContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // ✅ FIX: import context

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); 

  const handleLogin = (e) => {
    e.preventDefault();
    axios.post('http://localhost:8000/shop/login/', 
      { username, password },
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      }
    )
    .then(response => {
      localStorage.setItem('token', response.data.token || 'your_token'); 
      login(); 
      alert('Login successful!');
      navigate('/');  // Redirect to homepage
    })
    .catch(error => {
      alert('Invalid credentials or error logging in.');
    });
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;

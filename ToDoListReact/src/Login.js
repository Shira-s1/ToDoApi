import React, { useState } from 'react';
import service from './service';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
        await service.login(username, password);
        navigate('/');
    } catch (err) {
        if (err.response && err.response.status === 401) {
            setError('Invalid username or password. Please try again.');
        } else {
            setError('Login failed. Please check your network connection.');
        }
        console.error(err);
    }
  };

  return (
    <section className="todoapp">
      <header className="header">
        <h1>login</h1>
      </header>
      <section className="main" style={{ display: 'block', padding: '20px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '0 auto' }}>
            <input
                className="new-todo"
                style={{ padding: '10px', border: '1px solid #e6e6e6' }}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <input
                className="new-todo"
                style={{ padding: '10px', border: '1px solid #e6e6e6' }}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" style={{ padding: '10px', background: '#e6e6e6', border: 'none', cursor: 'pointer' }}>
                Login
            </button>
        </form>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Don't have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </section>
  );
}

export default Login;

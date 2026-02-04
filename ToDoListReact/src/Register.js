import React, { useState } from 'react';
import service from './service';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError('');
    setLoading(true);

    try {
        await service.register(username, password);
        // Auto-login after registration
        await service.login(username, password);
        navigate('/');
    } catch (err) {
        console.error(err);
        if (err.response && err.response.status === 409) {
            setError('Username already exists. Please choose a different one.');
        } else {
            setError('Registration failed. Please try again later.');
        }
        
        window.alert("Registration failed");
        setUsername('');
        setPassword('');
    } finally {
        setLoading(false);
    }
  };

  return (
    <section className="todoapp">
      <header className="header">
        <h1>register</h1>
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
            <button 
                type="submit" 
                style={{ padding: '10px', background: '#e6e6e6', border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
                disabled={loading}
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <p style={{ textAlign: 'center', marginTop: '20px' }}>
            Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </section>
  );
}

export default Register;

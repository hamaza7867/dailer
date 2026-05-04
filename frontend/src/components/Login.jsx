import React, { useState } from 'react';
import { authService } from '../apiService';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await authService.login(username, password);
            onLoginSuccess();
        } catch (err) {
            setError('Invalid username or password');
            console.error('Login failed:', err);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Cyphex Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-text">{error}</p>}
                    <button type="submit" className="login-btn">Login</button>
                </form>
            </div>
            
            <style jsx>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: #0f172a;
                    color: white;
                }
                .login-card {
                    background: rgba(30, 41, 59, 0.7);
                    backdrop-filter: blur(10px);
                    padding: 2rem;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    width: 350px;
                    text-align: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                h2 { margin-bottom: 1.5rem; }
                .input-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: #334155;
                    border: 1px solid #475569;
                    border-radius: 12px;
                    color: white;
                    margin-bottom: 1rem;
                    outline: none;
                }
                .login-btn {
                    width: 100%;
                    padding: 0.75rem;
                    background: #3b82f6;
                    color: white;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }
                .error-text { color: #ef4444; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
};

export default Login;

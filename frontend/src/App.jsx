import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Render Backend API Base URL
const API_URL = "https://nexus-chat-engine.onrender.com/api/auth";

function App() {
  // Navigation States: 'login' | 'register' | 'chat'
  const [screen, setScreen] = useState('login');
  const [user, setUser] = useState(null);

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // Chat States
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Namaste! Main aapka AI Assistant hoon. Aaj main aapki kya madad kar sakta hoon?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const chatEndRef = useRef(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setScreen('chat');
    }
  }, []);

  useEffect(() => {
    if (screen === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [screen, messages]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Register Function
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    try {
      const res = await axios.post(`${API_URL}/register`, {
        username: formData.name,
        email: formData.email,
        password: formData.password
      });
      setAuthMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => setScreen('login'), 2000);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Something went wrong!');
    }
  };

  // Login Function
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/register`, {
  name: formData.name, // ✅ Ab backend ko exact 'name' milega
  email: formData.email,
  password: formData.password
});
      localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setScreen('chat');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid Credentials!');
    }
  };

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setUser(null);
    setScreen('login');
  };

  // Simple UI Rendering for test
  if (screen === 'login' || screen === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-bold text-center mb-4">{screen === 'login' ? 'Sign In' : 'Create Account'}</h2>
          {authError && <div className="bg-red-950/50 border border-red-500 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">{authError}</div>}
          {authMessage && <div className="bg-green-950/50 border border-green-500 text-green-200 p-3 rounded-lg mb-4 text-sm text-center">{authMessage}</div>}
          
          <form onSubmit={screen === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {screen === 'register' && (
              <div>
                <label className="text-xs text-gray-400 block mb-1">FULL NAME</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" required />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-400 block mb-1">EMAIL ADDRESS</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">PASSWORD</label>
              <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500" required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-lg font-medium transition-colors">
              {screen === 'login' ? 'Sign In' : 'INITIALIZE PROFILE'}
            </button>
          </form>
          <div className="text-center mt-4">
            <button onClick={() => setScreen(screen === 'login' ? 'register' : 'login')} className="text-xs text-indigo-400 hover:underline">
              {screen === 'login' ? "Don't have an account? Register" : "Already configured? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Nexus Core Engine, {user?.username || 'User'}!</h1>
      <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">Logout</button>
    </div>
  );
}

export default App;
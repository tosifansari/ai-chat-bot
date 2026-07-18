import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown'; // ✅ Premium Markdown Parser
import Chat from './components/Chat.jsx';

// ==========================================
// CONFIGURATION: Set Your Production Backend URL
// ==========================================
const API_URL = "https://nexus-chat-engine.onrender.com/api";

function App() {
  // --- Navigation & User Session States ---
  const [screen, setScreen] = useState('login'); // 'login' | 'register' | 'chat'
  const [user, setUser] = useState(null);

  // --- Auth Form States ---
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // --- Chat Engine States ---
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Namaste! Main aapka Nexus AI Assistant hoon. Main aapki kya madad kar sakta hoon?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  // --- PERSISTENCE: Check session on mount ---
  useEffect(() => {
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setScreen('chat');
      } catch (e) {
        localStorage.removeItem('nexus_user');
      }
    }
  }, []);

  // --- AUTO-SCROLL: Keep chat focused at bottom ---
  useEffect(() => {
    if (screen === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [screen, messages, isLoading]);

  // --- Input State Tracker ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- AUTHENTICATION: Registration API Handshake ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: formData.name,      
        email: formData.email,
        password: formData.password
      });
      setAuthMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        setScreen('login');
        setFormData({ name: '', email: '', password: '' });
        setAuthMessage('');
      }, 2000);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Something went wrong during registration.');
    }
  };

  // --- AUTHENTICATION: Login API Handshake ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      setScreen('chat');
      setFormData({ name: '', email: '', password: '' });
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid Credentials. Please try again.');
    }
  };

  // --- AUTHENTICATION: Logout Session Termination ---
  const handleLogout = () => {
    localStorage.removeItem('nexus_user');
    setUser(null);
    setScreen('login');
    setMessages([
      { role: 'model', text: 'Namaste! Main aapka Nexus AI Assistant hoon. Main aapki kya madad kar sakta hoon?' }
    ]);
  };

  // --- CHAT PIPELINE: Send Prompt to Engine ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: userText,
        userId: user?._id || user?.id 
      });
      
      const botReply = res.data.reply || res.data.response || "Server responded, but could not parse the format.";
      setMessages(prev => [...prev, { role: 'model', text: botReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Error: Connection timed out. Please check your backend engine or GROQ key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RENDER INTERFACE: Sign In / Sign Up
  // ==========================================
  if (screen === 'login' || screen === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0b10] text-white p-4 selection:bg-indigo-500/30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#11131e]/80 border border-gray-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-xl z-10">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xl shadow-inner">
              Ω
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center tracking-tight mb-1 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {screen === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-center text-xs text-gray-500 mb-6 font-medium">Access the Nexus Chat Core Engine</p>

          {authError && (
            <div className="bg-red-950/40 border border-red-500/50 text-red-200 p-3.5 rounded-xl mb-4 text-xs font-medium text-center">
              ⚠️ {authError}
            </div>
          )}
          {authMessage && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-xl mb-4 text-xs font-medium text-center">
              ✅ {authMessage}
            </div>
          )}
          
          <form onSubmit={screen === 'login' ? handleLogin : handleRegister} className="space-y-4">
            {screen === 'register' && (
              <div>
                <label className="text-[10px] text-gray-400 font-bold tracking-wider block mb-1.5">FULL NAME</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="Enter your name"
                  className="w-full bg-[#08090f] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600" 
                  required 
                />
              </div>
            )}
            <div>
              <label className="text-[10px] text-gray-400 font-bold tracking-wider block mb-1.5">EMAIL ADDRESS</label>
              <input 
                type="type" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="example@gmail.com"
                className="w-full bg-[#08090f] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold tracking-wider block mb-1.5">PASSWORD</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleInputChange} 
                placeholder="••••••••"
                className="w-full bg-[#08090f] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-600" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-950/50 mt-2">
              {screen === 'login' ? 'Sign In to Workspace' : 'Initialize Nexus Profile'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => { setScreen(screen === 'login' ? 'register' : 'login'); setAuthError(''); }} 
              className="text-xs text-indigo-400 font-medium hover:text-indigo-300 hover:underline transition-all"
            >
              {screen === 'login' ? "Don't have an account? Register Now" : "Already configured? Return to Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER INTERFACE: Premium AI Chat Workspace
  // ==========================================
  return (
    <div className="w-full h-screen bg-[#07080e]">
      {/* Dynamic Persistent Node Dashboard Integration */}
      <Chat 
        userId={user?._id || user?.id || (localStorage.getItem('nexus_user') ? JSON.parse(localStorage.getItem('nexus_user'))._id : null)} 
        userObj={user}
        onLogout={handleLogout} 
      />
    </div>
  );
}

export default App;
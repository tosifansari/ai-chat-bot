import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
        name: formData.name,      // Synchronized with Backend Mongoose schema
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
    // Push user's message directly to dynamic array state
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: userText,
        userId: user?._id || user?.id // ✅ Added missing userId to pass backend validation check
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
        {/* Background Glowing Ambiance */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md bg-[#11131e]/80 border border-gray-800/80 p-8 rounded-2xl shadow-2xl backdrop-blur-xl z-10 transition-all duration-300 hover:border-gray-700/50">
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
            <div className="bg-red-950/40 border border-red-500/50 text-red-200 p-3.5 rounded-xl mb-4 text-xs font-medium text-center animate-fade-in">
              ⚠️ {authError}
            </div>
          )}
          {authMessage && (
            <div className="bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-xl mb-4 text-xs font-medium text-center animate-fade-in">
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
                  className="w-full bg-[#08090f] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" 
                  required 
                />
              </div>
            )}
            <div>
              <label className="text-[10px] text-gray-400 font-bold tracking-wider block mb-1.5">EMAIL ADDRESS</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                placeholder="example@gmail.com"
                className="w-full bg-[#08090f] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" 
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
                className="w-full bg-[#08090f] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-600" 
                required 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/20 active:scale-[0.98] mt-2">
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
    <div className="flex h-screen bg-[#07080e] text-white font-sans selection:bg-indigo-500/30">
      
      {/* Dynamic Desktop Sidebar */}
      <div className="w-64 bg-[#0d0e15] border-r border-gray-800/80 flex flex-col justify-between p-5 hidden md:flex">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
              Ω
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide uppercase bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Nexus Engine
              </h2>
              <p className="text-[10px] text-indigo-500 font-semibold tracking-wider uppercase">Production Hub</p>
            </div>
          </div>
          
          <button 
            onClick={() => setMessages([{ role: 'model', text: 'Namaste! Main aapka Nexus AI Assistant hoon. Main aapki kya madad kar sakta hoon?' }])} 
            className="w-full bg-[#141622] hover:bg-[#1a1d2e] text-xs font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200 text-left flex items-center justify-between"
          >
            <span>New Chat Session</span>
            <span className="text-gray-500 text-lg">+</span>
          </button>
        </div>

        <div className="bg-[#11131e] border border-gray-800/50 p-4 rounded-xl space-y-3">
          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">ACTIVE USER</p>
            <p className="text-xs font-semibold text-gray-300 truncate mt-0.5">{user?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-200 text-xs font-bold py-2.5 px-4 rounded-lg border border-red-900/30 hover:border-red-900/50 transition-all text-center"
          >
            Log Out Workspace
          </button>
        </div>
      </div>

      {/* Primary Chat Container */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0b10]">
        
        {/* Dynamic Nav Header */}
        <div className="h-16 border-b border-gray-800/80 flex items-center justify-between px-6 bg-[#0d0e15]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-xs tracking-wider uppercase text-gray-300">Live Secure Connection</span>
          </div>
          <button 
            onClick={handleLogout} 
            className="md:hidden bg-red-950/50 hover:bg-red-900/40 text-red-200 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-red-900/40 transition-all"
          >
            Logout
          </button>
        </div>

        {/* Messaging Layout Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl w-full mx-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[80%] px-4.5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                  : 'bg-[#11131e] border border-gray-800/80 text-gray-200 rounded-tl-none font-normal'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* Dynamic Typist Bubble (Loader) */}
          {isLoading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-[#11131e] border border-gray-800/80 text-gray-400 px-5 py-3.5 rounded-2xl rounded-tl-none text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Engine Input Board */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0d0e15]/40 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="max-w-3xl w-full mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to Nexus AI..."
              className="flex-1 bg-[#08090f] border border-gray-800 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-600 shadow-inner transition-all duration-200"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-950/50 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              disabled={isLoading || !input.trim()}
            >
              Send
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-600 mt-2.5 tracking-wider uppercase font-medium">Nexus Engine v1.1.2 Production Build</p>
        </div>
      </div>
    </div>
  );
}

export default App;
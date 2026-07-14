import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

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
  }, [messages, screen]);

  // Fetch Sidebar Chats dynamically using logged-in User ID
  const fetchSidebarSessions = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/user/${user.id}`);
      setChatSessions(response.data);
    } catch (error) {
      console.error("Error fetching sidebar sessions:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSidebarSessions();
    }
  }, [chatId, user]);

  // Load old conversation history
  const loadActiveChat = async (id) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/chat/${id}`);
      if (response.data && response.data.messages) {
        setChatId(id);
        const formattedMessages = response.data.messages.map(msg => ({
          role: msg.role,
          text: msg.parts[0].text
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error loading chat session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auth Submit Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');

    try {
      if (screen === 'register') {
        const res = await axios.post('http://localhost:5000/api/auth/register', formData);
        setAuthMessage(res.data.message);
        setTimeout(() => setScreen('login'), 1500);
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem('nexus_token', res.data.token);
        localStorage.setItem('nexus_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setScreen('chat');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Something went wrong!');
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
    setUser(null);
    setChatId(null);
    setMessages([{ role: 'model', text: 'Namaste! Main aapka AI Assistant hoon. Aaj main aapki kya madad kar sakta hoon?' }]);
    setScreen('login');
  };

  // Send message layout handler
  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat', {
        message: userMessage,
        userId: user.id, // Real user database ID mapped
        chatId: chatId 
      });

      if (response.data && response.data.reply) {
        if (!chatId && response.data.chatId) {
          setChatId(response.data.chatId);
        }
        setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error: Lost handshake pipeline with server!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // RENDER SECURITY SCREEN CORES
  if (screen === 'login' || screen === 'register') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0d0e12] font-sans text-slate-200 antialiased px-4">
        <div className="w-full max-w-md bg-[#16171d] border border-[#22242a] p-8 rounded-2xl shadow-2xl shadow-black/40">
          <div className="flex flex-col items-center mb-6">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-base shadow-md mb-2">Ω</div>
            <h2 className="text-xl font-bold tracking-wide text-white">{screen === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-xs text-slate-500 mt-1">Access the Nexus Chat Core Engine</p>
          </div>

          {authError && <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl text-center mb-4 font-medium">{authError}</div>}
          {authMessage && <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center mb-4 font-medium">{authMessage}</div>}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {screen === 'register' && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Full Name</label>
                <input required type="text" className="w-full bg-[#1e202a] border border-[#2b2e3f]/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
            )}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Email Address</label>
              <input required type="email" className="w-full bg-[#1e202a] border border-[#2b2e3f]/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" placeholder="you@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Password</label>
              <input required type="password" className="w-full bg-[#1e202a] border border-[#2b2e3f]/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-slate-200" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white font-medium text-xs rounded-xl tracking-wide mt-2 shadow-lg shadow-indigo-600/10 cursor-pointer">
              {screen === 'login' ? 'AUTHENTICATE' : 'INITIALIZE PROFILE'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setScreen(screen === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-xs text-indigo-400 hover:underline cursor-pointer">
              {screen === 'login' ? "Don't have an account? Register" : 'Already configured? Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN SYSTEM CORE CHAT DISPLAY
  return (
    <div className="flex h-screen bg-[#0d0e12] text-[#e2e8f0] font-sans antialiased overflow-hidden">
      
      {/* 1. DYNAMIC SIDEBAR */}
      <div className="w-68 bg-[#16171d] flex flex-col justify-between hidden md:flex border-r border-[#22242a]/60">
        <div className="p-4 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-2.5 px-2 mb-6">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">Ω</div>
            <span className="font-semibold text-sm tracking-wide text-white">Nexus Chat</span>
          </div>

          <button 
            onClick={() => { setMessages([{ role: 'model', text: 'New session started. Ask me anything!' }]); setChatId(null); }}
            className="w-full py-2 px-4 bg-[#20222c] hover:bg-[#282b39] border border-[#2e3142]/40 rounded-xl text-xs font-medium text-left flex items-center justify-between group transition-colors cursor-pointer"
          >
            <span>New Session</span>
            <span className="text-slate-500 group-hover:text-white text-sm">＋</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 mt-6">
            <p className="text-[10px] text-slate-500 px-2 mb-2 uppercase tracking-widest font-bold">Recent History</p>
            {chatSessions.length === 0 ? (
              <p className="text-xs text-slate-600 px-2 italic">No conversations yet</p>
            ) : (
              chatSessions.map((session) => (
                <div 
                  key={session._id}
                  onClick={() => loadActiveChat(session._id)}
                  className={`py-2.5 px-3 border rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-all duration-150 truncate ${
                    chatId === session._id 
                      ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-300' 
                      : 'bg-[#1e202a]/40 border-[#2b2e3f]/20 text-slate-300 hover:bg-[#20222c]'
                  }`}
                >
                  <span>💬</span>
                  <span className="truncate font-medium">{session.title}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dynamic User Profile Info from MongoDB via Auth State */}
        <div className="p-4 bg-[#111217] border-t border-[#22242a]/60 flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-[#1e202a] border border-slate-700/50 flex items-center justify-center font-semibold text-xs text-indigo-300 uppercase shrink-0">
              {user?.name?.substring(0, 2) || 'US'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-slate-200 truncate capitalize">{user?.name}</span>
              <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHAT CANVAS */}
      <div className="flex-1 flex flex-col h-full bg-[#0d0e12]">
        
        {/* Top Navbar */}
        <div className="h-14 border-b border-[#22242a]/60 flex items-center px-6 justify-between bg-[#16171d]/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400">Core Active System Cluster</span>
          </div>
          <button onClick={handleLogout} className="text-xs border border-[#2d3142] text-slate-300 px-3.5 py-1.5 rounded-xl font-medium hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer">
            Logout
          </button>
        </div>

        {/* Content Panel Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-0">
          <div className="max-w-3xl w-full mx-auto space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
                )}

                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-600/10' : 'bg-[#16171d]/80 text-slate-200 border border-[#22242a]/50'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start animate-pulse">
                <div className="h-7 w-7 rounded-lg bg-[#20222c] flex items-center justify-center text-xs text-slate-400 shrink-0">..</div>
                <div className="bg-[#16171d]/50 text-slate-400 border border-[#22242a]/30 rounded-2xl px-4 py-3 text-sm">Nexus Engine is thinking...</div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input Box Area */}
        <div className="p-4 max-w-3xl w-full mx-auto">
          <div className="flex items-center bg-[#16171d] rounded-2xl px-4 py-2 border border-[#22242a] focus-within:border-indigo-500/70 transition-all duration-150">
            <input
              type="text"
              placeholder={isLoading ? "Processing sequence..." : "Message Nexus Chat Engine..."}
              className="flex-1 bg-transparent border-none outline-none text-sm text-[#f1f5f9] placeholder-slate-500 pr-4 py-1.5 disabled:opacity-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <button onClick={handleSend} className="h-8 w-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center disabled:opacity-30 transition-transform active:scale-95 cursor-pointer" disabled={!input.trim() || isLoading}>
              <span className="text-xs font-bold">➔</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
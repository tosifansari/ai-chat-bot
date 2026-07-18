import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// Local test environment endpoint routing
const API_BASE = "http://localhost:5000/api/chat"; 

export default function Chat({ userId, userObj, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // States for Tracking Persistent Chat History
  const [chatId, setChatId] = useState(null);
  const [sidebarChats, setSidebarChats] = useState([]);
  const chatEndRef = useRef(null);

  // 🔄 1. Load Sidebar History on Page Mount
  useEffect(() => {
    if (userId) {
      fetchSidebarHistory();
    }
  }, [userId]);

  // Auto Scroll to Bottom on New Messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSidebarHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/${userId}`);
      setSidebarChats(res.data);
    } catch (err) {
      console.error("Error fetching sidebar list:", err);
    }
  };

  // 📂 2. Switch Between Existing Chat Sessions
  const loadChatSession = async (selectedChatId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/session/${selectedChatId}`);
      setChatId(selectedChatId);
      
      // MongoDB format array schema data manipulation to UI structure
      const formattedMessages = res.data.messages.map(msg => ({
        role: msg.role === 'model' ? 'ai' : 'user',
        text: msg.parts[0].text
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error("Error loading chat session:", err);
    } finally {
      setLoading(false);
    }
  };

  // ➕ 3. Start a Fresh New Blank Chat Session
  const startNewChat = () => {
    setChatId(null);
    setMessages([]);
  };

  // ✉️ 4. Core Message Sender Engine
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");
    
    // Immediate UI rendering update
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/send`, {
        message: userText,
        userId: userId,
        chatId: chatId
      });

      const data = response.data;

      // If it's a completely new chat session, lock the received ID token stream
      if (!chatId) {
        setChatId(data.chatId);
        fetchSidebarHistory(); 
      }

      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      console.error("Chat engine execution error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "❌ Code Pipeline Timeout. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#07080e] text-white font-sans selection:bg-indigo-500/30">
      {/* 🧭 DYNAMIC SIDEBAR PANEL */}
      <div className="w-64 bg-[#0d0e15] border-r border-gray-800/80 flex flex-col justify-between p-5 hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-6">
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
            type="button"
            onClick={startNewChat}
            className="w-full bg-[#141622] hover:bg-[#1a1d2e] text-xs font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-all text-left flex items-center justify-between mb-6"
          >
            <span>New Chat Session</span>
            <span className="text-gray-500 text-lg">+</span>
          </button>
          
          <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-2">Recent Sessions</p>
            {sidebarChats.map((chat) => (
              <button
                key={chat._id}
                type="button"
                onClick={() => loadChatSession(chat._id)}
                className={`w-full text-left p-3 text-xs rounded-xl truncate block transition-all ${
                  chatId === chat._id ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20' : 'bg-[#141622]/40 text-gray-400 hover:bg-[#141622] hover:text-gray-200 border border-transparent hover:border-gray-800/60'
                }`}
              >
                💬 {chat.title}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-[#11131e] border border-gray-800/50 p-4 rounded-xl space-y-3">
          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">ACTIVE USER</p>
            <p className="text-xs font-semibold text-gray-300 truncate mt-0.5">{userObj?.name || 'User'}</p>
            <p className="text-[10px] text-gray-500 truncate">{userObj?.email || 'Authenticated'}</p>
          </div>
          <button 
            type="button"
            onClick={onLogout} 
            className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-200 text-xs font-bold py-2.5 px-4 rounded-lg border border-red-900/30 transition-all text-center"
          >
            Log Out Workspace
          </button>
        </div>
      </div>

      {/* 💬 MAIN CHAT FRAMEWORK STREAM */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0b10]">
        <div className="h-16 border-b border-gray-800/80 flex items-center justify-between px-6 bg-[#0d0e15]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-xs tracking-wider uppercase text-gray-300">Live Secure Connection</span>
          </div>
          <button 
            type="button"
            onClick={onLogout} 
            className="md:hidden bg-red-950/50 hover:bg-red-900/40 text-red-200 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-red-900/40 transition-all"
          >
            Logout
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl w-full mx-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3 pt-24">
              <span className="text-4xl">🤖</span>
              <p className="text-sm font-medium tracking-wide">Nexus Operational Node Active.<br />Send a message to initialize pipeline stream.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none font-medium' 
                    : 'bg-[#11131e] border border-gray-800/80 text-gray-200 rounded-tl-none font-normal'
                }`}>
                  {/* 🔥 FIXED MARKOV CRASH WRAPPER DIV */}
                  <div className="prose prose-invert max-w-none text-sm space-y-2">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#11131e] border border-gray-800/80 text-gray-400 px-5 py-3.5 rounded-2xl rounded-tl-none text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* INPUT SEND FORM ENGINE */}
        <div className="p-4 border-t border-gray-800/80 bg-[#0d0e15]/40 backdrop-blur-md">
          <form onSubmit={handleSendMessage} className="max-w-3xl w-full mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message to Nexus AI..."
              className="flex-1 bg-[#08090f] border border-gray-800 rounded-xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-600 shadow-inner transition-all duration-200"
              disabled={loading}
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-950/50 disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
          <p className="text-center text-[10px] text-gray-600 mt-2.5 tracking-wider uppercase font-medium">Nexus Engine v1.2.0 Production Build</p>
        </div>
      </div>
    </div>
  );
}
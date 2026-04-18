"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "@/components/Sidebar";
import api, { chatApi, learningApi } from "@/lib/api";
import { 
  Send, 
  Sparkles, 
  UserCircle, 
  Paperclip, 
  FileText, 
  Lightbulb, 
  Zap,
  Info,
  Clock,
  Target,
  ArrowRight,
  Plus,
  MessageCircle,
  AlertCircle
} from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";
import { Document, documentApi } from "@/lib/api";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  created_at: string;
  last_message?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
    const timer = setInterval(() => setSessionTime(prev => prev + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await chatApi.getSessions();
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await documentApi.getAll();
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    setFetchingMessages(true);
    setCurrentSessionId(sessionId);
    try {
      const res = await chatApi.getMessages(sessionId);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
      setError("Failed to load chat history.");
    } finally {
      setFetchingMessages(false);
    }
  };

  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    setError(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await chatApi.sendMessage({
        session_id: currentSessionId || undefined,
        message: input,
        document_ids: selectedDocId ? [selectedDocId] : [],
      });

      const assistantMsg: Message = {
        role: "assistant",
        content: response.data.reply,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      
      if (!currentSessionId) {
        setCurrentSessionId(response.data.session_id);
        fetchSessions(); // Refresh history
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      setError(err.response?.data?.detail || "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-surface min-h-screen font-inter text-on-surface">
      <Sidebar />
      
      {/* Main Chat View */}
      <main className="flex-1 flex flex-col h-screen relative bg-slate-50/30">
        {/* Chat Header */}
        <header className="px-8 py-5 border-b border-surface-container-highest/30 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
              Live Session
            </span>
            <span className="text-sm font-medium text-on-surface-variant">Current: Cognitive Psychology 101</span>
          </div>
          <button className="text-xs font-bold text-primary hover:opacity-80">Focus Mode</button>
        </header>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto px-12 py-8 space-y-10 scrollbar-hide">
          {messages.length === 0 && !fetchingMessages && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40">
              <Sparkles size={48} className="text-primary" />
              <div>
                <h3 className="text-xl font-bold font-manrope">Start a new dialogue</h3>
                <p className="text-sm">Ask anything or select a document to begin.</p>
              </div>
            </div>
          )}

          {fetchingMessages && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={clsx("flex flex-col gap-3", msg.role === "user" ? "items-end" : "items-start")}>
               <div className="flex items-center gap-2 mb-1">
                  {msg.role === "assistant" ? (
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
                      <Sparkles size={16} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <UserCircle size={20} />
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
                    {msg.role === "assistant" ? "Cognitive AI" : "You"}
                  </span>
               </div>

               <div className={clsx(
                 "p-6 rounded-[1.5rem] text-sm leading-relaxed shadow-sm prose prose-sm max-w-[80%]",
                 msg.role === "user" ? "bg-white text-on-surface rounded-tr-none" : "bg-primary text-on-primary rounded-tl-none prose-invert"
               )}>
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
               </div>
            </div>
          ))}
          
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-medium border border-red-100">
               <AlertCircle size={16} />
               {error}
            </div>
          )}
          {loading && <div className="text-xs text-primary animate-pulse font-bold tracking-widest">Cognitive Assistant is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Pill */}
        <div className="px-12 pb-8 pt-4">
           <div className="max-w-4xl mx-auto relative flex items-center">
              <div className="absolute left-6 text-on-surface-variant/40">
                <Paperclip size={20} />
              </div>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask your tutor anything about the current lesson..." 
                className="w-full bg-white border border-surface-container-highest/50 pl-16 pr-24 py-5 rounded-[2rem] shadow-lg shadow-black/[0.03] outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium"
              />
              <button 
                onClick={handleSend}
                className="absolute right-4 bg-[#2D459D] text-white p-3 rounded-2xl hover:opacity-90 transition-all flex items-center justify-center shadow-lg"
              >
                <ArrowRight size={20} strokeWidth={2.5} />
              </button>
           </div>
           <p className="text-center text-[9px] text-on-surface-variant/40 mt-4 font-medium uppercase tracking-widest">
             Cognitive Sanctuary AI may occasionally provide inaccurate educational data. Verify critical facts.
           </p>
        </div>
      </main>

      {/* Right Feature Sidebar */}
      <aside className="w-80 h-screen bg-white border-l border-surface-container-highest/30 px-6 py-8 flex flex-col gap-6 overflow-y-auto">
         <button 
           onClick={startNewChat}
           className="w-full bg-primary text-white py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
         >
           <Plus size={18} />
           New Chat
         </button>

         {/* Chat History */}
         <section>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4 px-1 flex items-center gap-2">
              <Clock size={12} />
              Chat History
            </h5>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {sessions.length === 0 ? (
                <p className="text-[10px] text-on-surface-variant/40 px-1 italic">No previous chats</p>
              ) : (
                sessions.map((s) => (
                  <button 
                    key={s.id}
                    onClick={() => loadSessionMessages(s.id)}
                    className={clsx(
                      "w-full p-3 rounded-xl text-left transition-all border",
                      currentSessionId === s.id 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-white border-transparent hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle size={14} className={currentSessionId === s.id ? "text-primary" : "text-on-surface-variant/40"} />
                      <p className={clsx("text-[11px] font-medium truncate", currentSessionId === s.id ? "text-primary" : "text-on-surface")}>
                        {s.last_message || "New Conversation"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
         </section>

         {/* Active Reference */}
         <section>
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4 px-1 flex items-center gap-2">
              <Target size={12} />
              Active Reference
            </h5>
            <select 
              className="w-full bg-slate-50 border border-surface-container-highest/50 p-3 rounded-xl text-[11px] font-medium outline-none focus:ring-2 focus:ring-primary/20"
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
            >
              <option value="">General Knowledge (No Doc)</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.filename}</option>
              ))}
            </select>
         </section>

         {/* Session Momentum */}
         <section className="mt-auto">
            <div className="bg-[#E4FBF8] p-5 rounded-[2rem] border border-teal-100 flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-teal-600">
                  <Clock size={20} />
               </div>
               <div>
                  <h6 className="text-[10px] font-bold uppercase tracking-widest text-teal-800/50">Session Momentum</h6>
                  <p className="text-2xl font-bold text-teal-900 font-manrope">{sessionTime}m</p>
               </div>
            </div>
         </section>
      </aside>
    </div>
  );
}

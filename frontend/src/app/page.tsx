"use client";

import React, { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { 
  FileText, 
  Layers, 
  HelpCircle, 
  Flame, 
  Play, 
  Share2,
  Search,
  Bell,
  Sparkles,
  ChevronRight
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Dashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [authLoading, token]);

  if (authLoading || loading) return <div className="flex items-center justify-center h-screen bg-surface">Loading Sanctuary...</div>;

  const stats = [
    { name: "Documents uploaded", value: profile?.stats?.documents_uploaded || 0, icon: FileText, color: "text-blue-500" },
    { name: "Flashcards created", value: profile?.stats?.flashcards_created || 0, icon: Layers, color: "text-green-500" },
    { name: "Quizzes completed", value: profile?.stats?.quizzes_completed || 0, icon: HelpCircle, color: "text-orange-500" },
    { name: "Study streak", value: `${profile?.stats?.study_streak || 0} days`, icon: Flame, color: "text-white", bg: "bg-primary" },
  ];

  return (
    <div className="flex bg-surface min-h-screen font-inter text-on-surface overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto px-12 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              placeholder="Search your sanctuary..." 
              className="w-full bg-white/50 border border-surface-container-highest/30 pl-12 pr-4 py-3 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="text-sm font-bold text-primary hover:opacity-80">Focus Mode</button>
            <div className="flex items-center gap-4 text-on-surface-variant/60">
              <Bell size={20} />
              <Sparkles size={20} />
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold overflow-hidden border border-surface-container-highest">
                 {user?.email?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Greeting */}
        <section className="mb-10">
          <h2 className="text-4xl font-manrope font-bold mb-2">
            Good evening, {user?.email?.split('@')[0] || "Scholar"} 👋
          </h2>
          <p className="text-on-surface-variant opacity-70 max-w-2xl">
            Your cognitive sanctuary is prepared. Today's focus is deep comprehension of 
            your {user?.field_of_study || "active modules"}.
          </p>
        </section>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={`p-6 rounded-[2rem] flex flex-col justify-between min-h-[160px] transition-all hover:scale-[1.02] cursor-default ${stat.bg || 'bg-white shadow-sm'}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${stat.bg ? 'bg-white/20' : 'bg-surface-container-low'}`}>
                <stat.icon className={stat.bg ? 'text-white' : stat.color} size={20} />
              </div>
              <div>
                <p className={`text-2xl font-bold font-manrope ${stat.bg ? 'text-white' : ''}`}>{stat.value}</p>
                <p className={`text-sm ${stat.bg ? 'text-white/70' : 'text-on-surface-variant'}`}>{stat.name}</p>
              </div>
            </div>
          ))}
          <div className="absolute right-12 mt-4">
             <button className="flex items-center gap-3 bg-primary/10 text-primary px-6 py-4 rounded-[2rem] font-bold hover:bg-primary/20 transition-all">
                <div className="bg-primary text-white p-1 rounded-lg">
                  <PlusCircle size={16} />
                </div>
                <span>QUICK SESSION<br/><span className="text-[10px] opacity-60">15m Flashcards</span></span>
             </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Continue Learning */}
          <div className="col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-manrope">Continue Learning</h3>
            </div>
            
            <div className="bg-white p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center border border-dashed border-surface-container-highest/50">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-on-surface-variant/30 mb-4">
                 <FileText size={32} />
               </div>
               <h4 className="text-xl font-bold font-manrope mb-2">No Active Modules</h4>
               <p className="text-sm text-on-surface-variant/60 max-w-sm">
                 Upload a document in your library to start your cognitive journey and track your progress here.
               </p>
            </div>
          </div>

          {/* Daily Goal Gauge */}
          <div className="col-span-4 self-start">
             <div className="bg-white p-10 rounded-[2.5rem] shadow-sm flex flex-col items-center text-center border border-surface-container-highest/20">
                <div className="flex items-center justify-between w-full mb-6">
                   <h3 className="font-bold text-lg">Daily Goal</h3>
                   <Sparkles className="text-on-surface-variant/30" size={18} />
                </div>

                <div className="w-32 h-32 rounded-full border-4 border-dashed border-surface-container-highest/30 flex flex-col items-center justify-center mb-6 text-on-surface-variant/40">
                  <span className="text-2xl font-bold font-manrope">0%</span>
                </div>

                <p className="text-sm font-medium leading-relaxed px-4 text-on-surface-variant/60">
                   Start a flashcard or quiz session to set your first daily goal.
                </p>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PlusCircle(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

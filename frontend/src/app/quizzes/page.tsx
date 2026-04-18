"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { learningApi, documentApi, Document } from "@/lib/api";
import { 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  TrendingUp, 
  Zap, 
  BookOpen, 
  Lock,
  Search,
  ChevronRight,
  Clock
} from "lucide-react";
import clsx from "clsx";

interface Question {
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export default function QuizzesPage() {
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0); 
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState("");

  React.useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await documentApi.getAll();
        setDocuments(res.data);
      } catch (err) {
        console.error("Failed to fetch documents", err);
      }
    };
    fetchDocs();
  }, []);

  const handleGenerate = async () => {
    if (!topic && !selectedDocId) return;
    setLoading(true);
    try {
      const docIds = selectedDocId ? [selectedDocId] : undefined;
      const res = await learningApi.generateQuiz(topic || "General Knowledge", docIds, 5);
      if (res.data && res.data.quiz) {
        setQuestions(res.data.quiz);
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[currentIndex]?.correct_option_index) {
      setScore(s => s + 1);
    }
    // Automatically go to next question after 1s
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOption(null);
      }
    }, 1000);
  };

  return (
    <div className="flex bg-surface min-h-screen text-on-surface font-inter">
      <Sidebar />
      
      {/* Main Quiz Area */}
      <main className="flex-1 overflow-y-auto px-12 py-8 relative">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-manrope font-bold">Quiz Atelier</h2>
            <span className="bg-[#E7FAF6] text-[#2EB67D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#D5F5EC]">
              Active Mastery
            </span>
          </div>
          <div className="flex gap-4">
            <select 
              className="bg-white border border-surface-container-highest/30 px-4 py-2 rounded-xl text-sm outline-none"
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
            >
              <option value="">Any Document</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.filename}</option>
              ))}
            </select>
            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={16} />
              <input 
                type="text" 
                placeholder="Topic (e.g. Memory)..." 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="w-full bg-white/50 border border-surface-container-highest/30 pl-10 pr-4 py-2 rounded-xl text-sm outline-none"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </header>

        <section className="mb-10">
            <p className="text-on-surface-variant/80 max-w-xl leading-relaxed text-sm">
                Refine your understanding through curated challenges. Our AI models analyze your cognitive gaps to generate precise, interval-based assessments.
            </p>
        </section>

        <div className="flex gap-10">
          {/* Quiz Content */}
          <div className="flex-1 space-y-8">
            {questions.length === 0 ? (
               <div className="text-center p-12 bg-white rounded-[2.5rem] border border-dashed border-surface-container-highest/50">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant/30">
                     <Target size={32} />
                  </div>
                  <h3 className="text-xl font-bold font-manrope mb-2">No Quiz Generated</h3>
                  <p className="text-sm text-on-surface-variant/60 max-w-sm">
                     Select a document or type a topic above and click Generate to test your knowledge.
                  </p>
               </div>
            ) : (
              <>
                {/* Progress */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-surface-container-highest/20 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50">
                       Question {String(currentIndex + 1).padStart(2, '0')} of {questions.length}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant/50 uppercase">{Math.round((currentIndex / questions.length) * 100)}% Completed</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600/60 rounded-full" style={{ width: `${(currentIndex / questions.length) * 100}%` }} />
                  </div>
                </div>

                {/* Question Card */}
                <div className="bg-white p-10 rounded-[2.5rem] shadow-md border border-surface-container-highest/20 min-h-[500px] flex flex-col">
                   <div className="mb-8">
                      <span className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3 block">
                        Quiz Active
                      </span>
                      <h3 className="text-2xl font-bold font-manrope leading-tight pr-10">
                        {questions[currentIndex]?.question_text}
                      </h3>
                   </div>

                   <div className="space-y-4 flex-1">
                      {questions[currentIndex]?.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          disabled={selectedOption !== null}
                          className={clsx(
                            "w-full p-6 py-5 rounded-2xl text-left text-sm transition-all border-2 flex items-center gap-4 group",
                            selectedOption === idx 
                              ? (idx === questions[currentIndex].correct_option_index ? "bg-primary/5 border-primary text-primary" : "bg-error/5 border-error text-error")
                              : (selectedOption !== null && idx === questions[currentIndex].correct_option_index) 
                                ? "bg-primary/5 border-primary text-primary" // Highlight correct answer if wrong one was picked
                                : "bg-surface-container-lowest border-surface-container-highest/10 hover:border-primary/20"
                          )}
                        >
                          <div className={clsx(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedOption === idx || (selectedOption !== null && idx === questions[currentIndex].correct_option_index)
                              ? (idx === questions[currentIndex].correct_option_index ? "border-primary bg-primary" : "border-error bg-error")
                              : "border-on-surface-variant/30 group-hover:border-primary/50"
                          )}>
                            {(selectedOption === idx || (selectedOption !== null && idx === questions[currentIndex].correct_option_index)) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-medium">{option}</span>
                        </button>
                      ))}
                   </div>
                </div>
              </>
            )}
          </div>

          {/* Performance Sidebar */}
          <aside className="w-80 space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col items-center">
                <div className="w-full flex items-center gap-2 mb-8">
                   <Target size={20} className="text-primary" />
                   <h4 className="font-bold">Current Performance</h4>
                </div>

                <div className="relative w-40 h-40 mb-6">
                   <svg className="w-full h-full -rotate-90">
                    <circle
                      cx="80" cy="80" r="65"
                      stroke="currentColor" strokeWidth="10" fill="transparent"
                      className="text-surface-container-low"
                    />
                    <circle
                      cx="80" cy="80" r="65"
                      stroke="currentColor" strokeWidth="10" fill="transparent"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: 2 * Math.PI * 65,
                        strokeDashoffset: (2 * Math.PI * 65) * (1 - 0.8),
                        transition: 'stroke-dashoffset 0.5s ease-in-out'
                      }}
                      className="text-primary"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-manrope">{score}/{questions.length || 0}</span>
                    <span className="text-[9px] text-primary uppercase font-bold tracking-widest">Correct</span>
                  </div>
                </div>

                <div className="text-center mb-10">
                  <h5 className="text-xl font-bold font-manrope">{questions.length ? Math.round((score/questions.length)*100) : 0}% Accuracy</h5>
                  <p className="text-[10px] text-on-surface-variant/60 font-medium mt-1">Based on current session</p>
                </div>

                <div className="w-full space-y-6 px-2">
                   <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 px-1">
                        <span>Critical Thinking</span>
                        <span className="text-primary">High</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                         <div className="h-full bg-teal-600/60 w-3/4 rounded-full" />
                      </div>
                   </div>
                   <div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2 px-1">
                        <span>Retention Speed</span>
                        <span className="text-on-surface-variant/60">Steady</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                         <div className="h-full bg-slate-300 w-1/2 rounded-full" />
                      </div>
                   </div>
                </div>
             </div>

             <section>
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 px-1">Topic Library</h4>
                 <div className="space-y-3">
                   {/* Empty state for history */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-surface-container-highest/50 text-center">
                      <p className="text-[10px] text-on-surface-variant/50 font-medium">No previous history.</p>
                   </div>
                 </div>
             </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { learningApi, documentApi, Document } from "@/lib/api";
import { 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  CheckCircle2, 
  Clock, 
  RotateCw,
  Search,
  BookOpen,
  TrendingUp,
  FileText
} from "lucide-react";
import clsx from "clsx";

interface Flashcard {
  question: string;
  answer: string;
}

export default function FlashcardsPage() {
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
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
      const res = await learningApi.generateFlashcards(topic || "General Knowledge", docIds, 5);
      if (res.data && res.data.flashcards) {
        setFlashcards(res.data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  return (
    <div className="flex bg-surface min-h-screen text-on-surface font-inter">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto px-12 py-8 relative flex flex-col">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-manrope font-bold">Flashcard Synthesis</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
              Active Recall
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
                Transform your raw materials into active recall modules. Our AI extracts core concepts to help you achieve deep, interval-based memorization.
            </p>
        </section>

        <div className="flex-1 flex gap-10 min-h-0">
          {/* Card Area */}
          {/* Card Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {flashcards.length === 0 ? (
               <div className="text-center p-12 bg-white rounded-[2.5rem] border border-dashed border-surface-container-highest/50">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant/30">
                     <Layers size={32} />
                  </div>
                  <h3 className="text-xl font-bold font-manrope mb-2">No Flashcards Generated</h3>
                  <p className="text-sm text-on-surface-variant/60 max-w-sm">
                     Select a document or type a topic above and click Generate to extract active recall concepts.
                  </p>
               </div>
            ) : (
               <>
                 <div className="absolute top-0 text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant/40">
                    Concept {String(currentIndex + 1).padStart(2, '0')} of {flashcards.length}
                 </div>

                 <div 
                   className="relative w-full max-w-xl aspect-[1.4/1] cursor-pointer perspective-1000 group mb-12"
                   onClick={() => setIsFlipped(!isFlipped)}
                 >
                   <div className={clsx(
                     "relative w-full h-full transition-transform duration-700 preserve-3d shadow-2xl shadow-primary/5",
                     isFlipped && "rotate-y-180"
                   )}>
                     {/* Front */}
                     <div className="absolute inset-0 backface-hidden bg-white p-12 rounded-[2.5rem] border border-surface-container-highest/20 flex flex-col items-center justify-center text-center">
                        <div className="absolute top-10 w-10 h-1 bg-surface-container-low rounded-full" />
                        <h4 className="text-2xl font-bold font-manrope leading-normal">{flashcards[currentIndex]?.question}</h4>
                        <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                           <RotateCw size={12} />
                           Click to Flip
                        </div>
                     </div>
                     
                     {/* Back */}
                     <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#2D459D] p-12 rounded-[2.5rem] flex flex-col items-center justify-center text-center text-white">
                        <span className="absolute top-10 text-[10px] font-bold uppercase tracking-widest text-white/50">Response</span>
                        <p className="text-xl font-medium leading-relaxed overflow-y-auto">{flashcards[currentIndex]?.answer}</p>
                     </div>
                   </div>
                 </div>

                 <div className="flex items-center gap-12">
                    <button onClick={prevCard} className="w-14 h-14 rounded-2xl bg-white border border-surface-container-highest shadow-sm flex items-center justify-center text-on-surface-variant/60 hover:text-primary transition-all">
                       <ChevronLeft size={24} />
                    </button>

                    <div className="flex gap-3">
                       <button className="bg-surface-container-low text-on-surface-variant px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">
                          I don't know yet
                       </button>
                       <button className="bg-primary text-white px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
                          Mastered
                       </button>
                    </div>

                    <button onClick={nextCard} className="w-14 h-14 rounded-2xl bg-white border border-surface-container-highest shadow-sm flex items-center justify-center text-primary transition-all">
                       <ChevronRight size={24} />
                    </button>
                 </div>
               </>
            )}
          </div>

          {/* Status Sidebar */}
          <aside className="w-80 space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-8">
                   <TrendingUp size={20} className="text-primary" />
                   <h4 className="font-bold">Mastery Progress</h4>
                </div>

                <div className="space-y-6">
                   <div>
                      <div className="flex justify-between text-[11px] font-bold mb-2">
                        <span>Current Deck</span>
                        <span className="text-primary">40%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-[40%] rounded-full" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mt-8">
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                         <p className="text-xl font-bold font-manrope text-teal-600">12</p>
                         <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase">Mastered</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl text-center">
                         <p className="text-xl font-bold font-manrope text-on-surface-variant/40">18</p>
                         <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase">To Go</p>
                      </div>
                   </div>
                </div>
             </div>

             <section>
                <h4 className="text-[11px] font-bold uppercase tracking-widest mb-6 px-1">Synthesis History</h4>
                 <div className="space-y-3">
                   {/* Empty State for History */}
                   <div className="bg-white p-6 rounded-2xl shadow-sm border border-dashed border-surface-container-highest/50 text-center">
                      <p className="text-[10px] text-on-surface-variant/50 font-medium">No previous history.</p>
                   </div>
                 </div>
             </section>
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

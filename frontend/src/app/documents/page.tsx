"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { documentApi, Document } from "@/lib/api";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Trash2, 
  Search,
  Bell,
  Sparkles,
  MoreVertical,
  Plus,
  AlertCircle,
  X
} from "lucide-react";
import clsx from "clsx";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await documentApi.getAll();
      setDocuments(res.data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocs();
    const interval = setInterval(fetchDocs, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await documentApi.upload(formData);
      fetchDocs();
    } catch (err: any) {
      console.error("Upload failed", err);
      setError(err.response?.data?.detail || "Upload failed. Please check your network connection.");
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  return (
    <div className="flex bg-surface min-h-screen text-on-surface font-inter overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto px-12 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={18} />
            <input 
              type="text" 
              placeholder="Search your library..." 
              className="w-full bg-white/50 border border-surface-container-highest/30 pl-12 pr-4 py-3 rounded-2xl outline-none"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-on-surface-variant/60">
              <Bell size={20} />
              <Sparkles size={20} className="text-primary" />
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center justify-between text-red-700 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-full">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-manrope font-bold mb-2">My Library</h2>
            <p className="text-on-surface-variant opacity-70">
                Manage your digital vault of knowledge modules and research notes.
            </p>
          </div>
          <label className={clsx(
            "bg-primary text-on-primary px-6 py-3 rounded-2xl font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-95",
            isUploading && "opacity-50 pointer-events-none"
          )}>
            <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.ppt,.pptx" />
            <Plus size={18} strokeWidth={3} />
            <span>Upload Document</span>
          </label>
        </section>

        <div className="grid grid-cols-1 gap-4">
           {documents.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] shadow-sm border border-dashed border-surface-container-highest/50 flex flex-col items-center justify-center text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-on-surface-variant/20 mb-6">
                    <FileText size={40} />
                 </div>
                 <h3 className="text-xl font-bold font-manrope">Empty Vault</h3>
                 <p className="text-sm text-on-surface-variant/50 mt-2 max-w-xs">
                    Start by uploading your first research paper or study module to begin your journey.
                 </p>
              </div>
           ) : (
             <div className="grid grid-cols-3 gap-6">
               {documents.map((doc) => (
                 <div key={doc.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-surface-container-highest/20 group hover:scale-[1.02] transition-all">
                    <div className="flex items-start justify-between mb-6">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-on-surface-variant/40">
                          <FileText size={24} />
                       </div>
                       <button className="text-on-surface-variant/30 hover:text-on-surface transition-colors">
                          <MoreVertical size={20} />
                       </button>
                    </div>

                    <div className="mb-10">
                       <h4 className="font-bold text-lg leading-tight mb-2 truncate" title={doc.filename}>{doc.filename}</h4>
                       <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.file_type.split("/")[1]?.toUpperCase() || 'PDF'}
                       </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                       <div className={clsx(
                         "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-tight",
                         doc.status === "SUCCESS" && "bg-teal-50 text-teal-600",
                         doc.status === "PROCESSING" && "bg-primary/5 text-primary animate-pulse",
                         doc.status === "FAILED" && "bg-error/5 text-error",
                       )} title={doc.error_message}>
                         {doc.status === "SUCCESS" && <CheckCircle size={12} />}
                         {doc.status === "PROCESSING" && <Clock size={12} />}
                         {doc.status === "FAILED" && <XCircle size={12} />}
                         {doc.status}
                       </div>
                       
                       {doc.status === "FAILED" && doc.error_message && (
                         <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-error text-white text-[10px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {doc.error_message}
                         </div>
                       )}
                       
                       <button 
                         className="p-2 text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-error transition-all"
                         onClick={() => {/* Implement Delete */}}
                       >
                         <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </main>
    </div>
  );
}

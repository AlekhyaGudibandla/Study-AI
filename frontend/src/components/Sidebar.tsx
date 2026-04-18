"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Files, 
  Layers, 
  HelpCircle, 
  TrendingUp, 
  Settings,
  PlusCircle,
  UserCircle
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();

  const links = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Documents", href: "/documents", icon: Files },
    { name: "Flashcards", href: "/flashcards", icon: Layers },
    { name: "Quizzes", href: "/quizzes", icon: HelpCircle },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-white flex flex-col pt-8 pb-6 px-4 border-r border-surface-container-highest/20 transition-all duration-300">
      <div className="mb-10 px-4">
        <h1 className="text-xl font-bold font-manrope text-primary tracking-tight leading-tight">
          The Sanctuary
        </h1>
        <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-[0.2em]">Digital Atelier</p>
      </div>
      
      <nav className="flex-1 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm transition-all duration-200",
                isActive 
                  ? "font-semibold bg-primary/10 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              )}
            >
              <Icon size={20} className={isActive ? "text-primary" : "text-on-surface-variant/60"} strokeWidth={isActive ? 2.5 : 2} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <button 
          onClick={() => router.push("/documents")}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-2xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
        >
          <PlusCircle size={18} />
          <span>Upload</span>
        </button>

        <div className="flex items-center gap-3 px-4 py-3 pt-6 border-t border-surface-container-highest/50">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary">
            <UserCircle size={28} />
          </div>
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold truncate">{user?.email?.split('@')[0] || "Scholar"}</p>
            <p className="text-[10px] text-on-surface-variant font-medium">Profile</p>
          </div>
        </div>
      </div>
    </div>
  );
}

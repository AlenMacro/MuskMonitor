import React from 'react';
import { Bot, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur-2xl pt-[env(safe-area-inset-top)] transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-5 px-6 sm:px-8 md:px-12">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative p-3 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl group-hover:border-blue-500/30 transition-colors">
              <Bot className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">
              MuskMonitor <span className="text-blue-500 font-extrabold">AI</span>
            </h1>
            <p className="text-[11px] text-neutral-500 font-mono mt-1.5 tracking-widest uppercase">
              Intel Ops • ID: MM-X42
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/10 shadow-[0_0_20px_-5px_rgba(16,185,129,0.15)] backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline text-xs font-bold text-emerald-500 tracking-wide">SYSTEM ONLINE</span>
          </div>
          <div className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
             <Zap className="w-5 h-5 text-amber-500 fill-amber-500/20" />
          </div>
        </div>
      </div>
    </header>
  );
};
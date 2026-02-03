import React from 'react';
import { AgentStatus } from '../types';
import { Play, Loader2, Clock, CheckCircle2 } from 'lucide-react';

interface StatusCardProps {
  status: AgentStatus;
  lastRun: string | null;
  onRunAgent: () => void;
}

export const StatusCard: React.FC<StatusCardProps> = ({ status, lastRun, onRunAgent }) => {
  const isRunning = status !== AgentStatus.IDLE && status !== AgentStatus.COMPLETE && status !== AgentStatus.ERROR;

  // Calculate next run
  let nextRunText = "Now";
  let isDue = true;
  
  if (lastRun) {
    const lastDate = new Date(lastRun);
    const nextDate = new Date(lastDate.getTime() + 48 * 60 * 60 * 1000); // + 48 hours
    const now = new Date();
    
    if (nextDate > now) {
      isDue = false;
      nextRunText = nextDate.toLocaleString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case AgentStatus.COMPLETE: return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10';
      case AgentStatus.ERROR: return 'text-red-400 border-red-500/20 bg-red-500/10';
      case AgentStatus.IDLE: return 'text-neutral-400 border-neutral-700/50 bg-neutral-800/50';
      default: return 'text-blue-400 border-blue-500/20 bg-blue-500/10';
    }
  };

  return (
    <div className={`glass-panel rounded-[2rem] p-8 relative overflow-hidden group transition-all duration-500`}>
      {/* Dynamic Background Glow */}
      <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] -mr-24 -mt-24 pointer-events-none transition-opacity duration-1000 ${
        isRunning ? 'bg-blue-600/15 opacity-100' : 'bg-emerald-600/5 opacity-40'
      }`}></div>
      
      {/* Header */}
      <div className="relative flex justify-between items-start mb-10">
        <div>
          <h2 className="text-xl font-bold text-white mb-1.5 tracking-tight">Agent Status</h2>
          <p className="text-xs text-neutral-400 font-medium">Automated Intelligence Gathering</p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${getStatusColor()}`}>
          {status}
        </div>
      </div>

      {/* Metrics */}
      <div className="relative grid grid-cols-2 gap-5 mb-10">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-3">Target Subject</p>
          <div className="flex items-center gap-2.5 text-white font-semibold text-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Elon Musk
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-3">Next Scheduled</p>
          <div className={`flex items-center gap-2 font-semibold text-sm ${isDue ? 'text-emerald-400' : 'text-neutral-200'}`}>
            <Clock className={`w-4 h-4 ${isDue ? 'text-emerald-400' : 'text-neutral-500'}`} />
            {isDue && !lastRun ? "Immediate" : nextRunText}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="relative z-10">
        <button
          onClick={onRunAgent}
          disabled={isRunning}
          className={`w-full group relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 overflow-hidden ${
            isRunning 
              ? 'bg-neutral-800/50 text-neutral-400 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 border border-blue-400/20 hover:-translate-y-0.5'
          }`}
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
              <span>Processing Request...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>{isDue ? "Execute Run Sequence" : "Force New Run"}</span>
            </>
          )}
        </button>

        {/* Status Details / Last Run */}
        {!isRunning && (
          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-600" />
            <span>Last successful run: <span className="text-neutral-300">{lastRun ? new Date(lastRun).toLocaleDateString() : 'Never'}</span></span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className={`mt-8 transition-all duration-700 ${isRunning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none absolute bottom-0 left-0 right-0 p-8'}`}>
        <div className="flex justify-between text-[10px] font-bold text-blue-300 mb-2.5 uppercase tracking-widest">
          <span>Progress</span>
          <span className="animate-pulse">
            {status === AgentStatus.SEARCHING && "Scouting Intel..."}
            {status === AgentStatus.SUMMARIZING && "Synthesizing..."}
            {status === AgentStatus.TRANSLATING && "Finalizing Report..."}
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
            <div className={`h-full bg-gradient-to-r from-blue-500 via-blue-400 to-emerald-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-1000 ease-in-out ${
              status === AgentStatus.SEARCHING ? 'w-[35%]' :
              status === AgentStatus.SUMMARIZING ? 'w-[75%]' :
              status === AgentStatus.TRANSLATING ? 'w-[92%]' : 'w-0'
            }`}></div>
        </div>
      </div>
    </div>
  );
};
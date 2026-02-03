import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatusCard } from './components/StatusCard';
import { ReportView } from './components/ReportView';
import { generateNewsReport } from './services/geminiService';
import { AgentStatus, AgentReport, StreamUpdate } from './types';
import { Globe, AlertCircle, Radar } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<AgentStatus>(AgentStatus.IDLE);
  const [report, setReport] = useState<Partial<AgentReport> | null>(null);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [nextRunDue, setNextRunDue] = useState<boolean>(false);

  // Load state from local storage on mount
  useEffect(() => {
    const savedLastRun = localStorage.getItem('mm_last_run');
    if (savedLastRun) {
      setLastRun(savedLastRun);
      checkIfDue(savedLastRun);
    }
  }, []);

  const checkIfDue = (lastRunDate: string) => {
    const last = new Date(lastRunDate).getTime();
    const now = new Date().getTime();
    const hoursDiff = (now - last) / (1000 * 60 * 60);
    if (hoursDiff >= 48) {
      setNextRunDue(true);
    } else {
      setNextRunDue(false);
    }
  };

  const handleRunAgent = async () => {
    // Reset state
    setStatus(AgentStatus.SEARCHING);
    setReport(null);

    try {
      // Pass a callback to receive partial updates
      const finalReport = await generateNewsReport((update: StreamUpdate) => {
        if (update.stage === 'WRITING') {
          setStatus(AgentStatus.SUMMARIZING); // Translating visual to "Writing/Summarizing"
          if (update.partialReport) {
             setReport(update.partialReport);
          }
        }
      });
      
      setStatus(AgentStatus.COMPLETE);
      setReport(finalReport);
      
      const now = new Date().toISOString();
      setLastRun(now);
      localStorage.setItem('mm_last_run', now);
      setNextRunDue(false);

    } catch (error) {
      console.error(error);
      setStatus(AgentStatus.ERROR);
    }
  };

  return (
    <div className="min-h-screen pb-[env(safe-area-inset-bottom)] relative overflow-x-hidden font-sans selection:bg-blue-500/30">
      <Header />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 pt-10 pb-32">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Left Column: Status & Control */}
          <div className="lg:col-span-4 space-y-8 sticky top-32 self-start">
            <StatusCard 
              status={status} 
              lastRun={lastRun} 
              onRunAgent={handleRunAgent} 
            />
            
            <div className="glass-panel rounded-3xl p-8 border border-white/5 bg-white/[0.02]">
               <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Radar className="w-4 h-4 text-blue-500" />
                 Active Monitoring Scope
               </h3>
               <div className="flex flex-wrap gap-3">
                  {[
                    'Personal Life & Travel',
                    'xAI / Grok / X', 
                    'Tesla / SpaceX', 
                    'Neuralink / Boring', 
                    '@elonmusk Tweets'
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:border-white/10 transition-all cursor-default">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
                      <span>{item}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {status === AgentStatus.IDLE && !report && (
              <div className={`min-h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-[2rem] transition-all border backdrop-blur-sm ${
                nextRunDue 
                  ? 'border-emerald-500/20 bg-emerald-900/5' 
                  : 'border-white/5 bg-white/[0.02]'
              }`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 shadow-2xl ${
                  nextRunDue ? 'bg-emerald-500/10' : 'bg-[#111] border border-white/5'
                }`}>
                  {nextRunDue ? <AlertCircle className="w-12 h-12 text-emerald-500" /> : <Globe className="w-12 h-12 text-neutral-600" />}
                </div>
                <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                  {nextRunDue ? "Update Required" : "System Standby"}
                </h3>
                <p className="text-neutral-400 max-w-lg text-base leading-relaxed mb-10">
                  {nextRunDue 
                    ? "The 48-hour cycle has elapsed. Initiate a new scan to generate the latest intelligence briefing."
                    : "MuskMonitor is ready to deploy agents. Click 'Run Now' to scout global news sources and generate a briefing."}
                </p>
                <button 
                  onClick={handleRunAgent}
                  className="px-10 py-4 rounded-full bg-white text-black font-bold text-sm tracking-wide hover:scale-105 hover:shadow-xl hover:shadow-white/10 transition-all duration-300"
                >
                  {nextRunDue ? "Update Now" : "Start Agent"}
                </button>
              </div>
            )}
            
            {(status === AgentStatus.ERROR) && (
              <div className="p-8 bg-red-900/10 border border-red-500/20 rounded-3xl text-red-200 text-center backdrop-blur-xl">
                <AlertCircle className="w-10 h-10 mx-auto mb-4 text-red-500" />
                <h3 className="font-bold text-lg mb-2">Connection Error</h3>
                <p className="text-base opacity-80 max-w-md mx-auto">Unable to retrieve intelligence. Please check your network connection and API key configuration.</p>
              </div>
            )}

            {/* Display Report */}
            {report && <ReportView report={report} isWriting={status === AgentStatus.SUMMARIZING} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
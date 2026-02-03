import React from 'react';
import { AgentReport } from '../types';
import { ExternalLink, FileText, Download, Globe, Loader2, MessageCircle, Share2, Heart, Repeat2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ReportViewProps {
  report: Partial<AgentReport>;
  isWriting?: boolean;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, isWriting = false }) => {

  const hasBody = !!report.germanBody && report.germanBody.length > 0;
  const hasFacts = !!report.keyFacts && report.keyFacts.length > 0;
  const hasSources = !!report.sources && report.sources.length > 0;
  const hasTweet = !!report.tweet && !!report.tweet.text;

  const generatePDF = () => {
    if (!hasBody || !report.keyFacts || !report.sources) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 25;

    // Helper to add text and update Y position
    const addText = (text: string, fontSize: number, fontStyle: string = 'normal', color: [number, number, number] = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontStyle);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const splitText = doc.splitTextToSize(text, contentWidth);
      doc.text(splitText, margin, yPos);
      yPos += (splitText.length * fontSize * 0.45) + 6; // Increased line height
      
      // Page break check
      if (yPos > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // --- Header ---
    addText("MuskMonitor Daily Report", 24, "bold", [30, 41, 59]); 
    yPos += 2;
    addText(`Generated: ${new Date(report.generatedAt || new Date()).toLocaleString('de-DE')}`, 10, "normal", [100, 116, 139]);
    yPos += 12;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

    // --- Subject ---
    if (report.germanSubject) {
        addText(report.germanSubject, 16, "bold", [20, 20, 20]);
        yPos += 8;
    }

    // --- Key Facts Section ---
    doc.setFillColor(245, 255, 250); // Very light emerald
    const factHeight = (report.keyFacts!.length * 10) + 20;
    doc.rect(margin, yPos, contentWidth, factHeight, 'F');
    yPos += 8;
    
    addText("WICHTIGE FAKTEN", 11, "bold", [16, 185, 129]); // Emerald Green
    yPos += 2;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    
    report.keyFacts!.forEach(fact => {
      const bullet = "•";
      const indent = 6;
      const textLines = doc.splitTextToSize(fact, contentWidth - indent - 4);
      doc.text(bullet, margin + 4, yPos);
      doc.text(textLines, margin + indent + 4, yPos);
      yPos += (textLines.length * 7) + 3;
    });
    yPos += 15;

    // --- Tweet Section ---
    if (report.tweet && report.tweet.text) {
        // Ensure tweet fits
        const tweetLines = doc.splitTextToSize(report.tweet.text, contentWidth - 16);
        const tweetBoxHeight = (tweetLines.length * 6) + 35;
        
        if (yPos + tweetBoxHeight > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage();
            yPos = margin;
        }

        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPos, contentWidth, tweetBoxHeight, 'F');
        doc.setDrawColor(230, 230, 230);
        doc.rect(margin, yPos, contentWidth, tweetBoxHeight, 'S');
        yPos += 10;

        addText("LATEST TWEET (@elonmusk)", 10, "bold", [0, 0, 0]);
        yPos += 2;
        
        doc.setFont("helvetica", "italic");
        doc.setFontSize(11);
        doc.setTextColor(40, 40, 40);
        
        doc.text(tweetLines, margin + 8, yPos);
        yPos += (tweetLines.length * 6) + 8;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(report.tweet.date, margin + 8, yPos);
        
        yPos += 20;
    }

    // --- Main Body ---
    addText("ZUSAMMENFASSUNG", 11, "bold", [37, 99, 235]); // Blue
    yPos += 2;
    const cleanBody = (report.germanBody || "").replace(/\*\*/g, "").replace(/#/g, "");
    addText(cleanBody, 12, "normal", [40, 40, 40]);
    yPos += 12;

    // --- Sources Footer ---
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    addText("QUELLEN (Sources)", 10, "bold", [100, 100, 100]);
    
    report.sources!.forEach(source => {
      if (yPos > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.setTextColor(37, 99, 235);
      doc.setFontSize(9);
      doc.textWithLink(source.title.substring(0, 90) + "...", margin, yPos, { url: source.uri });
      yPos += 6;
    });

    doc.save(`MuskMonitor_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
      
      {/* 1. Key Facts Summary */}
      {hasFacts && (
        <div className="glass-panel rounded-[2rem] p-8 animate-fade-in-up">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/10">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="font-bold text-white text-lg tracking-tight">Key Intel <span className="text-emerald-500 text-xs uppercase ml-2 font-mono tracking-wider bg-emerald-500/10 px-2 py-1 rounded-lg">Verified</span></h3>
            </div>
          </div>
          <ul className="space-y-5">
            {report.keyFacts!.map((fact, idx) => (
              <li key={idx} className="flex gap-5 group">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-sm font-bold border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-neutral-300 text-base leading-relaxed group-hover:text-white transition-colors pt-0.5">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. Tweet Highlight (X Card Design) */}
      {hasTweet && (
        <div className="bg-black border border-[#2f3336] rounded-2xl overflow-hidden animate-fade-in-up delay-100 max-w-2xl mx-auto md:mx-0 shadow-2xl hover:bg-neutral-900/40 transition-colors">
          <a href={report.tweet!.url} target="_blank" rel="noopener noreferrer" className="block p-6 flex gap-4 no-underline group/card">
             {/* Fake Avatar */}
             <div className="w-12 h-12 rounded-full bg-neutral-700 flex-shrink-0 overflow-hidden border border-neutral-800">
                <img src="https://pbs.twimg.com/profile_images/1780044485541699584/p78MCn3B_400x400.jpg" alt="Elon" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png")} />
             </div>
             <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[15px] leading-5 truncate">
                      <span className="font-bold text-[#e7e9ea] truncate text-base group-hover/card:underline decoration-white/50">Elon Musk</span>
                      <svg viewBox="0 0 24 24" aria-label="Verified account" className="w-5 h-5 text-[#1d9bf0] fill-current"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .495.083.965.238 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z"></path></g></svg>
                      <span className="text-[#71767b] font-normal ml-0.5 text-sm">@elonmusk</span>
                      <span className="text-[#71767b] font-normal mx-1">·</span>
                      <span className="text-[#71767b] font-normal text-sm">{report.tweet!.date}</span>
                   </div>
                   <div className="text-[#71767b]">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] rounded-full p-1 transition-colors"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>
                   </div>
                </div>
                
                {/* Tweet Body */}
                <div className="mt-3 text-[16px] text-[#e7e9ea] whitespace-pre-wrap leading-snug">
                   {report.tweet!.text}
                </div>

                {/* Tweet Actions (Visual Only) */}
                <div className="mt-4 flex justify-between max-w-[85%] text-[#71767b]">
                   <div className="flex items-center gap-2 group cursor-pointer hover:text-[#1d9bf0] transition-colors">
                      <div className="p-2 -ml-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <span className="text-sm">12K</span>
                   </div>
                   <div className="flex items-center gap-2 group cursor-pointer hover:text-[#00ba7c] transition-colors">
                      <div className="p-2 -ml-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                        <Repeat2 className="w-5 h-5" />
                      </div>
                      <span className="text-sm">4.5K</span>
                   </div>
                   <div className="flex items-center gap-2 group cursor-pointer hover:text-[#f91880] transition-colors">
                      <div className="p-2 -ml-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                        <Heart className="w-5 h-5" />
                      </div>
                      <span className="text-sm">85K</span>
                   </div>
                   <div className="flex items-center gap-2 group cursor-pointer hover:text-[#1d9bf0] transition-colors">
                      <div className="p-2 -ml-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                        <Share2 className="w-5 h-5" />
                      </div>
                   </div>
                </div>
             </div>
          </a>
        </div>
      )}

      {/* 3. Sources Grid */}
      {hasSources && (
        <div className="glass-panel rounded-[2rem] p-8 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-4">
                <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/10">
                  <Globe className="w-6 h-6 text-blue-500" />
                </div>
                <h4 className="font-bold text-white text-lg">Sources</h4>
             </div>
             <div className="px-3 py-1.5 bg-neutral-900 rounded-lg text-xs text-neutral-400 font-mono border border-white/5">
               {report.sources!.length} VERIFIED LINKS
             </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {report.sources!.map((source, idx) => (
              <a 
                key={idx} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col justify-between p-5 rounded-2xl bg-neutral-900/50 hover:bg-blue-600/10 transition-all border border-white/5 hover:border-blue-500/30 hover:-translate-y-1 active:scale-[0.98]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-blue-400 font-bold truncate max-w-[80%] opacity-80 group-hover:opacity-100">
                      {new URL(source.uri).hostname.replace('www.', '')}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-600 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-neutral-300 line-clamp-3 group-hover:text-white transition-colors leading-relaxed">
                    {source.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 4. Detailed Report Body */}
      {hasBody ? (
        <div className="bg-[#e5e5e5] rounded-[2rem] overflow-hidden shadow-2xl animate-fade-in-up delay-300 transform transition-all">
          <div className="bg-gradient-to-b from-white to-neutral-50 border-b border-neutral-200 px-8 py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-2">Detailed Briefing Subject</p>
               <h2 className="text-xl text-neutral-900 font-bold leading-tight max-w-xl">{report.germanSubject}</h2>
            </div>
            <button 
                onClick={generatePDF}
                className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
            </button>
          </div>
          
          <div className="p-8 md:p-12 bg-white min-h-[500px]">
             <div className="prose prose-lg prose-neutral max-w-none text-neutral-800 whitespace-pre-wrap leading-loose font-serif">
               {report.germanBody}
             </div>
             
             <div className="mt-16 pt-8 border-t border-neutral-100 flex items-center justify-between text-neutral-400 text-xs font-mono">
               <span>Generated by MuskMonitor AI v1.0</span>
               <span>{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}</span>
             </div>
          </div>
        </div>
      ) : isWriting ? (
        <div className="glass-panel border-dashed border-neutral-700/50 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center animate-pulse">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-8">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
          <h3 className="text-white font-bold mb-3 text-xl">Synthesizing Intel Report...</h3>
          <p className="text-neutral-500 text-base max-w-sm mx-auto leading-relaxed">Cross-referencing global news sources, translating data, and compiling the German summary.</p>
        </div>
      ) : null}

    </div>
  );
};
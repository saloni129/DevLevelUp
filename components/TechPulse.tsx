
import React, { useState, useEffect } from 'react';
import { UserProfile, TechNewsResponse } from '../types';
import { fetchTechNews } from '../services/geminiService';

interface TechPulseProps {
  profile: UserProfile;
}

const TechPulse: React.FC<TechPulseProps> = ({ profile }) => {
  const [news, setNews] = useState<TechNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const getNews = async () => {
    setLoading(true);
    try {
      const data = await fetchTechNews(profile.role);
      setNews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getNews();
  }, [profile.role]);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Industry Pulse</h2>
          <p className="text-slate-500 text-lg font-medium">Real-time market signals for {profile.role} engineering.</p>
        </div>
        <button 
          onClick={getNews}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[25px] font-black text-sm flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
        >
          <i className={`fas fa-arrows-rotate ${loading ? 'animate-spin' : ''}`}></i>
          REFRESH PULSE
        </button>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="bg-white h-64 rounded-[40px] border border-slate-50 animate-pulse shadow-sm p-8 space-y-4">
                <div className="w-1/3 h-4 bg-slate-100 rounded-full"></div>
                <div className="w-full h-8 bg-slate-100 rounded-full"></div>
                <div className="w-full h-24 bg-slate-50 rounded-[20px]"></div>
             </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-slate-900 rounded-[50px] p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-amber-400 text-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                         <i className="fas fa-bolt"></i>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Intelligence Overview</span>
                   </div>
                   <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: news?.text.replace(/\n/g, '<br/>') || '' }} />
                   </div>
                </div>
                <i className="fas fa-microchip absolute -bottom-20 -right-20 text-white/5 text-[300px] pointer-events-none"></i>
             </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] px-4">Verified Source Links</h3>
            <div className="space-y-4">
               {news?.sources.map((source, i) => (
                 <a 
                   key={i} 
                   href={source.uri} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="block bg-white p-7 rounded-[35px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                 >
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">Verified Report</span>
                       <i className="fas fa-arrow-up-right-from-square text-[10px] text-slate-300 group-hover:text-indigo-600"></i>
                    </div>
                    <p className="font-black text-slate-800 text-base mb-3 leading-tight group-hover:text-indigo-600">{source.title}</p>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2">{source.uri}</p>
                 </a>
               ))}
            </div>
            
            <div className="bg-indigo-50 p-8 rounded-[40px] border border-indigo-100 border-dashed text-center">
               <p className="text-xs font-bold text-indigo-700 italic">"Stay informed to stay relevant. Market demand shifts every quarter."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechPulse;

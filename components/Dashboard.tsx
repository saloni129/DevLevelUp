
import React, { useState } from 'react';
import { UserProfile, SkillGap, RoadmapItem, DashboardTab } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getQuickStudyContent } from '../services/geminiService';

interface DashboardProps {
  profile: UserProfile;
  gaps: SkillGap[];
  roadmap: RoadmapItem[];
  onTabChange: (tab: DashboardTab) => void;
  onUpdateRoadmap: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, gaps, roadmap, onTabChange, onUpdateRoadmap }) => {
  const [activeRoadmapItem, setActiveRoadmapItem] = useState<string | null>(null);
  const [studyResource, setStudyResource] = useState<{name: string, topic: string} | null>(null);
  const [studyContent, setStudyContent] = useState<string | null>(null);
  const [loadingStudy, setLoadingStudy] = useState(false);

  const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
  const sortedRoadmap = [...roadmap].sort((a, b) => 
    (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 99) - 
    (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 99)
  );

  const chartData = gaps.map(g => ({
    name: g.skill,
    level: g.gapLevel === 'High' ? 100 : g.gapLevel === 'Medium' ? 60 : 30
  }));

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    }
  };

  const handleResourceClick = async (resourceName: string, topic: string) => {
    // If it's a URL, open it.
    if (resourceName.startsWith('http') || resourceName.includes('.com') || resourceName.includes('.org')) {
      const url = resourceName.startsWith('http') ? resourceName : `https://${resourceName}`;
      window.open(url, '_blank');
      return;
    }

    // Otherwise, generate a quick study guide
    setStudyResource({ name: resourceName, topic });
    setLoadingStudy(true);
    setStudyContent(null);
    try {
      const content = await getQuickStudyContent(resourceName, topic);
      setStudyContent(content);
    } catch (e) {
      setStudyContent("Failed to load study material. Please try again.");
    } finally {
      setLoadingStudy(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Quick Study Modal */}
      {studyResource && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="bg-indigo-600 p-8 text-white flex justify-between items-center shrink-0">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 block mb-1">AI Fast Track Study</span>
                   <h4 className="text-2xl font-black">{studyResource.name}</h4>
                </div>
                <button 
                  onClick={() => setStudyResource(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <i className="fas fa-xmark"></i>
                </button>
             </div>
             <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                {loadingStudy ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-xs font-black uppercase tracking-widest">Synthesizing resources...</p>
                  </div>
                ) : (
                  <div className="prose prose-slate max-w-none prose-headings:font-black prose-p:leading-relaxed prose-li:font-medium">
                     <div dangerouslySetInnerHTML={{ __html: studyContent?.replace(/\n/g, '<br/>') || '' }} />
                  </div>
                )}
             </div>
             <div className="p-8 border-t border-slate-50 shrink-0">
                <button 
                   onClick={() => setStudyResource(null)}
                   className="w-full bg-slate-900 text-white py-4 rounded-[20px] font-black text-sm"
                >
                   GOT IT, BACK TO ROADMAP
                </button>
             </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Growth Dashboard</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Tracking {profile.level} {profile.role} trajectory</p>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="bg-white px-8 py-5 rounded-[30px] shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-105">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shadow-inner">
              <i className="fas fa-chart-line"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Global Ranking</p>
              <p className="font-black text-slate-900 text-2xl">Top 15%</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-[18px] flex items-center justify-center">
                <i className="fas fa-fingerprint"></i>
              </div>
              Technical Competency Matrix
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={11} fontWeight="black" tickLine={false} axisLine={false} dy={15} />
                  <Tooltip 
                    cursor={{fill: '#f1f5f9'}} 
                    contentStyle={{ borderRadius: '30px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '24px' }} 
                  />
                  <Bar dataKey="level" radius={[15, 15, 15, 15]} barSize={55}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.level > 70 ? '#f43f5e' : entry.level > 40 ? '#f59e0b' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              {gaps.map(gap => (
                <div key={gap.skill} className="flex gap-5 p-7 bg-slate-50 rounded-[35px] border border-slate-100 transition-all hover:bg-white hover:shadow-xl group">
                  <div className={`w-4 h-4 rounded-full mt-2.5 shrink-0 shadow-lg group-hover:scale-125 transition-transform ${gap.gapLevel === 'High' ? 'bg-rose-500' : gap.gapLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                  <div>
                    <p className="text-lg font-black text-slate-900 mb-2">{gap.skill}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{gap.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white p-10 rounded-[45px] shadow-sm border border-slate-100 flex flex-col min-h-[650px]">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-[18px] flex items-center justify-center">
                <i className="fas fa-route"></i>
              </div>
              Personalized Path
            </h3>
            <div className="space-y-5 flex-1 overflow-y-auto pr-4 custom-scrollbar">
              {sortedRoadmap.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setActiveRoadmapItem(activeRoadmapItem === item.id ? null : item.id)}
                  className={`p-7 rounded-[35px] border-2 cursor-pointer transition-all duration-300 ${activeRoadmapItem === item.id ? 'border-indigo-600 bg-indigo-50/20 ring-[10px] ring-indigo-50 shadow-2xl scale-[1.02]' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border-2 ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{item.type}</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-5">{item.topic}</h4>
                  
                  {activeRoadmapItem === item.id ? (
                    <div className="animate-in slide-in-from-top-4 duration-500">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fas fa-graduation-cap"></i>
                        Study Resources
                      </p>
                      <ul className="space-y-3">
                        {item.resources.map((res, i) => (
                          <li 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); handleResourceClick(res, item.topic); }}
                            className="flex items-center gap-4 p-4 bg-white rounded-[20px] border border-indigo-100 group hover:border-indigo-500 hover:shadow-lg transition-all"
                          >
                            <i className="fas fa-circle-play text-indigo-400 group-hover:text-indigo-600 group-hover:scale-125 transition-transform"></i>
                            <span className="text-xs font-bold text-slate-800">{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 mt-5 opacity-40">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center">
                            <i className="fas fa-book-open text-[9px] text-slate-400"></i>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Open to study</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={() => onTabChange('interviews')}
              className="w-full mt-10 bg-indigo-600 text-white py-6 rounded-[30px] font-black text-base flex items-center justify-center gap-4 hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-100 active:scale-95 group"
            >
              <i className="fas fa-microphone-lines group-hover:scale-125 transition-transform"></i>
              SIMULATE INTERVIEW
            </button>
          </div>
        </div>
      </div>

      <section className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 rounded-[60px] p-16 text-white flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)]">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2.5 rounded-full border border-white/20 mb-8 backdrop-blur-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Strategic Insight</span>
          </div>
          <h2 className="text-5xl font-black mb-8 leading-tight tracking-tight">Accelerate Your Market Value</h2>
          <p className="text-indigo-100 text-xl leading-relaxed opacity-90 font-medium max-w-xl">
            Mastering specialized design patterns for {profile.skills[0]} is your fastest path to a 35% salary uplift. 
            Industry benchmarks show that candidates who prioritize these modules see conversion rates double in Tier-1 firms.
          </p>
          <div className="flex flex-wrap gap-6 mt-12">
            <button 
              onClick={onUpdateRoadmap}
              className="bg-white text-indigo-950 px-12 py-5 rounded-[25px] font-black text-sm shadow-2xl hover:bg-indigo-50 transition-all active:scale-95"
            >
              Update Learning Flow
            </button>
            <button 
              onClick={() => onTabChange('news')}
              className="bg-white/10 text-white border border-white/20 px-12 py-5 rounded-[25px] font-black text-sm hover:bg-white/20 transition-all backdrop-blur-xl"
            >
              Industry Pulse Check
            </button>
          </div>
        </div>
        <div className="hidden md:flex w-72 h-72 bg-white/5 rounded-full border border-white/10 items-center justify-center backdrop-blur-3xl relative z-10 shadow-inner">
          <div className="text-center">
            <p className="text-8xl font-black tracking-tighter">+15%</p>
            <p className="text-[11px] font-black text-indigo-200 mt-3 uppercase tracking-[0.3em] leading-tight opacity-70">Projected<br/>Readiness</p>
          </div>
        </div>
        <i className="fas fa-brain absolute -bottom-20 -right-20 text-white/5 text-[400px] pointer-events-none"></i>
      </section>
    </div>
  );
};

export default Dashboard;

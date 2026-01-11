
import React, { useState } from 'react';
import { UserProfile, RoadmapItem, AssessmentQuestion, SkillGap, DashboardTab } from './types';
import Onboarding from './components/Onboarding';
import Assessment from './components/Assessment';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import MockInterview from './components/MockInterview';
import TechPulse from './components/TechPulse';
import { generateAssessment, analyzeSkillGaps, generateRoadmap } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<'onboarding' | 'assessment' | 'analyzing' | 'dashboard'>('onboarding');
  const [activeTab, setActiveTab] = useState<DashboardTab>('roadmap');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleOnboardingComplete = async (userProfile: UserProfile) => {
    setProfile(userProfile);
    setLoadingMsg('Generating your adaptive assessment...');
    setStep('analyzing');
    try {
      const qs = await generateAssessment(userProfile);
      setQuestions(qs);
      setStep('assessment');
    } catch (error) {
      console.error(error);
      alert('Failed to generate assessment. Please try again.');
      setStep('onboarding');
    }
  };

  const handleAssessmentComplete = async (answers: Record<string, string>) => {
    if (!profile) return;
    setLoadingMsg('Analyzing your performance and roadmap...');
    setStep('analyzing');
    try {
      const gapData = await analyzeSkillGaps(profile);
      setGaps(gapData.gaps);
      const roadmapData = await generateRoadmap(profile, gapData.gaps);
      setRoadmap(roadmapData);
      setStep('dashboard');
    } catch (error) {
      console.error(error);
      alert('Analysis failed.');
      setStep('assessment');
    }
  };

  const handleUpdateRoadmap = async () => {
    if (!profile) return;
    setLoadingMsg('Updating your roadmap with latest industry trends...');
    setStep('analyzing');
    try {
      const roadmapData = await generateRoadmap(profile, gaps);
      setRoadmap(roadmapData);
      setStep('dashboard');
      setActiveTab('roadmap');
    } catch (error) {
      console.error(error);
      alert('Failed to update roadmap.');
      setStep('dashboard');
    }
  };

  const renderDashboardContent = () => {
    if (!profile) return null;

    switch (activeTab) {
      case 'roadmap':
        return (
          <Dashboard 
            profile={profile} 
            gaps={gaps} 
            roadmap={roadmap} 
            onTabChange={setActiveTab}
            onUpdateRoadmap={handleUpdateRoadmap}
          />
        );
      case 'interviews':
        return <MockInterview profile={profile} onTabChange={setActiveTab} />;
      case 'news':
        return <TechPulse profile={profile} />;
      case 'analysis':
        return (
          <div className="animate-in fade-in duration-500 space-y-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Market Analysis & Skill Analytics</h2>
            
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-10 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                  <i className="fas fa-globe-americas"></i>
                  Role Outlook: {profile.role}
                </h3>
                <p className="text-indigo-100 text-lg opacity-95 max-w-2xl leading-relaxed">
                  The current market for {profile.level} {profile.role} roles shows a significant 22% spike in demand for developers who master Distributed Systems and Web Security. 
                  Candidates addressing your identified gaps are currently commanding 35% higher base salaries in the global tech market.
                </p>
              </div>
              <i className="fas fa-chart-line absolute -bottom-10 -right-10 text-white/5 text-[200px]"></i>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-xs font-black uppercase mb-6 tracking-widest">Skill Growth Velocity</p>
                <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-6">
                  <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-100 flex items-center justify-center">
                    <i className="fas fa-chart-line text-4xl opacity-20"></i>
                  </div>
                  <p className="text-sm font-medium text-slate-400 italic">Complete Mock Interviews to start tracking growth velocity.</p>
                </div>
              </div>
              <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-xs font-black uppercase mb-6 tracking-widest">Interview Readiness Probability</p>
                <div className="flex items-center justify-center h-64">
                  <div className="w-48 h-48 rounded-full border-[12px] border-slate-50 flex items-center justify-center relative shadow-inner">
                    <div className="absolute inset-0 border-[12px] border-indigo-600 rounded-full animate-pulse opacity-10"></div>
                    <div className="text-center">
                      <span className="text-5xl font-black text-indigo-600">65%</span>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="max-w-2xl animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Preferences</h2>
            <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
              <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-lg">AI Mock Interview Voice</p>
                  <p className="text-sm text-slate-500">Enable Gemini to speak questions in real-time</p>
                </div>
                <div className="w-14 h-7 bg-slate-200 rounded-full flex items-center px-1">
                   <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-lg">Bi-weekly Progress Reports</p>
                  <p className="text-sm text-slate-500">Receive detailed skill gap improvements via email</p>
                </div>
                <div className="w-14 h-7 bg-indigo-600 rounded-full flex items-center px-1">
                   <div className="w-5 h-5 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
              <div className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800 text-lg">Dark Mode Arena</p>
                  <p className="text-sm text-slate-500">Toggle dark theme for mock interview coding</p>
                </div>
                <div className="w-14 h-7 bg-slate-200 rounded-full flex items-center px-1">
                   <div className="w-5 h-5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {step === 'dashboard' && (
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      
      <main className={`flex-1 ${step === 'dashboard' ? 'ml-64 p-12' : 'flex items-center justify-center p-6'}`}>
        {step === 'onboarding' && <Onboarding onComplete={handleOnboardingComplete} />}
        {step === 'assessment' && <Assessment questions={questions} onComplete={handleAssessmentComplete} />}
        {step === 'analyzing' && (
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-100 animate-bounce">
              <i className="fas fa-brain text-white text-4xl"></i>
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Architecting Your Path</h2>
            <p className="text-slate-500 text-lg font-medium">{loadingMsg}</p>
          </div>
        )}
        {step === 'dashboard' && renderDashboardContent()}
      </main>
    </div>
  );
};

export default App;

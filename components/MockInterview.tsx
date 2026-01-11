
import React, { useState, useEffect } from 'react';
import { UserProfile, InterviewFeedback, DashboardTab } from '../types';
import { getNextInterviewQuestion, evaluateMockResponse } from '../services/geminiService';

interface MockInterviewProps {
  profile: UserProfile;
  onTabChange: (tab: DashboardTab) => void;
}

const MockInterview: React.FC<MockInterviewProps> = ({ profile, onTabChange }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'active' | 'evaluating'>('idle');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [sessionStats, setSessionStats] = useState({ count: 0, avgScore: 0 });

  const startNextQuestion = async () => {
    setStatus('loading');
    setFeedback(null);
    setAnswer('');
    try {
      const q = await getNextInterviewQuestion(profile, profile.skills);
      setQuestion(q);
      setStatus('active');
    } catch (e) {
      console.error(e);
      setStatus('idle');
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setStatus('evaluating');
    try {
      const evaluation = await evaluateMockResponse(question, answer, profile);
      setFeedback(evaluation);
      setSessionStats(prev => ({
        count: prev.count + 1,
        avgScore: Math.round((prev.avgScore * prev.count + evaluation.score) / (prev.count + 1))
      }));
      setStatus('idle');
    } catch (e) {
      console.error(e);
      setStatus('active');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Mock Interview Arena</h2>
          <p className="text-slate-500">Simulate high-pressure technical interviews with real-time evaluation.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs">
              <i className="fas fa-list-check"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
              <p className="text-sm font-bold">{sessionStats.count}</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <i className="fas fa-gauge-high"></i>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Score</p>
              <p className="text-sm font-bold">{sessionStats.avgScore}%</p>
            </div>
          </div>
        </div>
      </header>

      {status === 'idle' && !feedback && (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
            <i className="fas fa-robot"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Start?</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">The AI will generate questions based on your roadmap and experience level.</p>
          <button 
            onClick={startNextQuestion}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2 mx-auto active:scale-95"
          >
            Start Session
          </button>
        </div>
      )}

      {(status === 'loading' || status === 'evaluating') && (
        <div className="bg-white rounded-2xl p-20 border border-slate-100 text-center shadow-sm">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-slate-600 font-medium">
            {status === 'loading' ? 'Interviewer is preparing the next question...' : 'Evaluating your technical response...'}
          </p>
        </div>
      )}

      {(status === 'active' || (status === 'evaluating' && feedback === null)) && (
        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shrink-0">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="bg-slate-50 p-6 rounded-2xl rounded-tl-none border border-slate-100 flex-1">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Interviewer</p>
              <p className="text-lg font-medium text-slate-800 leading-relaxed">{question}</p>
            </div>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <p className="text-slate-400 text-[10px] font-bold uppercase ml-14">Your Response</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={status === 'evaluating'}
                className="w-full h-48 p-6 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all resize-none shadow-inner ml-14"
                placeholder="Type your technical answer here. Be as detailed as possible..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || status === 'evaluating'}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2 active:scale-95"
            >
              Submit Answer
              <i className="fas fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      )}

      {feedback && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-8 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <i className="fas fa-clipboard-check text-indigo-500"></i>
                  AI Critique
                </h4>
                <div className={`px-4 py-1 rounded-full text-xs font-bold ${feedback.score > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  Performance: {feedback.score}/100
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed mb-8">{feedback.critique}</p>
              
              <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider text-slate-400">Recommended "Gold" Answer</h4>
              <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 text-sm text-slate-700 leading-relaxed italic">
                {feedback.improvedAnswer}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-2xl text-white shadow-lg shadow-indigo-100 relative overflow-hidden">
              <div className="relative z-10">
                <h4 className="font-bold mb-4">What's Next?</h4>
                <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                  You scored {feedback.score}% on this topic. Should we dive deeper or try a different skill area?
                </p>
                <div className="space-y-3">
                  <button onClick={startNextQuestion} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg active:scale-95">
                    Try Another Question
                  </button>
                  <button 
                    onClick={() => onTabChange('roadmap')}
                    className="w-full bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-400 transition-colors border border-indigo-400 active:scale-95"
                  >
                    Review Topic in Roadmap
                  </button>
                </div>
              </div>
              <i className="fas fa-bolt absolute -bottom-4 -right-4 text-white/10 text-9xl transform -rotate-12"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;

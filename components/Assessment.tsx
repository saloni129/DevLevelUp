
import React, { useState } from 'react';
import { AssessmentQuestion } from '../types';

interface AssessmentProps {
  questions: AssessmentQuestion[];
  onComplete: (answers: Record<string, string>) => void;
}

const Assessment: React.FC<AssessmentProps> = ({ questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentValue, setCurrentValue] = useState('');
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleNext = () => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: currentValue };
    setAnswers(updatedAnswers);
    setCurrentValue('');

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (q.type === 'MultipleChoice' && answers[q.id] === q.correctAnswer) {
        score++;
      } else if (q.type === 'Scenario' && answers[q.id]?.length > 20) {
        // Simple heuristic for demo
        score++;
      }
    });
    return Math.round((score / questions.length) * 100);
  };

  if (showResults) {
    const overallScore = calculateScore();
    return (
      <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-4xl w-full border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="mb-10 text-center relative">
          <div className="flex items-center justify-center mb-6">
             <div className="w-32 h-32 rounded-full border-[10px] border-slate-50 flex items-center justify-center relative shadow-inner">
                <div className={`absolute inset-0 border-[10px] rounded-full ${overallScore > 70 ? 'border-emerald-500' : 'border-indigo-500'} opacity-10 animate-pulse`}></div>
                <div className="text-center">
                  <span className={`text-4xl font-black ${overallScore > 70 ? 'text-emerald-600' : 'text-indigo-600'}`}>{overallScore}%</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Gained Score</p>
                </div>
             </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Technical Audit Summary</h2>
          <p className="text-slate-500 text-lg font-medium">Detailed breakdown of your baseline verification phase.</p>
        </div>

        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 mb-10 custom-scrollbar">
          {questions.map((q, idx) => {
            const isCorrect = q.type === 'MultipleChoice' ? answers[q.id] === q.correctAnswer : answers[q.id]?.length > 20;
            return (
              <div key={q.id} className={`p-8 rounded-[35px] border-2 transition-all ${isCorrect ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10'}`}>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'} shadow-lg`}>
                       <i className={`fas ${isCorrect ? 'fa-check' : 'fa-xmark'}`}></i>
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Analysis • Module {idx + 1}</span>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${isCorrect ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
                    {isCorrect ? 'PASSED' : 'IMPROVEMENT REQ'}
                  </span>
                </div>
                <p className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">{q.text}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <p className="text-slate-400 text-[9px] font-black uppercase mb-3 tracking-widest relative z-10">Your Submission</p>
                    <p className={`font-bold text-sm relative z-10 ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>{answers[q.id] || 'Void'}</p>
                    <i className="fas fa-user absolute -bottom-4 -right-4 text-slate-50 text-5xl"></i>
                  </div>
                  {q.type === 'MultipleChoice' ? (
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                      <p className="text-slate-400 text-[9px] font-black uppercase mb-3 tracking-widest relative z-10">Optimal Response</p>
                      <p className="text-slate-800 font-bold text-sm relative z-10">{q.correctAnswer}</p>
                      <i className="fas fa-bullseye absolute -bottom-4 -right-4 text-slate-50 text-5xl"></i>
                    </div>
                  ) : (
                    <div className="p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
                      <p className="text-emerald-600 text-[9px] font-black uppercase mb-3 tracking-widest relative z-10">AI Insight</p>
                      <p className="text-emerald-800 font-bold text-xs leading-relaxed relative z-10">Your response demonstrated {isCorrect ? 'sufficient depth' : 'limited depth'} in core principles.</p>
                      <i className="fas fa-sparkles absolute -bottom-4 -right-4 text-emerald-100 text-5xl"></i>
                    </div>
                  )}
                </div>
                
                {q.explanation && (
                  <div className="mt-8 p-6 bg-slate-900 rounded-[30px] text-sm leading-relaxed text-slate-400 relative overflow-hidden border border-slate-800">
                    <div className="relative z-10">
                      <span className="text-indigo-400 font-black uppercase text-[10px] block mb-3 tracking-widest flex items-center gap-2">
                        <i className="fas fa-lightbulb"></i>
                        Strategic Reasoning
                      </span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => onComplete(answers)}
          className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[30px] shadow-2xl transition-all flex items-center justify-center gap-4 transform hover:-translate-y-1 active:scale-95 group"
        >
          GENERATE FULL ADAPTIVE ROADMAP
          <i className="fas fa-arrow-right text-xs group-hover:translate-x-2 transition-transform"></i>
        </button>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="bg-white p-12 rounded-[50px] shadow-2xl max-w-3xl w-full border border-slate-100 animate-in fade-in duration-500">
      <div className="mb-12 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100">
            <i className="fas fa-shield-halved"></i>
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Verification Arena</span>
            <span className="text-sm font-bold text-slate-900 uppercase">Module Audit In Progress</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 tabular-nums">
            {currentIdx + 1}<span className="text-slate-200 mx-1">/</span>{questions.length}
          </span>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-black text-slate-900 mb-10 leading-tight tracking-tight">
          {currentQuestion.text}
        </h2>
        
        {currentQuestion.type === 'MultipleChoice' ? (
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options?.map(opt => (
              <button
                key={opt}
                onClick={() => setCurrentValue(opt)}
                className={`w-full text-left p-6 rounded-[30px] border-2 transition-all group relative overflow-hidden ${currentValue === opt ? 'border-indigo-600 bg-indigo-50/50 shadow-xl ring-8 ring-indigo-50' : 'border-slate-50 hover:border-indigo-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${currentValue === opt ? 'bg-indigo-600 border-indigo-600 scale-110 shadow-lg shadow-indigo-200' : 'border-slate-200 group-hover:border-indigo-300'}`}>
                    {currentValue === opt && <i className="fas fa-check text-xs text-white"></i>}
                  </div>
                  <span className={`font-black text-base ${currentValue === opt ? 'text-indigo-900' : 'text-slate-500 group-hover:text-slate-800'}`}>{opt}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="relative group">
            <textarea
              className="w-full h-56 p-8 bg-slate-50 border-2 border-slate-50 rounded-[40px] text-base font-medium focus:ring-8 focus:ring-indigo-50 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-inner resize-none"
              placeholder="Deep dive into your answer. The AI scoring engine prioritizes technical accuracy and architectural clarity..."
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
            />
            <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
              Live AI Analysis Active
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-8">
        <div className="flex-1 bg-slate-50 h-4 rounded-full overflow-hidden p-1 border border-slate-100 shadow-inner">
          <div 
            className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-100" 
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <button
          onClick={handleNext}
          disabled={!currentValue}
          className={`px-12 py-5 rounded-[30px] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 ${!currentValue ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black shadow-2xl'}`}
        >
          {currentIdx === questions.length - 1 ? 'Reveal Analysis' : 'Next Module'}
          <i className="fas fa-chevron-right text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};

export default Assessment;

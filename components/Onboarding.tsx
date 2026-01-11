
import React, { useState, useRef } from 'react';
import { Role, Level, UserProfile } from '../types';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const COMMON_SKILLS = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Go', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL', 'System Design'];

const ROLE_ICONS: Record<Role, string> = {
  'Frontend': 'fa-desktop',
  'Backend': 'fa-server',
  'Full Stack': 'fa-layer-group',
  'DevOps': 'fa-infinity',
  'Mobile': 'fa-mobile-screen'
};

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [role, setRole] = useState<Role>('Frontend');
  const [level, setLevel] = useState<Level>('Junior');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      // In a real app we'd use a PDF parser here. 
      // For this prototype, we simulate the content extraction by adding a note.
      setResumeText(prev => prev + `\n[Uploaded File: ${file.name}]\n(AI will simulate parsing this document for context)`);
    }
  };

  const handleSubmit = () => {
    if (selectedSkills.length === 0) return alert('Select at least one skill to continue!');
    
    onComplete({
      role,
      level,
      skills: selectedSkills,
      confidenceLevels: selectedSkills.reduce((acc, skill) => ({ ...acc, [skill]: 'Somewhat' }), {}),
      resumeContent: resumeText,
      resumeFileName
    });
  };

  return (
    <div className="bg-white p-10 rounded-[40px] shadow-2xl max-w-4xl w-full border border-slate-100 animate-in fade-in zoom-in duration-500 overflow-hidden">
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-200">
          <i className="fas fa-rocket text-3xl"></i>
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Professional DNA Mapping</h1>
        <p className="text-slate-500 text-lg font-medium">Configure your target role and current expertise level.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">01</span>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Target Role</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['Frontend', 'Backend', 'Full Stack', 'DevOps', 'Mobile'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 group ${role === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                >
                  <i className={`fas ${ROLE_ICONS[r]} text-lg`}></i>
                  <span className="text-[10px] font-bold uppercase">{r}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">02</span>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Experience Level</label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['Junior', 'Mid-Level', 'Senior', 'Lead'] as Level[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${level === l ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-400 border-slate-50 hover:border-indigo-200 hover:text-indigo-600'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">03</span>
              <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Expertise Tags</label>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_SKILLS.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`py-2 px-5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedSkills.includes(skill) ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-10">
          <section className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black">04</span>
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Resume Context</label>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] font-black text-indigo-600 uppercase hover:underline flex items-center gap-1"
              >
                <i className="fas fa-file-pdf"></i>
                Upload Doc/PDF
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileUpload} />
            </div>
            
            <div className="relative flex-1">
              <textarea
                className="w-full h-full min-h-[300px] p-6 bg-slate-50 border-2 border-slate-50 rounded-[30px] text-sm font-medium focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-inner resize-none"
                placeholder="Paste your resume text here, or upload a document to help the AI detect skill gaps and project relevance..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              {resumeFileName && (
                <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-200 flex items-center gap-2 animate-bounce">
                  <i className="fas fa-check-circle"></i>
                  {resumeFileName}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-10">
        <button
          onClick={handleSubmit}
          className="w-full bg-slate-900 hover:bg-black text-white font-black py-6 rounded-[30px] shadow-2xl transition-all flex items-center justify-center gap-4 group transform hover:-translate-y-1 active:scale-95"
        >
          ANALYZE MY PROFILE & START
          <i className="fas fa-sparkles text-amber-400 group-hover:rotate-12 transition-transform"></i>
        </button>
      </div>
    </div>
  );
};

export default Onboarding;

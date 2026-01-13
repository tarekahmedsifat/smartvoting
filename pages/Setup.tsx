import React, { useState } from 'react';
import { BallotConfig, Nominee } from '../types';

interface SetupProps {
  config: BallotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BallotConfig>>;
}

export default function SetupPage({ config, setConfig }: SetupProps) {
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState<string | null>(null);

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewIcon(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addNominee = () => {
    if (!newName) return;
    const nominee: Nominee = {
      id: crypto.randomUUID(),
      name: newName,
      iconBase64: newIcon || '' // Icon is optional but recommended
    };
    setConfig(prev => ({
      ...prev,
      nominees: [...prev.nominees, nominee]
    }));
    setNewName('');
    setNewIcon(null);
    // Reset file input
    const fileInput = document.getElementById('icon-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeNominee = (id: string) => {
    setConfig(prev => ({
      ...prev,
      nominees: prev.nominees.filter(n => n.id !== id)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ballot Configuration</h1>
        <p className="text-slate-600">Define the symbols and candidates the AI should look for on the ballots.</p>
      </header>

      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">1. Voting Rules</h2>
          <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Parameters</div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Max Selections Allowed</label>
            <p className="text-xs text-slate-500 mb-3">How many votes can a single ballot contain before being rejected?</p>
          </div>
          <input 
            type="number"
            min="1"
            value={config.allowedSelections}
            onChange={(e) => setConfig(prev => ({ ...prev, allowedSelections: parseInt(e.target.value) || 1 }))}
            className="w-24 p-3 text-center text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">2. Nominees & Symbols</h2>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Nominee List</div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 border border-indigo-100 rounded-2xl bg-indigo-50/30 space-y-4">
              <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-widest">New Nominee Entry</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Symbol Name / Label</label>
                <input 
                  type="text"
                  placeholder="e.g., Cat, Dog, Radish"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Optional Visual Icon</label>
                <div className="relative group">
                  <input 
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl bg-white text-center group-hover:border-indigo-400 transition-colors">
                    {newIcon ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={newIcon} alt="Preview" className="w-10 h-10 rounded-lg object-cover shadow-sm" />
                        <span className="text-xs font-medium text-slate-600">Symbol Loaded</span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Click to upload symbol image</span>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={addNominee}
                disabled={!newName}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                Add to Ballot
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 min-h-[300px]">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Registered Symbols ({config.nominees.length})</h3>
              
              {config.nominees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm italic">No nominees defined yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {config.nominees.map(n => (
                    <div key={n.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group hover:border-indigo-300 transition-all shadow-sm">
                      <div className="flex items-center space-x-3">
                        {n.iconBase64 ? (
                          <img src={n.iconBase64} alt={n.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                        )}
                        <span className="font-bold text-slate-700">{n.name}</span>
                      </div>
                      <button 
                        onClick={() => removeNominee(n.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        aria-label="Remove nominee"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-center pt-4">
        <a 
          href="#/analysis"
          className={`px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl transition-all hover:bg-indigo-600 active:scale-95 ${config.nominees.length === 0 ? 'opacity-20 pointer-events-none' : ''}`}
        >
          Proceed to Ballot Analysis
        </a>
      </div>
    </div>
  );
}

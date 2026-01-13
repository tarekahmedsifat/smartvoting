
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
    if (!newName || !newIcon) return;
    const nominee: Nominee = {
      id: crypto.randomUUID(),
      name: newName,
      iconBase64: newIcon
    };
    setConfig(prev => ({
      ...prev,
      nominees: [...prev.nominees, nominee]
    }));
    setNewName('');
    setNewIcon(null);
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
        <h1 className="text-3xl font-bold text-slate-900">Voting Configuration</h1>
        <p className="text-slate-600">Set up your nominees and ballot rules before analysis.</p>
      </header>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">1. Ballot Rules</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-slate-700">How many selections per ballot?</label>
          <input 
            type="number"
            min="1"
            value={config.allowedSelections}
            onChange={(e) => setConfig(prev => ({ ...prev, allowedSelections: parseInt(e.target.value) || 1 }))}
            className="w-20 p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">2. Manage Nominees</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Add New Nominee</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Nominee Name (e.g., Cat, Radish)</label>
              <input 
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md mb-3"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Symbol Icon</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleIconUpload}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
            {newIcon && (
              <div className="mt-2 flex items-center space-x-4">
                 <img src={newIcon} alt="Preview" className="w-12 h-12 rounded object-cover border border-slate-200" />
                 <span className="text-xs text-slate-400">Preview</span>
              </div>
            )}
            <button 
              onClick={addNominee}
              disabled={!newName || !newIcon}
              className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              Add to List
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Nominees ({config.nominees.length})</h3>
            {config.nominees.length === 0 ? (
              <p className="text-slate-400 italic text-sm">No nominees added yet.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {config.nominees.map(n => (
                  <div key={n.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg group">
                    <div className="flex items-center space-x-3">
                      <img src={n.iconBase64} alt={n.name} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                      <span className="font-medium text-slate-700">{n.name}</span>
                    </div>
                    <button 
                      onClick={() => removeNominee(n.id)}
                      className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

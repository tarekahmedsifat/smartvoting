
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import SetupPage from './pages/Setup';
import AnalysisPage from './pages/Analysis';
import ResultsPage from './pages/Results';
import { BallotConfig, GlobalResults } from './types';

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">V</div>
          <span className="font-bold text-xl tracking-tight text-slate-800">SmartVoting system</span>
        </div>
        <div className="flex space-x-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Nominees & Setup
          </Link>
          <Link
            to="/analysis"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/analysis') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Run Analysis
          </Link>
          <Link
            to="/results"
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/results') ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Final Results
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  const [config, setConfig] = useState<BallotConfig>({
    allowedSelections: 1,
    nominees: []
  });

  const [results, setResults] = useState<GlobalResults | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('ballot_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('ballot_config', JSON.stringify(config));
  }, [config]);

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={<SetupPage config={config} setConfig={setConfig} />} 
            />
            <Route 
              path="/analysis" 
              element={<AnalysisPage config={config} setResults={setResults} />} 
            />
            <Route 
              path="/results" 
              element={<ResultsPage results={results} config={config} />} 
            />
          </Routes>
        </main>
        <footer className="bg-slate-100 border-t border-slate-200 py-6 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} SmartVoting Ballot Processing System
        </footer>
      </div>
    </HashRouter>
  );
}

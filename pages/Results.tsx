
import React from 'react';
import { GlobalResults, BallotConfig } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsProps {
  results: GlobalResults | null;
  config: BallotConfig;
}

export default function ResultsPage({ results, config }: ResultsProps) {
  if (!results) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No Results Yet</h2>
        <p className="text-slate-500">You need to run an analysis before results can be viewed.</p>
        <a href="#/analysis" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
          Go to Analysis
        </a>
      </div>
    );
  }

  const chartData = Object.entries(results.nomineeVotes).map(([name, votes]) => ({
    name,
    votes
  })).sort((a, b) => b.votes - a.votes);

  const colors = ['#4f46e5', '#7c3aed', '#2563eb', '#0891b2', '#059669', '#d97706'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Election Summary</h1>
          <p className="text-slate-600">Final vote counts and ballot validation audit.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-100">
              <span className="block text-xs font-bold text-green-600 uppercase tracking-wider">Valid Ballots</span>
              <span className="text-2xl font-bold text-green-700">{results.validBallots}</span>
           </div>
           <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100">
              <span className="block text-xs font-bold text-red-600 uppercase tracking-wider">Rejected</span>
              <span className="text-2xl font-bold text-red-700">{results.rejectedBallots}</span>
           </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Vote Distribution</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Breakdown Table */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Tabulation</h2>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Nominee</th>
                <th className="pb-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Votes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {chartData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 flex items-center space-x-3">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">{item.votes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Rejected Ballots Audit</h2>
        <p className="text-slate-500 text-sm">Previewing all ballots that failed validation rules (User Selections != {config.allowedSelections}).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.pageResults.filter(r => r.status === 'rejected').map((rejected, i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-red-100 overflow-hidden shadow-sm flex flex-col">
              <div className="p-3 bg-red-50 flex justify-between items-center border-b border-red-100">
                <span className="text-xs font-bold text-red-600">PAGE {rejected.pageNumber}</span>
                <span className="px-2 py-0.5 rounded-full bg-red-200 text-red-800 text-[10px] font-black uppercase">Rejected</span>
              </div>
              <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
                {rejected.screenshot && (
                  <img src={rejected.screenshot} alt={`Rejected page ${rejected.pageNumber}`} className="object-contain w-full h-full" />
                )}
              </div>
              <div className="p-4 space-y-2 flex-grow">
                <div className="text-sm font-semibold text-slate-800">Failure Reason:</div>
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded italic border border-slate-100">
                  {rejected.reason}
                </div>
                {rejected.selectedNomineeIds.length > 0 && (
                   <div className="mt-2">
                     <span className="text-[10px] uppercase font-bold text-slate-400">Detected Selections:</span>
                     <div className="flex flex-wrap gap-1 mt-1">
                        {rejected.selectedNomineeIds.map(id => {
                          const n = config.nominees.find(x => x.id === id);
                          return <span key={id} className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">{n?.name}</span>;
                        })}
                     </div>
                   </div>
                )}
              </div>
            </div>
          ))}
          {results.rejectedBallots === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
              <div className="text-slate-400 font-medium">No rejected ballots found. All votes were valid!</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

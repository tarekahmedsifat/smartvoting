
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import { BallotConfig, GlobalResults, AnalysisResult } from '../types';
import { analyzeBallotPage } from '../services/geminiService';

// Set up the worker for PDF.js - pointing to the exact version in package.json
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface AnalysisProps {
  config: BallotConfig;
  setResults: React.Dispatch<React.SetStateAction<GlobalResults | null>>;
}

export default function AnalysisPage({ config, setResults }: AnalysisProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setLogs([`File selected: ${e.target.files[0].name}`]);
    }
  };

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  const processPDF = async () => {
    if (!file) {
      alert("Please upload a PDF first.");
      return;
    }
    if (config.nominees.length === 0) {
      alert("Please configure nominees in the Setup page before analyzing.");
      return;
    }

    setIsProcessing(true);
    setLogs(["Initiating PDF analysis..."]);
    
    try {
      addLog("Reading file data...");
      const arrayBuffer = await file.arrayBuffer();
      
      addLog("Loading PDF document...");
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      setProgress({ current: 0, total: numPages });
      addLog(`PDF loaded successfully: ${numPages} pages detected.`);

      const pageResults: AnalysisResult[] = [];
      const nomineeVotes: Record<string, number> = {};
      config.nominees.forEach(n => nomineeVotes[n.name] = 0);

      for (let i = 1; i <= numPages; i++) {
        addLog(`Rendering page ${i}/${numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR accuracy
        
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas reference lost during processing.");
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');
        if (!context) throw new Error("Could not get 2D context from canvas.");

        await page.render({ 
          canvasContext: context, 
          viewport
        }).promise;

        
        addLog(`Analyzing content of page ${i} with AI...`);
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        
        // Call Gemini Vision
        const analysis = await analyzeBallotPage(base64, config.nominees, config.allowedSelections);
        
        const selectedNomineeIds = analysis.selectedNames
          .map(name => {
            const found = config.nominees.find(n => n.name.toLowerCase().trim() === name.toLowerCase().trim());
            return found ? found.id : null;
          })
          .filter((id): id is string => id !== null);

        const count = selectedNomineeIds.length;
        const isValid = count === config.allowedSelections;
        const status = isValid ? 'valid' : 'rejected';
        const reason = !isValid 
          ? `Invalid count: ${count} selected, but expected exactly ${config.allowedSelections}.` 
          : undefined;

        addLog(`Page ${i} analysis complete. Status: ${status.toUpperCase()} (${count} selected)`);

        pageResults.push({
          pageNumber: i,
          selectedNomineeIds,
          isValid,
          status,
          screenshot: dataUrl,
          reason
        });

        if (isValid) {
          analysis.selectedNames.forEach(name => {
            const nominee = config.nominees.find(n => n.name.toLowerCase().trim() === name.toLowerCase().trim());
            if (nominee) {
              nomineeVotes[nominee.name] = (nomineeVotes[nominee.name] || 0) + 1;
            }
          });
        }

        setProgress(prev => ({ ...prev, current: i }));
      }

      const finalResults: GlobalResults = {
        totalBallots: numPages,
        validBallots: pageResults.filter(r => r.status === 'valid').length,
        rejectedBallots: pageResults.filter(r => r.status === 'rejected').length,
        nomineeVotes,
        pageResults
      };

      setResults(finalResults);
      addLog("All pages processed. Finalizing results...");
      
      // Short delay so user can see completion message
      setTimeout(() => navigate('/results'), 1500);

    } catch (error) {
      console.error("Processing error:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      addLog(`CRITICAL ERROR: ${errorMsg}`);
      alert(`An error occurred during processing: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Run Ballot Analysis</h1>
        <p className="text-slate-600">Upload your PDF ballot file to begin automated counting.</p>
      </header>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-full max-w-md">
           <label className="block text-sm font-medium text-slate-700 mb-2">Upload Ballot PDF</label>
           <div className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-slate-400'}`}>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                disabled={isProcessing}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-slate-600">
                  {file ? file.name : "Click to select or drag and drop"}
                </p>
                <p className="text-xs text-slate-400">PDF files supported</p>
              </div>
           </div>
        </div>

        <button
          onClick={processPDF}
          disabled={!file || isProcessing || config.nominees.length === 0}
          className={`px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all ${
            isProcessing 
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:transform active:scale-95'
          }`}
        >
          {isProcessing ? `Processing Page ${progress.current}...` : 'Start Counting'}
        </button>

        {config.nominees.length === 0 && (
          <p className="text-red-500 text-sm font-medium">⚠️ No nominees set. Go to Setup page first.</p>
        )}
      </div>

      <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] md:text-xs text-green-400 min-h-[150px] max-h-64 overflow-y-auto shadow-inner border border-slate-700">
        <div className="mb-2 text-slate-500 flex items-center gap-2 border-b border-slate-800 pb-1">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          SYSTEM CONSOLE LOG
        </div>
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Waiting for process initiation...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1">{`> ${log}`}</div>
          ))
        )}
      </div>

      {/* Hidden canvas for PDF page to Image conversion */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

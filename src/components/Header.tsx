'use client';

import React, { useState } from 'react';
import { Database, Network, ShieldAlert, Terminal, FileText, RefreshCw, Layers, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'visualizer' | 'blast' | 'cypher' | 'guide';
  setActiveTab: (tab: 'visualizer' | 'blast' | 'cypher' | 'guide') => void;
  dbStatus: {
    isConnected: boolean;
    isMockFallback: boolean;
    uri?: string;
    user?: string;
    error?: string;
  } | null;
  onRefreshGraph: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dbStatus,
  onRefreshGraph,
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage('✅ Seeded CognoDB with fresh graph nodes!');
        onRefreshGraph();
      } else {
        setSeedMessage(`⚠️ ${data.message || 'Seeding requires CognoDB .env config.'}`);
      }
    } catch (err: any) {
      setSeedMessage('❌ Failed to trigger database seed.');
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedMessage(null), 5000);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Network className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                NexusGraph <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">CognoDB Edition</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Cloud Infrastructure Supply Chain & Vulnerability Blast Radius Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'visualizer'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Graph Canvas
          </button>

          <button
            onClick={() => setActiveTab('blast')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'blast'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Blast Radius Simulator
          </button>

          <button
            onClick={() => setActiveTab('cypher')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cypher'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Cypher Playground
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'guide'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            CognoDB Guide
          </button>
        </nav>

        {/* Database Connection Badge & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Status Badge */}
          {dbStatus?.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>CognoDB Cloud Connected</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium cursor-help"
              title={dbStatus?.error || 'Configure COGNODB_URI in .env to connect to live instance'}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Offline Demo Mode</span>
            </div>
          )}

          {/* Seed Button */}
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            title="Seed CognoDB Database with fresh nodes"
          >
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            {isSeeding ? 'Seeding...' : 'Seed DB'}
          </button>

          {/* Refresh Button */}
          <button
            onClick={onRefreshGraph}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reload Graph Canvas"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>

      {seedMessage && (
        <div className="max-w-7xl mx-auto mt-2 text-center text-xs py-1 px-3 bg-indigo-950/80 border border-indigo-800/50 rounded-lg text-indigo-200 animate-fade-in">
          {seedMessage}
        </div>
      )}
    </header>
  );
};

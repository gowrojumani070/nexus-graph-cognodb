'use client';

import React from 'react';
import { Database, CheckCircle2, ExternalLink, Key, Terminal, Shield, Copy } from 'lucide-react';

export const DatabaseSetupGuide: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">CognoDB Cloud Setup Guide</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            CognoDB Cloud provisions a managed openCypher graph database instance over the Bolt protocol in under 60 seconds.
          </p>
        </div>

        <a
          href="https://console.cognodb.com/signup"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all shrink-0"
        >
          <span>Open CognoDB Console</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Step by Step Cards */}
      <div className="space-y-4">
        
        {/* Step 1 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">1</span>
            Sign Up on CognoDB Cloud
          </div>
          <p className="text-xs text-slate-300 pl-7 leading-relaxed">
            Go to <a href="https://console.cognodb.com/signup" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">https://console.cognodb.com/signup</a> and sign up for a free account. No credit card required.
          </p>
        </div>

        {/* Step 2 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">2</span>
            Provision a Free Instance (c0)
          </div>
          <p className="text-xs text-slate-300 pl-7 leading-relaxed">
            Create a free (c0) graph database instance and select your preferred region. Provisioning completes in under one minute.
          </p>
        </div>

        {/* Step 3 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">3</span>
            Configure Local Secrets (.env)
          </div>
          <p className="text-xs text-slate-300 pl-7 leading-relaxed">
            Copy your connection URI (<code>bolt+s://&lt;instance-id&gt;.databases.cognodb.cloud</code>) and generated password into your local <code>.env</code> file:
          </p>

          <pre className="ml-7 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 leading-relaxed overflow-x-auto">
            {`COGNODB_URI=bolt+s://<your-instance-id>.databases.cognodb.cloud
COGNODB_USER=cognodb
COGNODB_PASSWORD=<your-generated-cognodb-password>`}
          </pre>
        </div>

        {/* Step 4 */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <span className="h-5 w-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">4</span>
            Seed Graph Data & Connect
          </div>
          <p className="text-xs text-slate-300 pl-7 leading-relaxed">
            Run the automated seed script to populate nodes and relationships:
          </p>

          <pre className="ml-7 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 leading-relaxed">
            npm run seed
          </pre>

          <p className="text-xs text-slate-400 pl-7">
            Or click the <strong>Seed DB</strong> button in the top right navigation bar at any time!
          </p>
        </div>

      </div>

    </div>
  );
};

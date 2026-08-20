'use client';

import React, { useState } from 'react';
import { PREDEFINED_CYPHER_QUERIES } from '@/lib/mockData';
import { Terminal, Play, Clock, CheckCircle2, Copy, Table as TableIcon, Code, AlertCircle } from 'lucide-react';

export const QueryPlayground: React.FC = () => {
  const [selectedQueryId, setSelectedQueryId] = useState<string>(PREDEFINED_CYPHER_QUERIES[0].id);
  const [customCypher, setCustomCypher] = useState<string>(PREDEFINED_CYPHER_QUERIES[0].cypher);
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSelectQuery = (id: string) => {
    setSelectedQueryId(id);
    const found = PREDEFINED_CYPHER_QUERIES.find((q) => q.id === id);
    if (found) {
      setCustomCypher(found.cypher);
      setQueryResult(null);
      setErrorMsg(null);
    }
  };

  const handleExecuteQuery = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const selectedQueryObj = PREDEFINED_CYPHER_QUERIES.find((q) => q.id === selectedQueryId);
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cypher: customCypher,
          params: selectedQueryObj ? selectedQueryObj.params : {},
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQueryResult(data);
      } else {
        setErrorMsg(data.error || 'Failed to execute query');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
    } finally {
      setIsLoading(false);
    }
  };

  // Derive tabular headers from first record
  const records = queryResult?.records || [];
  const tableHeaders = records.length > 0 ? Object.keys(records[0]) : [];

  return (
    <div className="w-full space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Terminal className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">openCypher Query Playground</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl">
            Execute openCypher graph queries live against CognoDB Cloud. Choose from curated graph analysis queries or write custom read-only Cypher statements.
          </p>
        </div>

        <button
          onClick={handleExecuteQuery}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Play className="h-4 w-4 fill-current" />
          {isLoading ? 'Executing Cypher...' : 'Run Query'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Predefined Queries Selector */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Predefined Graph Queries</h3>
          <div className="space-y-2">
            {PREDEFINED_CYPHER_QUERIES.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuery(q.id)}
                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedQueryId === q.id
                    ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="font-semibold text-slate-200">{q.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{q.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Query Editor & Result Display */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Code Editor Box */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5 text-indigo-400" />
                openCypher Editor
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(customCypher)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy
              </button>
            </div>

            <textarea
              rows={6}
              value={customCypher}
              onChange={(e) => setCustomCypher(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-indigo-300 font-mono text-xs p-4 rounded-xl focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              placeholder="MATCH (n) RETURN n LIMIT 10"
            />
          </div>

          {/* Results Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-white">Query Results</h3>
                {queryResult?.executionTimeMs !== undefined && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    {queryResult.executionTimeMs} ms
                  </span>
                )}
                {queryResult?.isMock && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Offline Mock Result
                  </span>
                )}
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('json')}
                  className={`p-1.5 rounded text-xs transition-colors ${
                    viewMode === 'json' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="JSON View"
                >
                  <Code className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-950/80 border border-red-800/80 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                {errorMsg}
              </div>
            )}

            {/* Results Table */}
            {queryResult && viewMode === 'table' && (
              <div className="overflow-x-auto max-h-80 rounded-xl border border-slate-800">
                {records.length > 0 ? (
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                      <tr>
                        {tableHeaders.map((h) => (
                          <th key={h} className="p-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 font-mono">
                      {records.map((row: any, rIdx: number) => (
                        <tr key={rIdx} className="hover:bg-slate-800/40">
                          {tableHeaders.map((h) => (
                            <td key={h} className="p-3">
                              {typeof row[h] === 'object' ? JSON.stringify(row[h]) : String(row[h])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Query executed successfully with 0 records returned.
                  </div>
                )}
              </div>
            )}

            {/* Results JSON */}
            {queryResult && viewMode === 'json' && (
              <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 max-h-80 overflow-auto">
                {JSON.stringify(records, null, 2)}
              </pre>
            )}

            {!queryResult && !errorMsg && (
              <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                Click <strong className="text-slate-300">Run Query</strong> above to execute openCypher query against CognoDB Cloud.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

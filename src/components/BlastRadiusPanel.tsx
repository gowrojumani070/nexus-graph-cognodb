'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Cpu, Server, AlertTriangle, ChevronRight, Play, Code2, ArrowUpRight, Zap } from 'lucide-react';

interface BlastRadiusPanelProps {
  onHighlightPath?: (nodeIds: string[]) => void;
}

export const BlastRadiusPanel: React.FC<BlastRadiusPanelProps> = ({ onHighlightPath }) => {
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'ALL'>('CRITICAL');
  const [maxHops, setMaxHops] = useState<number>(4);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [blastData, setBlastData] = useState<any>(null);

  const fetchBlastRadius = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/blast-radius?severity=${severity}&maxHops=${maxHops}`);
      const data = await res.json();
      setBlastData(data);

      if (onHighlightPath && data.impactedServices) {
        // Collect node IDs to highlight on graph canvas
        const serviceIds = data.impactedServices.map((s: any) => `svc-${s.name.replace('-service', '')}`);
        onHighlightPath(serviceIds);
      }
    } catch (err) {
      console.error('Blast radius calculation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlastRadius();
  }, [severity, maxHops]);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-red-950/30 via-slate-900 to-indigo-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-white">Transitive Vulnerability Blast Radius Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Performs multi-hop Cypher traversals (2–5 hops) through nested package dependencies to uncover hidden production microservices and cloud servers affected by upstream open-source vulnerabilities.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Severity Filter</label>
            <select
              value={severity}
              onChange={(e: any) => setSeverity(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-3 py-2 text-white font-medium focus:border-red-500 focus:outline-none"
            >
              <option value="CRITICAL">CRITICAL (CVSS ≥ 9.0)</option>
              <option value="HIGH">HIGH (CVSS ≥ 7.0)</option>
              <option value="ALL">ALL Severities</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Depth: {maxHops} Hops</label>
            <input
              type="range"
              min="1"
              max="5"
              value={maxHops}
              onChange={(e) => setMaxHops(parseInt(e.target.value, 10))}
              className="w-28 accent-indigo-500 cursor-pointer"
            />
          </div>

          <button
            onClick={fetchBlastRadius}
            disabled={isLoading}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-red-600/20 transition-all disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isLoading ? 'Traversing Graph...' : 'Re-Run Multi-Hop'}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      {blastData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Impacted Microservices</span>
              <Cpu className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{blastData.summary.impactedServicesCount}</div>
            <div className="text-[11px] text-indigo-400 mt-1">Direct & Transitive downstream</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Exposed Cloud Servers</span>
              <Server className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{blastData.summary.impactedServersCount}</div>
            <div className="text-[11px] text-amber-400 mt-1">Production AWS/GCP targets</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Upstream CVEs</span>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{blastData.summary.vulnerabilitiesCount}</div>
            <div className="text-[11px] text-red-400 mt-1">Filtered by {severity}</div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Dependency Depth</span>
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2">{maxHops} Hops</div>
            <div className="text-[11px] text-emerald-400 mt-1">openCypher `*1..{maxHops}`</div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Impacted Microservices List */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center justify-between">
            <span>Affected Production Services</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {blastData?.impactedServices?.length || 0}
            </span>
          </h3>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {blastData?.impactedServices?.map((svc: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-indigo-500/40 transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    {svc.name}
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {svc.environment}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Owner: <span className="text-slate-300">{svc.ownerTeam || 'Engineering'}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                    svc.criticality === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {svc.criticality || 'HIGH'}
                  </span>
                  {svc.depth && (
                    <div className="text-[10px] text-slate-500 mt-1">{svc.depth} Hop Path</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executed Cypher Query & Graph Advantage Explanation */}
        <div className="lg:col-span-2 space-y-5">
          {/* Cypher Code Box */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Code2 className="h-4 w-4 text-indigo-400" />
                Executed openCypher Query (Parameterized)
              </h3>
              <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-mono">
                Neo4j JS Driver
              </span>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-indigo-300 overflow-x-auto leading-relaxed">
              {blastData?.query || `MATCH path = (s:Service)-[:USES|DEPENDS_ON*1..5]->(p:Package)-[:HAS_VULNERABILITY]->(v:Vulnerability)
WHERE v.severity = $severity
OPTIONAL MATCH (s)-[:DEPLOYED_TO]->(srv:Server)
RETURN s, p, v, length(path) AS depth`}
            </pre>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
              <ArrowUpRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Bound Parameters: </strong>
                <code className="text-indigo-300 font-mono">{JSON.stringify(blastData?.params || { severity })}</code>
              </div>
            </div>
          </div>

          {/* Why Graph DB Section */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 bg-gradient-to-br from-slate-900 to-indigo-950/40">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Why a Graph Database (CognoDB / openCypher) wins here
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              In a traditional relational database (PostgreSQL / MySQL), querying variable-depth supply chain dependencies requires complex, expensive recursive Common Table Expressions (<code>WITH RECURSIVE</code>) with heavy <code>JOIN</code> operations across multiple tables.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              In <strong>CognoDB openCypher</strong>, paths are first-class primitives. The pattern <code>(s:Service)-[:USES|DEPENDS_ON*1..5]-&gt;(p:Package)</code> traverses variable depth instantly without JOIN overhead, delivering sub-millisecond blast radius results even on massive dependency trees!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

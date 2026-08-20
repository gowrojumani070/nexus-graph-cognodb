'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { GraphCanvas } from '@/components/GraphCanvas';
import { BlastRadiusPanel } from '@/components/BlastRadiusPanel';
import { QueryPlayground } from '@/components/QueryPlayground';
import { NodeDetailsModal } from '@/components/NodeDetailsModal';
import { DatabaseSetupGuide } from '@/components/DatabaseSetupGuide';
import { GraphNode, GraphEdge } from '@/lib/mockData';
import { Cpu, Box, ShieldAlert, Server, User, Network, Sparkles, AlertCircle } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'visualizer' | 'blast' | 'cypher' | 'guide'>('visualizer');
  
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [isLoadingGraph, setIsLoadingGraph] = useState<boolean>(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightPathIds, setHighlightPathIds] = useState<string[]>([]);

  const fetchDbHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbStatus(data);
    } catch (err) {
      setDbStatus({ isConnected: false, isMockFallback: true, error: 'Health check endpoint offline.' });
    }
  };

  const fetchGraphData = async () => {
    setIsLoadingGraph(true);
    try {
      const res = await fetch('/api/graph');
      const data = await res.json();
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      if (data.notice) setNotice(data.notice);
    } catch (err) {
      console.error('Failed to load graph data:', err);
    } finally {
      setIsLoadingGraph(false);
    }
  };

  useEffect(() => {
    fetchDbHealth();
    fetchGraphData();
  }, []);

  // Compute node count metrics
  const microserviceCount = nodes.filter((n) => n.type === 'Service').length;
  const packageCount = nodes.filter((n) => n.type === 'Package').length;
  const cveCount = nodes.filter((n) => n.type === 'Vulnerability').length;
  const serverCount = nodes.filter((n) => n.type === 'Server').length;
  const maintainerCount = nodes.filter((n) => n.type === 'Maintainer').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        onRefreshGraph={() => {
          fetchDbHealth();
          fetchGraphData();
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {notice && (
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-indigo-300 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white text-xs">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Interactive Visualizer & Analytics Dashboard */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Metric Overview Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Cpu className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Microservices</div>
                  <div className="text-lg font-bold text-white">{microserviceCount}</div>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Box className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Packages</div>
                  <div className="text-lg font-bold text-white">{packageCount}</div>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Active CVEs</div>
                  <div className="text-lg font-bold text-white">{cveCount}</div>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Server className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Cloud Servers</div>
                  <div className="text-lg font-bold text-white">{serverCount}</div>
                </div>
              </div>

              <div className="glass-panel p-3.5 rounded-xl border border-slate-800/80 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400 font-sans">Maintainers</div>
                  <div className="text-lg font-bold text-white">{maintainerCount}</div>
                </div>
              </div>
            </div>

            {/* Interactive Graph Canvas */}
            <div className="relative">
              {isLoadingGraph ? (
                <div className="w-full h-[600px] glass-panel rounded-2xl border border-slate-800 flex items-center justify-center flex-col gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Querying CognoDB openCypher Graph...</span>
                </div>
              ) : (
                <GraphCanvas
                  nodes={nodes}
                  edges={edges}
                  onSelectNode={(n) => setSelectedNode(n)}
                  selectedNodeId={selectedNode?.id}
                  highlightPathIds={highlightPathIds}
                />
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Blast Radius Simulator */}
        {activeTab === 'blast' && (
          <BlastRadiusPanel
            onHighlightPath={(pathIds) => {
              setHighlightPathIds(pathIds);
            }}
          />
        )}

        {/* Tab 3: Cypher Query Playground */}
        {activeTab === 'cypher' && <QueryPlayground />}

        {/* Tab 4: CognoDB Setup Guide */}
        {activeTab === 'guide' && <DatabaseSetupGuide />}

      </main>

      {/* Node Details Inspector Sidebar Modal */}
      <NodeDetailsModal
        node={selectedNode}
        edges={edges}
        nodes={nodes}
        onClose={() => setSelectedNode(null)}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-4 text-center text-xs text-slate-500 glass-panel mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NexusGraph · CognoDB Graph Database Application</span>
          <span>Wexa AI Candidate Take-Home Assignment</span>
        </div>
      </footer>

    </div>
  );
}

'use client';

import React from 'react';
import { GraphNode, GraphEdge } from '@/lib/mockData';
import { X, ShieldAlert, Cpu, Server, User, Box, ArrowRight, ExternalLink } from 'lucide-react';

interface NodeDetailsModalProps {
  node: GraphNode | null;
  edges: GraphEdge[];
  nodes: GraphNode[];
  onClose: () => void;
}

export const NodeDetailsModal: React.FC<NodeDetailsModalProps> = ({ node, edges, nodes, onClose }) => {
  if (!node) return null;

  // Find incoming and outgoing edges for this node
  const outgoingEdges = edges.filter((e) => e.from === node.id);
  const incomingEdges = edges.filter((e) => e.to === node.id);

  const getTargetNode = (targetId: string) => nodes.find((n) => n.id === targetId);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl p-6 overflow-y-auto animate-slide-left space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <span className={`p-2 rounded-xl border ${
            node.type === 'Vulnerability' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
            node.type === 'Service' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
            node.type === 'Server' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            node.type === 'Maintainer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {node.type === 'Vulnerability' && <ShieldAlert className="h-5 w-5" />}
            {node.type === 'Service' && <Cpu className="h-5 w-5" />}
            {node.type === 'Server' && <Server className="h-5 w-5" />}
            {node.type === 'Maintainer' && <User className="h-5 w-5" />}
            {node.type === 'Package' && <Box className="h-5 w-5" />}
          </span>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              {node.type} Node
            </span>
            <h3 className="text-base font-bold text-white leading-tight">{node.label}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Node Properties Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Node Attributes</h4>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs font-mono">
          {Object.entries(node.properties || {}).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-0">
              <span className="text-slate-400 font-sans">{key}:</span>
              <span className="text-indigo-300 font-bold max-w-[200px] truncate">{String(val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Outgoing Relationships */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Outgoing Connections</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {outgoingEdges.length}
          </span>
        </h4>

        {outgoingEdges.length > 0 ? (
          <div className="space-y-2">
            {outgoingEdges.map((e) => {
              const target = getTargetNode(e.to);
              return (
                <div key={e.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      -[:{e.label}]-&gt;
                    </span>
                    <span className="text-slate-200 font-semibold">{target?.label || e.to}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{target?.type}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-slate-950 text-slate-500 text-xs rounded-xl border border-slate-800">
            No outgoing relationships from this node.
          </div>
        )}
      </div>

      {/* Connected Incoming Relationships */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Incoming Connections</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
            {incomingEdges.length}
          </span>
        </h4>

        {incomingEdges.length > 0 ? (
          <div className="space-y-2">
            {incomingEdges.map((e) => {
              const source = getTargetNode(e.from);
              return (
                <div key={e.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-200 font-semibold">{source?.label || e.from}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      -[:{e.label}]-&gt;
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">{source?.type}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-3 bg-slate-950 text-slate-500 text-xs rounded-xl border border-slate-800">
            No incoming relationships to this node.
          </div>
        )}
      </div>

    </div>
  );
};

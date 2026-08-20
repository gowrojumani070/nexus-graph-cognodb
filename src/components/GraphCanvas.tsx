'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge } from '@/lib/mockData';
import { Search, Filter, ZoomIn, ZoomOut, RotateCcw, Info, Sliders } from 'lucide-react';

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode | null) => void;
  selectedNodeId?: string | null;
  highlightPathIds?: string[];
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  highlightPathIds = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<any>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [physicsEnabled, setPhysicsEnabled] = useState(true);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Dynamic import vis-network to avoid SSR issues
    let visNetworkModule: any;
    
    const initNetwork = async () => {
      try {
        const vis = await import('vis-network/standalone');
        const visData = await import('vis-data');

        if (!containerRef.current) return;

        // Filter nodes based on search and type
        const filteredNodes = nodes.filter((n) => {
          const matchesType = selectedTypeFilter === 'ALL' || n.type === selectedTypeFilter;
          const matchesSearch =
            n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.properties?.cveId && n.properties.cveId.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (n.properties?.name && n.properties.name.toLowerCase().includes(searchTerm.toLowerCase()));
          return matchesType && matchesSearch;
        });

        const activeNodeIds = new Set(filteredNodes.map((n) => n.id));
        const filteredEdges = edges.filter((e) => activeNodeIds.has(e.from) && activeNodeIds.has(e.to));

        // Styling Vis Nodes
        const formattedNodes = filteredNodes.map((n) => {
          const isSelected = n.id === selectedNodeId;
          const isHighlighted = highlightPathIds.includes(n.id);

          let shape = 'dot';
          let colorBg = '#3b82f6'; // Package blue
          let colorBorder = '#60a5fa';

          if (n.type === 'Service') {
            shape = 'box';
            colorBg = '#6366f1'; // Indigo
            colorBorder = '#818cf8';
          } else if (n.type === 'Vulnerability') {
            shape = 'diamond';
            colorBg = '#ef4444'; // Red
            colorBorder = '#f87171';
          } else if (n.type === 'Maintainer') {
            shape = 'star';
            colorBg = '#10b981'; // Green
            colorBorder = '#34d399';
          } else if (n.type === 'Server') {
            shape = 'database';
            colorBg = '#f59e0b'; // Amber
            colorBorder = '#fbbf24';
          }

          if (isHighlighted) {
            colorBg = '#ec4899'; // Highlight pink
            colorBorder = '#f472b6';
          }

          return {
            id: n.id,
            label: n.label,
            title: `<b>${n.type}: ${n.label}</b><br/>${JSON.stringify(n.properties, null, 1)}`,
            shape,
            size: n.type === 'Vulnerability' ? 24 : n.type === 'Service' ? 22 : 18,
            color: {
              background: colorBg,
              border: isSelected ? '#ffffff' : colorBorder,
              highlight: {
                background: colorBg,
                border: '#ffffff',
              },
            },
            font: {
              color: '#ffffff',
              size: 13,
              face: 'system-ui, sans-serif',
            },
            borderWidth: isSelected ? 4 : isHighlighted ? 3 : 1.5,
            shadow: isSelected || isHighlighted,
          };
        });

        // Styling Vis Edges
        const formattedEdges = filteredEdges.map((e) => {
          let edgeColor = '#475569';
          if (e.label === 'HAS_VULNERABILITY') edgeColor = '#f87171';
          else if (e.label === 'USES') edgeColor = '#818cf8';
          else if (e.label === 'DEPENDS_ON') edgeColor = '#60a5fa';
          else if (e.label === 'DEPLOYED_TO') edgeColor = '#fbbf24';
          else if (e.label === 'MAINTAINED_BY') edgeColor = '#34d399';

          const isHighlightedEdge =
            highlightPathIds.length > 0 &&
            highlightPathIds.includes(e.from) &&
            highlightPathIds.includes(e.to);

          return {
            id: e.id,
            from: e.from,
            to: e.to,
            label: e.label,
            arrows: 'to',
            color: {
              color: isHighlightedEdge ? '#ec4899' : edgeColor,
              highlight: '#ffffff',
              opacity: isHighlightedEdge ? 1.0 : 0.7,
            },
            width: isHighlightedEdge ? 3.5 : 1.5,
            dashes: e.label === 'USES' || e.label === 'DEPLOYED_TO',
            font: {
              color: '#94a3b8',
              size: 10,
              align: 'middle',
            },
          };
        });

        const data = {
          nodes: new visData.DataSet(formattedNodes),
          edges: new visData.DataSet(formattedEdges),
        };

        const options = {
          physics: {
            enabled: physicsEnabled,
            barnesHut: {
              gravitationalConstant: -3000,
              centralGravity: 0.3,
              springLength: 120,
              springConstant: 0.04,
              damping: 0.09,
            },
          },
          interaction: {
            hover: true,
            tooltipDelay: 100,
            zoomView: true,
            dragNodes: true,
          },
        };

        if (networkRef.current) {
          networkRef.current.destroy();
        }

        networkRef.current = new vis.Network(containerRef.current, data, options);

        networkRef.current.on('selectNode', (params: any) => {
          const clickedId = params.nodes[0];
          const found = nodes.find((n) => n.id === clickedId);
          onSelectNode(found || null);
        });

        networkRef.current.on('deselectNode', () => {
          onSelectNode(null);
        });
      } catch (err) {
        console.error('Vis-network render error:', err);
      }
    };

    initNetwork();

    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges, searchTerm, selectedTypeFilter, physicsEnabled, selectedNodeId, highlightPathIds]);

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 0.8 });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: { duration: 500 } });
    }
  };

  return (
    <div className="relative w-full h-[640px] rounded-2xl glass-panel border border-slate-800 overflow-hidden flex flex-col">
      {/* Top Filter Controls */}
      <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter nodes by name or CVE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Node Type Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Service', 'Package', 'Vulnerability', 'Maintainer', 'Server'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                selectedTypeFilter === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Canvas Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPhysicsEnabled(!physicsEnabled)}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
              physicsEnabled
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
            title="Toggle Graph Physics Simulation"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Physics</span>
          </button>

          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800"
            title="Reset Canvas View"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Vis Canvas Viewport */}
      <div ref={containerRef} className="flex-1 w-full h-full bg-slate-950/60" />

      {/* Legend Footer */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-indigo-500 inline-block"></span>
            Microservice
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block"></span>
            Package
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 transform rotate-45 bg-red-500 inline-block"></span>
            Vulnerability (CVE)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-emerald-500 inline-block"></span>
            Maintainer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded bg-amber-500 inline-block"></span>
            Cloud Server
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500">
          <Info className="h-3 w-3" /> Click any node to inspect relationships
        </div>
      </div>
    </div>
  );
};

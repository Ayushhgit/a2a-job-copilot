import { useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  MarkerType,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
} from 'reactflow';
import { useA2AStore } from '../store/a2aStore';

/* ── Agent color map ── */
const COLORS: Record<string, string> = {
  System:          '#64748b',
  JDAnalyzer:      '#8b5cf6',
  Matcher:         '#f59e0b',
  ResumeGenerator: '#10b981',
  Optimizer:       '#f43f5e',
  Router:          '#06b6d4',
};

const SUBTITLES: Record<string, string> = {
  System:          'Store / FAISS',
  JDAnalyzer:      'Extract skills',
  Router:          'Route traffic',
  Matcher:         'Vector search',
  ResumeGenerator: 'Build JSON',
  Optimizer:       'ATS + LaTeX',
};

/* ── Custom node component ── */
function AgentNode({ data }: NodeProps) {
  const color = COLORS[data.id] ?? '#52525b';
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ background: color, border: 'none', width: 6, height: 6 }} />
      <Handle type="target" position={Position.Left}   style={{ background: color, border: 'none', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 6, height: 6 }} />
      <Handle type="source" position={Position.Right}  style={{ background: color, border: 'none', width: 6, height: 6 }} />

      <div
        className="rf-agent-node"
        style={{ ['--node-color' as string]: color }}
      >
        <div className="rf-agent-node__type" style={{ color }}>
          {SUBTITLES[data.id] ?? data.id}
        </div>
        <div className="rf-agent-node__label">{data.label}</div>
      </div>
    </>
  );
}

const NODE_TYPES = { agentNode: AgentNode };

/* ── Static node positions ── */
const makeNode = (id: string, label: string, x: number, y: number): Node => ({
  id,
  type: 'agentNode',
  position: { x, y },
  data: { id, label },
  draggable: false,
});

const INITIAL_NODES: Node[] = [
  makeNode('System',          'Data Store',       180,  20),
  makeNode('JDAnalyzer',      'JD Analyzer',       30, 140),
  makeNode('Router',          'Router',           180, 260),
  makeNode('Matcher',         'Matcher',          330, 140),
  makeNode('ResumeGenerator', 'Resume Gen',        30, 380),
  makeNode('Optimizer',       'Optimizer',        330, 380),
];

/* ── Edge color by type ── */
function edgeColor(type: string) {
  if (type === 'tool_result') return '#06b6d4';
  if (type === 'result')      return '#10b981';
  return '#6366f1';
}

export function FlowGraph() {
  const edgesList = useA2AStore((s) => s.edges);
  const [nodes,, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const flowEdges: Edge[] = edgesList.map((e, i) => {
      const color = edgeColor(e.type);
      return {
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        animated: true,
        style: { stroke: color, strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 14 },
        label: e.type,
        labelStyle: { fill: '#71717a', fontSize: 9, fontWeight: 600 },
        labelBgStyle: { fill: '#09090b', fillOpacity: 0.9 },
        labelBgPadding: [4, 2] as [number, number],
      };
    });
    setEdges(flowEdges);
  }, [edgesList, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#27272a"
          gap={20}
          size={1}
        />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

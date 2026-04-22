import React, { useEffect } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    Edge, 
    Node, 
    MarkerType,
    useNodesState,
    useEdgesState 
} from 'reactflow';
import { useA2AStore } from '../store/a2aStore';

const initialNodes: Node[] = [
    { id: 'System', position: { x: 250, y: 50 }, data: { label: 'User Store / FAISS' }, className: 'bg-emerald-900/50 border-emerald-500 text-white rounded shadow-lg px-4 py-2 font-medium border text-center' },
    { id: 'JDAnalyzer', position: { x: 50, y: 150 }, data: { label: 'JD Analyzer Agent' }, className: 'bg-blue-900/50 border-blue-500 text-white rounded shadow-lg px-4 py-2 font-medium border text-center w-32' },
    { id: 'Router', position: { x: 250, y: 250 }, data: { label: 'Copilot Router' }, className: 'bg-purple-900/50 border-purple-500 text-white rounded shadow-lg px-4 py-2 font-medium border text-center w-36' },
    { id: 'Matcher', position: { x: 450, y: 150 }, data: { label: 'Matcher Agent' }, className: 'bg-orange-900/50 border-orange-500 text-white rounded shadow-lg px-4 py-2 font-medium border text-center w-32' },
    { id: 'ResumeGenerator', position: { x: 50, y: 400 }, data: { label: 'Resume Generator' }, className: 'bg-red-900/50 border-red-500 text-white rounded shadow-lg px-4 py-2 font-medium border text-center w-32' },
    { id: 'Optimizer', position: { x: 450, y: 400 }, data: { label: 'ATS Optimizer' }, className: 'bg-teal-900/50 border-teal-500 text-white rounded shadow-lg px-4 py-2 font-medium border text-center w-32' },
];

export function FlowGraph() {
    const edgesList = useA2AStore((s) => s.edges);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        const flowEdges: Edge[] = edgesList.map((e, idx) => ({
            id: `e-${idx}`,
            source: e.source,
            target: e.target,
            animated: true,
            label: e.type,
            style: { stroke: '#10b981', strokeWidth: 2 },
            labelStyle: { fill: '#cbd5e1', fontWeight: 600, fontSize: 12 },
            labelBgStyle: { fill: '#0f172a', color: '#fff', fillOpacity: 0.8 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#10b981',
            },
        }));
        setEdges(flowEdges);
    }, [edgesList, setEdges]);

    return (
        <div className="w-full h-full glass-panel rounded-xl overflow-hidden shadow-xl border border-white/5 relative">
            <ReactFlow 
                nodes={nodes} 
                edges={edges} 
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                proOptions={{ hideAttribution: true }}
                autoPanOnNodeDrag={false}
                nodesDraggable={false} 
            >
                <Background color="#334155" size={2} gap={24} />
                <Controls className="bg-gray-800 border-gray-700 fill-gray-300 shadow-xl" />
            </ReactFlow>
            <div className="absolute top-4 left-4 text-xs font-semibold text-gray-500 bg-gray-900/80 px-3 py-1 rounded border border-gray-700">
                A2A Pipeline Traffic
            </div>
        </div>
    );
}

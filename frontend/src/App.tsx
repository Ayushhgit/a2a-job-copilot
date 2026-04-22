import React, { useEffect } from 'react';
import { TaskInput } from './components/TaskInput';
import { LogView } from './components/LogView';
import { FlowGraph } from './components/FlowGraph';
import { ResumeOutput } from './components/ResumeOutput';
import { useA2AStore } from './store/a2aStore';
import { FileText } from 'lucide-react';

function App() {
  const addLog = useA2AStore((s) => s.addLog);
  const addEdge = useA2AStore((s) => s.addEdge);
  const setFinalLatex = useA2AStore((s) => s.setFinalLatex);
  const setLoading = useA2AStore((s) => s.setLoading);
  const clearEdges = useA2AStore((s) => s.clearEdges);

  useEffect(() => {
    let sse: EventSource;

    const connectSSE = () => {
        sse = new EventSource('http://localhost:8000/api/events');

        sse.addEventListener('message', (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.type === 'log') {
                    addLog({
                        id: data.id,
                        timestamp: data.timestamp,
                        sender: data.sender,
                        text: data.payload.text
                    });
                } else if (data.type === 'edge') {
                    addEdge(data.payload);
                } else if (data.type === 'task_complete') {
                    setLoading(false);
                    setFinalLatex(data.payload.result);
                    setTimeout(() => clearEdges(), 5000);
                }
            } catch (err) {
                console.error('Error parsing SSE', err);
            }
        });
        
        sse.onerror = () => {
            console.warn("SSE stream interrupted, reconnecting...");
            sse.close();
            setTimeout(connectSSE, 2000); 
        };
    };

    connectSSE();

    return () => {
        if(sse) sse.close();
    };
  }, [addLog, addEdge, setFinalLatex, setLoading, clearEdges]);

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 text-gray-100 font-sans relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6 relative z-10 w-full flex-1 min-h-0">
        <header className="flex items-center gap-3 py-2 flex-shrink-0">
            <div className="p-2 bg-emerald-500/20 rounded-lg shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
                <FileText className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">AI Resume Copilot</h1>
                <p className="text-sm text-gray-400">Powered by A2A Protocol</p>
            </div>
        </header>

        <TaskInput />
        <ResumeOutput />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[400px]">
            <div className="h-full">
                <FlowGraph />
            </div>
            <div className="h-full">
                <LogView />
            </div>
        </div>
      </div>
    </div>
  )
}

export default App

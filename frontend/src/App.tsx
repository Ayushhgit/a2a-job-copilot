import { useEffect } from 'react';
import { TaskInput } from './components/TaskInput';
import { LogView } from './components/LogView';
import { FlowGraph } from './components/FlowGraph';
import { ResumeOutput } from './components/ResumeOutput';
import { useA2AStore } from './store/a2aStore';
import { GitBranch } from 'lucide-react';

function App() {
  const addLog      = useA2AStore((s) => s.addLog);
  const addEdge     = useA2AStore((s) => s.addEdge);
  const setFinalLatex = useA2AStore((s) => s.setFinalLatex);
  const setLoading  = useA2AStore((s) => s.setLoading);
  const clearEdges  = useA2AStore((s) => s.clearEdges);
  const isLoading   = useA2AStore((s) => s.isLoading);
  const finalLatex  = useA2AStore((s) => s.finalLatex);

  useEffect(() => {
    let sse: EventSource;
    const connect = () => {
      sse = new EventSource('http://localhost:8000/api/events');
      sse.addEventListener('message', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === 'log') {
            addLog({ id: data.id, timestamp: data.timestamp, sender: data.sender, text: data.payload.text });
          } else if (data.type === 'edge') {
            addEdge(data.payload);
          } else if (data.type === 'task_complete') {
            setLoading(false);
            setFinalLatex(data.payload.result);
            setTimeout(() => clearEdges(), 6000);
          }
        } catch {}
      });
      sse.onerror = () => { sse.close(); setTimeout(connect, 2000); };
    };
    connect();
    return () => sse?.close();
  }, [addLog, addEdge, setFinalLatex, setLoading, clearEdges]);

  return (
    <div className="app-root">
      {/* ── Header ── */}
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 6,
            background: '#1e1e2e', border: '1px solid #3b3b52',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GitBranch size={13} color="#6366f1" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fafafa', letterSpacing: '-0.01em' }}>
            Resume Copilot
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            background: '#1e1b4b', color: '#818cf8', padding: '2px 7px',
            borderRadius: 4, border: '1px solid #312e81',
          }}>
            A2A
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={`dot ${isLoading ? 'dot--active' : 'dot--idle'}`} />
          <span style={{ fontSize: 11, color: '#52525b' }}>
            {isLoading ? 'Pipeline running…' : 'Idle'}
          </span>
        </div>
      </header>

      {/* ── Body grid ── */}
      <div className="app-body">
        {/* Left: controls */}
        <div className="panel-col" style={{ overflowY: 'auto' }}>
          <TaskInput />
        </div>

        {/* Center: flow graph */}
        <div className="panel-col">
          <div className="panel-header">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="2" cy="6" r="1.5" fill="#52525b"/>
              <circle cx="6" cy="2" r="1.5" fill="#52525b"/>
              <circle cx="6" cy="10" r="1.5" fill="#52525b"/>
              <circle cx="10" cy="6" r="1.5" fill="#52525b"/>
              <line x1="3.5" y1="5.25" x2="4.75" y2="2.75" stroke="#3f3f46" strokeWidth="1"/>
              <line x1="3.5" y1="6.75" x2="4.75" y2="9.25" stroke="#3f3f46" strokeWidth="1"/>
              <line x1="7.25" y1="2.75" x2="8.5" y2="5.25" stroke="#3f3f46" strokeWidth="1"/>
              <line x1="7.25" y1="9.25" x2="8.5" y2="6.75" stroke="#3f3f46" strokeWidth="1"/>
            </svg>
            <span className="panel-label">Agent Pipeline</span>
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            <FlowGraph />
          </div>
        </div>

        {/* Right: logs */}
        <div className="panel-col">
          <LogView />
        </div>
      </div>

      {/* ── Result drawer ── */}
      {finalLatex && (
        <div className="app-result-drawer">
          <ResumeOutput />
        </div>
      )}
    </div>
  );
}

export default App;

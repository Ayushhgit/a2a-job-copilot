import { useEffect, useRef } from 'react';
import { useA2AStore, LogEntry } from '../store/a2aStore';

const AGENT_COLORS: Record<string, string> = {
  System:           '#64748b',
  JDAnalyzer:       '#8b5cf6',
  Matcher:          '#f59e0b',
  ResumeGenerator:  '#10b981',
  Optimizer:        '#f43f5e',
  Router:           '#06b6d4',
};

function getColor(sender: string) {
  return AGENT_COLORS[sender] ?? '#52525b';
}

function classifyText(text: string): 'error' | 'tool' | 'done' | 'normal' {
  if (text.toLowerCase().includes('error') || text.toLowerCase().includes('failed')) return 'error';
  if (text.toLowerCase().includes('executing tool') || text.toLowerCase().includes('tool result')) return 'tool';
  if (text.toLowerCase().includes('complete') || text.toLowerCase().includes('latex generation')) return 'done';
  return 'normal';
}

function LogRow({ log }: { log: LogEntry }) {
  const color = getColor(log.sender);
  const kind  = classifyText(log.text);
  const time  = new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="log-entry">
      <div className="log-meta">
        <span
          className="agent-chip"
          style={{ color, borderColor: color + '40', background: color + '12' }}
        >
          {log.sender}
        </span>
        <span className="log-time">{time}</span>
      </div>
      <span className={`log-text log-text--${kind}`}>
        {log.text}
      </span>
    </div>
  );
}

export function LogView() {
  const logs      = useA2AStore((s) => s.logs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <>
      <div className="panel-header">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="2" width="10" height="1.2" rx="0.6" fill="#52525b"/>
          <rect x="1" y="5.4" width="7"  height="1.2" rx="0.6" fill="#52525b"/>
          <rect x="1" y="8.8" width="8.5"height="1.2" rx="0.6" fill="#52525b"/>
        </svg>
        <span className="panel-label">Trace</span>
        {logs.length > 0 && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, color: '#3f3f46',
            background: '#18181b', border: '1px solid #27272a',
            padding: '1px 6px', borderRadius: 3,
          }}>
            {logs.length}
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', background: '#09090b' }}
      >
        {logs.length === 0 ? (
          <div style={{
            padding: '32px 16px', textAlign: 'center',
            color: '#3f3f46', fontSize: 12,
          }}>
            No events yet.<br />
            <span style={{ fontSize: 11, color: '#27272a' }}>Load a profile and run the pipeline.</span>
          </div>
        ) : (
          logs.map((log) => <LogRow key={log.id} log={log} />)
        )}
      </div>
    </>
  );
}

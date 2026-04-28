import { useState } from 'react';
import { Download, Copy, Check, FileCode } from 'lucide-react';
import { useA2AStore } from '../store/a2aStore';

function extractLatex(raw: string): string {
  const start = raw.indexOf('\\documentclass');
  if (start === -1) return raw;
  const trimmed = raw.substring(start);
  const end = trimmed.lastIndexOf('\\end{document}');
  return end === -1 ? trimmed : trimmed.substring(0, end + 14);
}

export function ResumeOutput() {
  const finalLatex = useA2AStore((s) => s.finalLatex);
  const [copied, setCopied] = useState(false);

  if (!finalLatex) return null;

  const tex = extractLatex(finalLatex);
  const lines = tex.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(tex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([tex], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'resume_optimized.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Header */}
      <div
        className="panel-header"
        style={{ justifyContent: 'space-between', height: 44, padding: '0 14px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileCode size={13} color="#10b981" />
          <span style={{ fontSize: 12, fontWeight: 600, color: '#fafafa' }}>
            Optimized Resume
          </span>
          <span style={{
            fontSize: 10, color: '#3f3f46',
            background: '#18181b', border: '1px solid #27272a',
            padding: '1px 6px', borderRadius: 3,
          }}>
            .tex · {lines} lines
          </span>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
            background: '#052e16', color: '#4ade80', border: '1px solid #14532d',
            padding: '1px 6px', borderRadius: 3,
          }}>
            Ready
          </span>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn" onClick={handleCopy} style={{ fontSize: 11 }}>
            {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn" onClick={handleDownload} style={{ fontSize: 11 }}>
            <Download size={12} />
            Download .tex
          </button>
        </div>
      </div>

      {/* Code block */}
      <pre className="code-output">
        <code>{tex}</code>
      </pre>
    </>
  );
}

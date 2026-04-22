import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { useA2AStore } from '../store/a2aStore';

export function LogView() {
    const logs = useA2AStore((s) => s.logs);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="glass-panel flex flex-col h-full rounded-xl overflow-hidden shadow-xl border border-white/5">
            <div className="bg-gray-900/80 p-3 border-b border-gray-800 flex items-center gap-2">
                <Terminal className="text-emerald-400 w-5 h-5" />
                <h3 className="font-semibold text-gray-200">System Logs & Telemetry</h3>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-sm bg-black/40">
                {logs.length === 0 ? (
                    <div className="text-gray-600 italic">Waiting for an execution to begin...</div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                                <span className="text-emerald-500/80">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className="text-blue-400 font-semibold">{log.sender}</span>
                            </div>
                            <div className="text-gray-300 whitespace-pre-wrap">{log.text}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

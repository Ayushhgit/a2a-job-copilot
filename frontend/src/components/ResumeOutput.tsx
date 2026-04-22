import React, { useState } from 'react';
import { Download, Copy, CheckCircle } from 'lucide-react';
import { useA2AStore } from '../store/a2aStore';

export function ResumeOutput() {
    const finalLatex = useA2AStore((s) => s.finalLatex);
    const [copied, setCopied] = useState(false);

    if (!finalLatex) return null;

    const parsePayload = () => {
        try {
             if(finalLatex.includes("\\documentclass")){
                const startIndex = finalLatex.indexOf("\\documentclass");
                let latexCode = finalLatex.substring(startIndex);
                const endIndex = latexCode.lastIndexOf("\\end{document}") + 14; 
                return latexCode.substring(0, endIndex);
             }
             return finalLatex;
        } catch (e) {
            return finalLatex;
        }
    };

    const texContent = parsePayload();

    const handleCopy = () => {
        navigator.clipboard.writeText(texContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([texContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'optimized_resume.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="glass-panel p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 shadow-xl shadow-emerald-500/5 col-span-1 lg:col-span-2 relative">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                    Final Optimized Resume (.tex)
                </h3>
                <div className="flex gap-2 text-sm">
                    <button onClick={handleCopy} className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded transition-colors text-gray-200">
                        <Copy className="w-4 h-4" /> {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={handleDownload} className="flex items-center gap-1 bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded transition-colors text-white">
                        <Download className="w-4 h-4" /> Download .tex
                    </button>
                </div>
            </div>
            
            <div className="bg-gray-950 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-800 font-mono text-sm text-orange-200 leading-relaxed custom-scrollbar">
                <pre>{texContent}</pre>
            </div>
        </div>
    );
}

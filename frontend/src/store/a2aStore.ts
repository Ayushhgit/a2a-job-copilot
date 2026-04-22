import { create } from 'zustand';

export interface LogEntry {
    id: string;
    timestamp: string;
    sender: string;
    text: string;
}

export interface EdgeEntry {
    source: string;
    target: string;
    type: string;
}

interface A2AState {
    logs: LogEntry[];
    edges: EdgeEntry[];
    isLoading: boolean;
    finalLatex: string | null;
    
    addLog: (log: LogEntry) => void;
    addEdge: (edge: EdgeEntry) => void;
    setLoading: (loading: boolean) => void;
    setFinalLatex: (latex: string | null) => void;
    clearEdges: () => void;
    resetStore: () => void;
}

export const useA2AStore = create<A2AState>((set) => ({
    logs: [],
    edges: [],
    isLoading: false,
    finalLatex: null,

    addLog: (log) => set((state) => ({
        logs: [...state.logs, log].slice(-300)
    })),
    
    addEdge: (edge) => set((state) => {
        const next = [...state.edges, edge];
        if (next.length > 5) return { edges: next.slice(next.length - 5) };
        return { edges: next };
    }),

    setLoading: (loading) => set({ isLoading: loading }),
    setFinalLatex: (latex) => set({ finalLatex: latex }),
    clearEdges: () => set({ edges: [] }),
    resetStore: () => set({ logs: [], edges: [], finalLatex: null, isLoading: true })
}));

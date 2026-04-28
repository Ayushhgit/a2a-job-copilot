import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import App from './App.tsx'
import 'reactflow/dist/style.css';
import './index.css'

const queryClient = new QueryClient();

function Fallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-red-500 font-mono p-4">
      <div className="bg-red-950/30 p-6 rounded-lg border border-red-500/50 shadow-xl max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Frontend Crashed</h2>
        <pre className="text-sm overflow-auto">{error.message}</pre>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepoBySlug } from '../lib/api'
import { Sparkles, AlertCircle } from 'lucide-react'

export default function DemoPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getRepoBySlug('facebook-react')
      .then(() => navigate('/dashboard/facebook-react', { replace: true }))
      .catch(() => setError('Demo data not seeded. Please run the seed command on your terminal.'))
  }, [navigate])

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 select-none font-body">
      <div className="glass-panel rounded-[32px] p-8 max-w-sm text-center border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-500/5 blur-2xl pointer-events-none -z-10" />

        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 relative">
          {error ? (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          ) : (
            <div className="absolute inset-1 rounded-full border-2 border-t-purple-400 border-r-indigo-400 border-b-transparent border-l-transparent animate-spin" />
          )}
        </div>

        <p className={`text-sm ${error ? 'text-rose-400 font-medium' : 'text-slate-300 animate-pulse font-medium'}`}>
          {error || 'Decompressing React Demo Snapshot...'}
        </p>

        {error && (
          <button 
            onClick={() => navigate('/')} 
            className="mt-6 liquid-button px-5 py-2.5 rounded-full text-xs font-bold text-white tracking-wide shadow-lg w-full flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Return to Command Center
          </button>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Search, Activity, Star, Code2, AlertCircle, TrendingUp, Layers, Award, Terminal } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const GithubIcon = ({ className, size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

function App() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)

  const analyzeProfile = async (e) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError('')
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/analyze', {
        github_username: username
      })
      setReport(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'GitHub User not found or API Limit reached.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden">
      <div className="bg-mesh" />
      <div className="bg-grid" />

      {/* Header Container */}
      <nav className="max-w-6xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
            <Terminal size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">DevAnalyzer<span className="text-blue-500">.</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-white transition-colors">Docs</a>
          <a href="#" className="hover:text-white transition-colors">API</a>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-12 pb-24 relative z-10 flex flex-col items-center">
        
        {/* Hero Section */}
        {!report && !loading && (
          <div className="w-full text-center animate-fade-in mb-12">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
              Unlock Your <span className="text-blue-400">GitHub Potential</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Professional-grade skill analysis.
            </p>
          </div>
        )}

        {/* Search Bar - Fixed Sizing */}
        <div className={`w-full max-w-2xl transition-all duration-700 ${report ? 'mb-12' : 'mb-24'}`}>
          <form onSubmit={analyzeProfile} className="relative group w-full">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl w-full">
              <div className="pl-4">
                <GithubIcon className="text-slate-500" />
              </div>
              <input
                type="text"
                className="w-full px-4 py-4 bg-transparent text-lg text-white focus:outline-none placeholder-slate-600"
                placeholder="Enter GitHub Username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {loading ? '...' : 'Analyze Now'}
              </button>
            </div>
          </form>
          {error && <p className="mt-4 text-center text-red-400 font-medium flex items-center justify-center gap-2"><AlertCircle size={18} /> {error}</p>}
        </div>

        {/* Dashboard Grid - Fixed Sizing */}
        {report && (
          <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">
            
            {/* Left Column */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="glass-card p-8 rounded-3xl">
                <p className="text-slate-400 font-medium mb-2 uppercase text-xs">Overall Score</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-7xl font-black text-white">{report.score}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center">
                  <Star className="text-yellow-400 mb-2" size={24} />
                  <p className="text-slate-400 text-xs mb-1">Stars</p>
                  <p className="text-xl font-bold text-white">{report.total_stars}</p>
                </div>
                <div className="glass-card p-6 rounded-3xl flex flex-col items-center">
                  <Code2 className="text-blue-400 mb-2" size={24} />
                  <p className="text-slate-400 text-xs mb-1">Repos</p>
                  <p className="text-xl font-bold text-white">{report.total_repos}</p>
                </div>
              </div>

              <div className="glass-card p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                  <Layers className="text-purple-400" size={18} /> Domains
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.inferred_domains.map(domain => (
                    <span key={domain} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs font-semibold uppercase">
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="md:col-span-8 flex flex-col gap-6">
              <div className="glass-card p-8 rounded-3xl min-h-[450px] w-full">
                <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-widest text-sm">Language Distribution</h3>
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(report.languages).map(([name, bytes]) => ({ name, value: Math.round(bytes / 1024) })).sort((a,b) => b.value - a.value).slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                        {Object.entries(report.languages).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-6 rounded-3xl border-l-4 border-emerald-500">
                  <h4 className="font-bold text-emerald-400 mb-1 text-xs uppercase">Strength</h4>
                  <p className="text-slate-300 text-sm leading-snug">{report.strengths}</p>
                </div>
                <div className="glass-card p-6 rounded-3xl border-l-4 border-red-500">
                  <h4 className="font-bold text-red-400 mb-1 text-xs uppercase">Gap</h4>
                  <p className="text-slate-300 text-sm leading-snug">{report.weaknesses}</p>
                </div>
                <div className="glass-card p-6 rounded-3xl border-l-4 border-blue-500">
                  <h4 className="font-bold text-blue-400 mb-1 text-xs uppercase">Action</h4>
                  <p className="text-slate-300 text-sm leading-snug">{report.suggestions}</p>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  )
}

export default App

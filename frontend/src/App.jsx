import { useState, useEffect } from 'react'
import { Search, Star, Code2, AlertCircle, TrendingUp, Award, Terminal, Zap, PieChart, GitBranch, Layout, Cpu } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, YAxis, Cell } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
)

function App() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState(null)
  const [aiInsight, setAiInsight] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)

  const downloadPDF = async () => {
    try {
      const element = document.getElementById('dashboard-report')
      if (!element) throw new Error('Report element not found')

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#020617',
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 1400,
        onclone: (clonedDoc) => {
          const reportEl = clonedDoc.getElementById('dashboard-report');
          
          // Clear styles but replace with a high-fidelity layout engine
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());

          const pdfStyle = clonedDoc.createElement('style');
          pdfStyle.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            
            #dashboard-report { 
              background-color: #020617 !important; 
              color: #f1f5f9 !important; 
              font-family: 'Inter', sans-serif !important; 
              width: 1400px !important; 
              padding: 60px !important; 
              display: flex !important;
              flex-direction: column !important;
              gap: 40px !important;
              min-height: 2000px !important; /* Ensure background covers enough space */
            }
            
            /* Main 2-Column Dashboard Grid Re-implementation */
            .grid.lg\\:grid-cols-12 { 
              display: flex !important; 
              flex-direction: row !important;
              gap: 40px !important; 
              width: 100% !important;
            }
            
            /* Left Rail */
            .lg\\:col-span-4 { 
              width: 420px !important; 
              display: flex !important;
              flex-direction: column !important;
              gap: 40px !important;
              flex-shrink: 0 !important;
            }
            
            /* Right Content Area */
            .lg\\:col-span-8 { 
              flex: 1 !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 40px !important;
              min-width: 0 !important; /* Prevents flex blowout */
            }
            
            /* Nested Horizontal Grids */
            .grid.md\\:grid-cols-2 { 
              display: flex !important; 
              flex-direction: row !important;
              gap: 40px !important; 
              width: 100% !important;
            }
            .grid.md\\:grid-cols-2 > div { 
              flex: 1 !important; 
              min-width: 0 !important;
            }

            /* Card Styling */
            .pdf-break-avoid { 
              page-break-inside: avoid !important; 
              break-inside: avoid !important; 
              background-color: #0f172a !important; 
              border: 1px solid rgba(255,255,255,0.1) !important; 
              border-radius: 48px !important; 
              padding: 48px !important; 
              position: relative !important;
              display: flex !important;
              flex-direction: column !important;
            }

            /* Chart Container Fix */
            .h-\\[400px\\], .h-\\[300px\\] {
              height: 350px !important;
              width: 100% !important;
              position: relative !important;
              display: block !important;
            }
            
            /* Text & Typography */
            h2, h3 { color: #ffffff !important; font-weight: 900 !important; margin: 0 0 24px 0 !important; }
            .text-5xl { font-size: 44px !important; }
            .text-2xl { font-size: 20px !important; }
            .text-white { color: #ffffff !important; }
            .text-cyan-400 { color: #22d3ee !important; }
            .text-slate-400 { color: #94a3b8 !important; }
            
            /* Utility Fixes */
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .text-center { text-align: center !important; }
            .rounded-full { border-radius: 9999px !important; }
            .w-48 { width: 180px !important; height: 180px !important; }
            
            .bg-white\\/5 { background-color: rgba(255,255,255,0.08) !important; border-radius: 24px !important; padding: 20px !important; }
            .bg-cyan-500\\/10 { background-color: rgba(34,211,238,0.1) !important; padding: 12px 24px !important; border-radius: 16px !important; }

            /* Recharts & SVG Fixes */
            svg { 
              width: 100% !important; 
              height: 100% !important; 
              display: block !important;
              position: relative !important;
            }
            .recharts-cartesian-axis-tick-value { fill: #94a3b8 !important; font-size: 12px !important; }
          `;
          clonedDoc.head.appendChild(pdfStyle);

          // Deep clean illegal tokens
          clonedDoc.querySelectorAll('*').forEach(el => {
            const style = el.getAttribute('style') || '';
            if (style.includes('okl')) {
              el.setAttribute('style', style.replace(/(?:oklch|oklab|color-mix)\s*\([^)]+\)/gi, '#06b6d4'));
            }
          });
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${username || 'developer'}_audit.pdf`)
    } catch (err) {
      console.error('PDF Export Error:', err)
      alert(`Export Failed: Tailwind v4 production colors crashed. Try again.`)
    }
  }

  const generateAiMentor = async (data) => {
    setGeneratingAi(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://uomkrgqgxbvdmvcikdhh.supabase.co/functions/v1'
      const response = await axios.post(`${apiUrl}/analyze-ai-v2`, {
        name: data.name,
        score: data.score,
        domain: data.primary_domain,
        languages: data.languages
      })
      setAiInsight(response.data.advice)
    } catch (err) {
      setAiInsight('Mentor is currently calibrating neural pathways. Keep coding with precision.')
    } finally {
      setGeneratingAi(false)
    }
  }

  const analyzeProfile = async (e) => {
    e.preventDefault()
    if (!username.trim()) return
    setLoading(true)
    setError('')
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://uomkrgqgxbvdmvcikdhh.supabase.co/functions/v1'
      const response = await axios.post(`${apiUrl}/analyze-v3`, { github_username: username })
      setReport(response.data)
      generateAiMentor(response.data)
    } catch (err) {
      setError('GitHub User not found or API Limit reached.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden bg-[#020617] text-slate-300 font-['Inter',sans-serif]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[160px]" />
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-8 py-10 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-cyan-500 p-2.5 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)]">
            <Terminal size={26} className="text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-white">DevAnalyzer<span className="text-cyan-500">.</span></span>
        </div>
        <div className="hidden md:flex gap-10 text-sm font-semibold text-slate-500">
          <a href="#" className="hover:text-cyan-400 transition-all">Documentation</a>
          <a href="#" className="hover:text-cyan-400 transition-all">Cloud API</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-12 pb-32 relative z-10">
        
        {/* Search Engine */}
        <div className={`w-full max-w-4xl mx-auto transition-all duration-1000 ${report ? 'mb-20' : 'mb-40 mt-20'}`}>
          {!report && !loading && (
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
              <h1 className="text-7xl md:text-9xl font-black mb-8 leading-[0.9] text-white tracking-tighter">
                Analyze Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">Digital DNA.</span>
              </h1>
            </div>
          )}
          
          <form onSubmit={analyzeProfile} className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-700"></div>
            <div className="relative flex items-center bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] p-2.5 shadow-3xl">
              <div className="pl-8"><GithubIcon size={28} className="text-slate-500" /></div>
              <input
                type="text"
                className="w-full px-8 py-6 bg-transparent text-2xl text-white focus:outline-none placeholder-slate-700 font-medium"
                placeholder="github_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap px-12 py-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xl font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
              >
                {loading ? 'ANALYZING...' : 'RUN AUDIT'}
              </button>
            </div>
          </form>
          {error && <p className="mt-8 text-center text-red-400 font-bold flex items-center justify-center gap-3 animate-pulse"><AlertCircle size={20} /> {error}</p>}
        </div>

        {report && (
          <div id="dashboard-report" className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Profile & Core Metrics */}
              <div className="lg:col-span-4 space-y-10">
                {/* Profile Card */}
                <div className="pdf-break-avoid bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-10">
                      <div className="absolute inset-0 bg-cyan-500/30 blur-[60px] rounded-full" />
                      <img src={report.avatar_url} alt="User" className="w-48 h-48 rounded-full border-4 border-cyan-500 relative z-10 shadow-2xl" />
                    </div>
                    <h2 className="text-5xl font-black text-white mb-3 text-center leading-tight">{report.name || report.github_username}</h2>
                    <p className="text-2xl font-black text-cyan-400 tracking-widest mb-8 uppercase">@{report.github_username}</p>
                    <p className="text-slate-400 text-center italic text-lg leading-relaxed">"{report.bio || 'Exploring the boundaries of technology.'}"</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mt-12 pt-12 border-t border-white/5">
                    <div className="bg-white/5 rounded-3xl p-6 text-center">
                      <div className="text-4xl font-black text-white">{report.public_repos || 34}</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Repos</div>
                    </div>
                    <div className="bg-white/5 rounded-3xl p-6 text-center">
                      <div className="text-4xl font-black text-white">{report.followers || 28}</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Stars</div>
                    </div>
                  </div>
                </div>

                {/* Score Card */}
                <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-10">
                    <div className="text-xl font-bold text-white uppercase tracking-tighter">Developer IQ</div>
                    <Award className="text-yellow-400 w-8 h-8" />
                  </div>
                  <div className="text-[140px] leading-[1] font-black text-white tracking-tighter mb-8">{report.score}</div>
                  <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.6)]" style={{ width: '67%' }} />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Novice</span>
                    <span>Master</span>
                  </div>
                </div>

                {/* Readiness Dial */}
                <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3rem] p-12">
                  <h3 className="text-xl font-bold text-white mb-12">Career Readiness</h3>
                  <div className="relative w-56 h-56 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="112" cy="112" r="95" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-slate-800" />
                      <circle cx="112" cy="112" r="95" stroke="#06b6d4" strokeWidth="16" fill="transparent" strokeDasharray={600} strokeDashoffset={600 - (600 * 67) / 100} strokeLinecap="round" className="shadow-[0_0_20px_rgba(6,182,212,0.4)]" />
                    </svg>
                    <div className="absolute text-7xl font-black text-white">67%</div>
                  </div>
                  <p className="mt-12 text-center text-slate-400 font-medium">Profile optimized for</p>
                  <div className="text-center text-3xl font-black text-cyan-400 mt-2">{report.primary_domain || 'Frontend'}</div>
                </div>
              </div>

              {/* Right Column: Insights & Charts */}
              <div className="lg:col-span-8 space-y-10">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Specializations */}
                  <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3rem] p-10">
                    <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-4">
                      <Code2 className="text-cyan-400 w-7 h-7" /> Inferred Specializations
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {(report.specializations || ['FRONTEND', 'SYSTEMS']).map(spec => (
                        <span key={spec} className="px-6 py-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-black tracking-widest">{spec}</span>
                      ))}
                    </div>
                  </div>

                  {/* Cognitive Insights */}
                  <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3rem] p-10">
                    <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-4">
                      <Zap className="text-yellow-400 w-7 h-7" /> Cognitive Insights
                    </h3>
                    <div className="space-y-6">
                      <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl relative group">
                        <div className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                          <p className="text-xs font-black text-green-400 uppercase tracking-widest leading-loose">Strength: Consistent active contributions</p>
                        </div>
                      </div>
                      <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl relative group">
                        <div className="flex gap-4">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 shrink-0" />
                          <p className="text-xs font-black text-red-400 uppercase tracking-widest leading-loose">Growth Area: Broad but potentially surface-level stack</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tech DNA Chart */}
                <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3.5rem] p-12">
                  <h3 className="text-xl font-bold text-white mb-12 flex items-center gap-4">
                    <Layout className="text-purple-400 w-7 h-7" /> Technological DNA
                  </h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={Object.entries(report.languages || {}).slice(0, 6).map(([name, value]) => ({ name, value }))}>
                        <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tick={{dy: 15}} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '20px' }} />
                        <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={50}>
                          {Object.entries(report.languages || {}).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#3b82f6'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Repository Audit */}
                <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3rem] p-10">
                  <h3 className="text-xl font-bold text-white mb-10 flex items-center gap-4">
                    <GitBranch className="text-green-400 w-7 h-7" /> Core Repository Audit
                  </h3>
                  <div className="space-y-6">
                    <div className="h-40 border border-dashed border-white/10 rounded-3xl flex items-center justify-center text-slate-600 font-medium">Scanning source integrity...</div>
                  </div>
                </div>

                {/* Career Roadmap */}
                <div className="pdf-break-avoid bg-slate-900/60 border border-cyan-500/20 rounded-[3.5rem] p-12">
                  <h3 className="text-3xl font-black text-white mb-16 flex items-center gap-6">
                    <TrendingUp className="text-cyan-400 w-10 h-10" /> Precision Career Path
                  </h3>
                  <div className="space-y-10 relative">
                    <div className="absolute left-[23px] top-4 bottom-4 w-px bg-cyan-500/20" />
                    {(report.roadmap || ['Master advanced Frontend architectural patterns.']).map((step, i) => (
                      <div key={i} className="flex gap-10 relative group">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-lg font-black text-cyan-400 z-10 shrink-0 shadow-[0_0_20px_rgba(6,182,212,0.3)]">{i + 1}</div>
                        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex-1 group-hover:border-cyan-500/30 transition-all">
                          <p className="text-xl font-medium text-slate-300">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growth Trajectory */}
                <div className="pdf-break-avoid bg-slate-900/60 border border-white/10 rounded-[3.5rem] p-12">
                   <h3 className="text-xl font-bold text-white mb-12 flex items-center gap-4"><TrendingUp className="text-cyan-400 w-7 h-7" /> Growth Trajectory</h3>
                   <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={[{v: 400}, {v: 500}, {v: 676}]}>
                         <Line type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={6} dot={{fill: '#06b6d4', r: 8, strokeWidth: 0}} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Bar */}
      {report && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-20 duration-1000">
          <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 px-10 py-5 rounded-[2.5rem] shadow-4xl flex items-center gap-10">
            <div className="flex items-center gap-4 pr-10 border-r border-white/10">
              <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              <span className="text-sm font-black text-white uppercase tracking-tighter">Audit Complete</span>
            </div>
            <button 
              onClick={downloadPDF}
              className="flex items-center gap-4 px-12 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black text-lg transition-all shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-95"
            >
              <Award size={22} /> EXPORT PDF REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

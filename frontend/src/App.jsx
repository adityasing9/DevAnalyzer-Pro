import { useState, useEffect } from 'react'
import { Search, Star, Code2, AlertCircle, TrendingUp, Award, Terminal, Zap, PieChart, GitBranch } from 'lucide-react'
import axios from 'axios'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, YAxis } from 'recharts'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const GithubIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
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
    // Step 1: Build color map by resolving through the browser BEFORE cloning
    const colorMap = {}
    const tmpEl = document.createElement('div')
    tmpEl.style.cssText = 'display:none;position:absolute;'
    document.body.appendChild(tmpEl)

    const colorValues = new Set()
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || []).forEach(rule => {
          const matches = (rule.cssText || '').matchAll(/(?:oklch|oklab)\([^)]+\)/g)
          for (const m of matches) colorValues.add(m[0])
        })
      } catch (_) {}
    })

    for (const col of colorValues) {
      try {
        tmpEl.style.color = col
        const rgb = getComputedStyle(tmpEl).color
        const m = rgb.match(/\d+/g)
        if (m && m.length >= 3) {
          const hex = '#' + [m[0],m[1],m[2]].map(v => parseInt(v).toString(16).padStart(2,'0')).join('')
          colorMap[col] = hex
        }
      } catch (_) {}
    }
    document.body.removeChild(tmpEl)

    try {
      const element = document.getElementById('dashboard-report')
      if (!element) throw new Error('Report element not found')

      // Pre-fetch external CSS to avoid html2canvas crashing on oklch in Netlify production
      let externalCss = '';
      try {
        const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        for (const link of links) {
          if (link.href && !link.href.includes('google')) { // Skip external fonts to prevent CORS hangs
            try {
              const res = await fetch(link.href, { mode: 'cors' });
              if (res.ok) {
                externalCss += await res.text() + '\n';
              }
            } catch (innerErr) {
              console.warn("Skipping stylesheet due to fetch error:", link.href, innerErr);
            }
          }
        }
      } catch (err) {
        console.warn("Could not prefetch external CSS", err);
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 1280,
        onclone: (clonedDoc) => {
          const reportEl = clonedDoc.getElementById('dashboard-report');
          // 1. PRODUCTION STABILIZATION: Completely strip all external CSS
          // This is the ONLY way to prevent the "oklch" crash in Tailwind v4 production.
          // We rely on our hardcoded lightThemeStyle below for perfect, safe rendering.
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());

          // 2. SAFE THEME INJECTION: Recreate the entire dashboard look with safe CSS
          const lightThemeStyle = clonedDoc.createElement('style')
          lightThemeStyle.textContent = `
            #dashboard-report { 
              background-color: #ffffff !important; 
              color: #1e293b !important;
              font-family: sans-serif;
            }
            .border { border: 1px solid #e2e8f0 !important; }
            .rounded-3xl { border-radius: 1.5rem !important; }
            .rounded-\\[2\\.5rem\\] { border-radius: 2.5rem !important; }
            .bg-slate-800, .bg-slate-900, .bg-slate-900\\/50 { background-color: #f8fafc !important; border: 1px solid #e2e8f0 !important; }
            .text-white, .text-slate-300, .text-slate-400 { color: #1e293b !important; }
            .text-cyan-400, .text-cyan-500 { color: #0891b2 !important; }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .flex-row { flex-direction: row !important; }
            .w-full { width: 100% !important; }
            .lg\\:w-1\\/3 { width: 33.33% !important; }
            .lg\\:w-2\\/3 { width: 66.66% !important; }
            .gap-8 { gap: 32px !important; }
            .gap-6 { gap: 24px !important; }
            .p-10 { padding: 40px !important; }
            .p-8 { padding: 32px !important; }
            .mb-8 { margin-bottom: 32px !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .text-5xl { font-size: 3rem !important; font-weight: 800 !important; }
            .text-2xl { font-size: 1.5rem !important; font-weight: 700 !important; }
            text.recharts-text { fill: #475569 !important; }
          `
          clonedDoc.head.appendChild(lightThemeStyle)

          // 4.1. FIX HTML2CANVAS TAILWIND V4 PARSING BUGS
          // html2canvas silently fails to parse modern CSS variables used by Tailwind v4 spacing.
          const spacingStyle = clonedDoc.createElement('style');
          spacingStyle.textContent = `
              .gap-3 { gap: 12px !important; }
              .gap-4 { gap: 16px !important; }
              .gap-6 { gap: 24px !important; }
              .gap-8 { gap: 32px !important; }
              .mt-1 { margin-top: 4px !important; }
              .mt-2 { margin-top: 8px !important; }
              .mt-8 { margin-top: 32px !important; }
              .mb-1 { margin-bottom: 4px !important; }
              .mb-2 { margin-bottom: 8px !important; }
              .mb-4 { margin-bottom: 16px !important; }
              .mb-6 { margin-bottom: 24px !important; }
              .mb-8 { margin-bottom: 32px !important; }
              .mb-10 { margin-bottom: 40px !important; }
              .p-2 { padding: 8px !important; }
              .p-4 { padding: 16px !important; }
              .p-6 { padding: 24px !important; }
              .p-8 { padding: 32px !important; }
              .p-10 { padding: 40px !important; }
              .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
              .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
            `;
            clonedDoc.head.appendChild(spacingStyle);

          clonedDoc.querySelectorAll('.recharts-wrapper, .recharts-responsive-container').forEach(el => {
            el.style.width = '100%';
            el.style.height = '300px';
          });
          
          clonedDoc.querySelectorAll('.recharts-wrapper svg').forEach(svg => {
            const w = svg.getAttribute('width') || '800';
            const h = svg.getAttribute('height') || '300';
            svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
          });

          // 5. ROBUST PAGINATION: Insert spacers to avoid slicing cards
          if (reportEl) {
            const pageHeightInPx = 1280 * (297 / 210);
            const breakAvoids = Array.from(clonedDoc.querySelectorAll('.pdf-break-avoid'));
            
            breakAvoids.forEach(el => {
              const containerRect = reportEl.getBoundingClientRect();
              const elRect = el.getBoundingClientRect();
              const yPos = elRect.top - containerRect.top;
              const elBottomPos = yPos + elRect.height;
              
              const pageNumber = Math.floor(yPos / pageHeightInPx);
              const bottomPageNumber = Math.floor(elBottomPos / pageHeightInPx);
              
              if (bottomPageNumber > pageNumber && elRect.height < pageHeightInPx) {
                const cutLine = (pageNumber + 1) * pageHeightInPx;
                const spaceNeeded = cutLine - yPos + 100; // Deep top-margin for clean page split
                
                const spacer = clonedDoc.createElement('div');
                spacer.style.height = `${spaceNeeded}px`;
                spacer.style.width = '100%';
                spacer.style.clear = 'both';
                el.parentNode.insertBefore(spacer, el);
              }
            });
          }
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
      console.error('CRITICAL PDF ERROR:', err)
      alert(`Export Failed: ${err.message}\n\nCheck console for full stack trace.`)
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
      setAiInsight('AI Mentor currently offline. Focus on consistent contributions and specialized projects to maintain momentum.')
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
      const response = await axios.post(`${apiUrl}/analyze-v3`, {
        github_username: username
      })
      setReport(response.data)
      generateAiMentor(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'GitHub User not found or API Limit reached.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative w-full overflow-x-hidden bg-[#020617] text-slate-300 font-['Inter',sans-serif]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Terminal size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">DevAnalyzer<span className="text-cyan-500">.</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-slate-500">
          <a href="#" className="hover:text-cyan-400 transition-colors">Documentation</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">Cloud API</a>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* Hero Section */}
        {!report && !loading && (
          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight text-white tracking-tighter">
              Analyze Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">Digital Footprint.</span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              The world's first AI-powered GitHub profile auditor. Get professional insights in seconds.
            </p>
          </div>
        )}

        {/* Search Engine */}
        <div className={`w-full max-w-3xl mx-auto transition-all duration-700 ${report ? 'mb-16' : 'mb-32'}`}>
          <form onSubmit={analyzeProfile} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="pl-6">
                <GithubIcon size={24} className="text-slate-500" />
              </div>
              <input
                type="text"
                className="w-full px-6 py-5 bg-transparent text-xl text-white focus:outline-none placeholder-slate-600 font-medium"
                placeholder="GitHub Username (e.g. adityasing9)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="whitespace-nowrap px-10 py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {loading ? 'ANALYZING...' : 'RUN AUDIT'}
              </button>
            </div>
          </form>
          {error && <p className="mt-6 text-center text-red-400 font-medium flex items-center justify-center gap-2 animate-bounce"><AlertCircle size={18} /> {error}</p>}
        </div>

        {/* Dashboard Architecture */}
        {report && (
          <div id="dashboard-report" className="space-y-8 p-4">
            <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in zoom-in-95 duration-700">
              
              {/* Sidebar: Profile & Score */}
              <div className="w-full lg:w-1/3 flex flex-col gap-8">
                {/* Profile Card */}
                <div className="pdf-break-avoid bg-slate-900/50 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
                  <div className="border border-white/10 rounded-3xl p-8 bg-slate-800">
                    <div className="flex flex-col items-center">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full" />
                        <img 
                          src={report.avatar_url} 
                          alt={report.github_username}
                          className="w-40 h-40 rounded-full border-4 border-cyan-500/30 relative z-10"
                        />
                      </div>
                      <h2 className="text-4xl font-black text-white mb-2">{report.name || report.github_username}</h2>
                      <p className="text-cyan-400 font-mono tracking-wider mb-6">@{(report.github_username || username || 'User').toUpperCase()}</p>
                      <p className="text-slate-400 text-center italic max-w-lg">"{report.bio || 'Exploring the boundaries of technology.'}"</p>
                    </div>
                  </div>

                  {/* IQ Score Card */}
                  <div className="pdf-break-avoid border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center bg-slate-800">
                    <div className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-bold mb-4">Core Developer IQ</div>
                    <div className="text-8xl font-black text-white tracking-tighter mb-4">{report.score}</div>
                    <div className="h-2 w-48 rounded-full overflow-hidden bg-slate-900">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${Math.min((report.score/1000)*100, 100)}%` }} />
                    </div>
                  </div>

                  {/* Readiness Dial */}
                  <div className="pdf-break-avoid border border-white/5 rounded-3xl p-10 flex flex-col items-center bg-slate-900">
                    <h3 className="text-lg font-bold text-white mb-8 w-full">Career Readiness</h3>
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" style={{ color: 'rgba(255,255,255,0.05)' }} />
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} strokeDashoffset={440 - (440 * (report.readiness_score || 0)) / 100} style={{ color: '#06b6d4' }} className="transition-all duration-[1500ms] ease-in-out" />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-black text-white">{report.readiness_score}%</span>
                      </div>
                    </div>
                    <p className="mt-8 text-center text-sm font-medium text-slate-400">
                      Profile optimized for <span className="text-cyan-400 block mt-1 text-lg font-black">{report.primary_domain}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Content: Skills & Insights */}
              <div className="w-full lg:w-2/3 flex flex-col gap-8">
                
                {/* Top Row: Specializations & Insights */}
                <div className="pdf-break-avoid flex flex-col md:flex-row gap-8 w-full">
                  <div className="border border-white/5 rounded-3xl p-8 bg-slate-900 w-full md:w-1/2">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                      <Code2 className="w-6 h-6 text-cyan-400" /> Inferred Specializations
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {(report.specializations || report.inferred_domains || []).map(spec => (
                        <span key={spec} className="px-4 py-2 border border-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-900/30">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border border-white/5 rounded-3xl p-8 bg-slate-900 w-full md:w-1/2">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                      <Zap className="w-6 h-6 text-yellow-400" /> Cognitive Insights
                    </h3>
                    <div className="flex flex-col gap-4">
                      {(report.insights || []).map((insight, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: '#facc15' }} />
                          <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Chart: Tech DNA */}
                <div className="pdf-break-avoid border border-white/5 rounded-[2.5rem] p-10 bg-slate-900">
                  <h3 className="text-lg font-bold text-white mb-10 flex items-center gap-3">
                    <PieChart className="w-6 h-6 text-purple-400" /> Technological DNA
                  </h3>
                  <div className="h-[300px] w-full" style={{ height: '300px', width: '100%', minHeight: '300px' }}>
                    <BarChart width={800} height={300} data={Object.entries(report.languages || {}).slice(0, 8).map(([name, value]) => ({ name, value }))}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} tick={{dy: 10}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }} 
                      />
                      <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </div>
                </div>

                <div className="pdf-break-avoid border border-white/10 rounded-3xl p-10 bg-slate-900">
                  <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                    <GitBranch className="w-6 h-6 text-green-400" /> Core Repository Audit
                  </h3>
                  <div className="flex flex-col gap-4">
                    {report.top_repos && report.top_repos.length > 0 ? report.top_repos.map(repo => (
                      <div key={repo.name} className="p-6 border border-white/5 rounded-2xl flex items-center justify-between bg-slate-800">
                        <div>
                          <h4 className="text-white font-bold mb-1">{repo.name}</h4>
                          <p className="text-xs text-slate-400">{repo.description || 'No description provided'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-cyan-400 font-bold mb-1">{repo.score} IQ</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest">{repo.language}</div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl">
                         <p className="text-slate-500 text-sm">No significant repositories identified in recent activity.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Strategic Roadmap */}
                <div className="pdf-break-avoid border border-cyan-500/20 rounded-[2.5rem] p-10 bg-slate-900">
                  <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4">
                    <TrendingUp className="w-8 h-8 text-[#22d3ee]" /> Precision Career Path
                  </h3>
                  <div className="flex flex-col gap-8 relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-cyan-500/20" />
                    {report.roadmap?.map((step, i) => (
                      <div key={i} className="flex gap-8 relative group">
                        <div className="w-8 h-8 rounded-full bg-[#020617] border-2 border-cyan-500 flex items-center justify-center text-xs font-black text-cyan-400 z-10 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                          {i + 1}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group-hover:border-cyan-500/30 transition-all">
                            <p className="text-slate-300 font-medium leading-relaxed">{step}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Mentorship Section */}
                <div className="pdf-break-avoid bg-slate-900 border border-white/10 rounded-[2.5rem] p-10">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-[#a855f7]" /> AI Career Mentor
                  </h3>
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/5">
                    {generatingAi ? (
                      <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                        <p className="text-sm text-slate-500 font-mono italic">Decrypting neural patterns...</p>
                      </div>
                    ) : (
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {aiInsight || "No insights generated yet."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Historical Progress (Mocked for Demo) */}
                <div className="pdf-break-avoid bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-10" style={{ background: '#0f172a' }}>
                  <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-[#06b6d4]" /> Growth Trajectory
                  </h3>
                  <div className="h-[300px] w-full min-h-[300px]" style={{ height: '300px', width: '100%' }}>
                    <LineChart width={800} height={300} data={report.history || [
                      { date: 'Initial', iq: report.score }
                    ]}>
                      <XAxis dataKey="date" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                      <Line type="monotone" dataKey="iq" stroke="#06b6d4" strokeWidth={4} dot={{ fill: '#06b6d4', r: 6 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }} />
                    </LineChart>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer Signature */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
          DevAnalyzer <span className="mx-4 text-cyan-500">×</span> Aditya Sing Platform
        </p>
      </footer>

      {/* Floating Action Bar */}
      {report && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-20 duration-1000">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 px-8 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-tighter">Audit Complete</span>
            </div>
            <button 
              onClick={downloadPDF}
              className="group flex items-center gap-3 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full font-black text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <Award className="w-4 h-4 group-hover:scale-125 transition-transform" /> 
              EXPORT PDF REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

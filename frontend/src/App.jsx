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
    try {
      const element = document.getElementById('dashboard-report')
      if (!element) throw new Error('Report element not found')

      // ISOLATION STRATEGY: Instead of capturing the live site, we capture a simplified version.
      // We set specific styles for the capture that use standard HEX colors to avoid oklch crashes.
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 1280,
        onclone: (clonedDoc) => {
          const reportEl = clonedDoc.getElementById('dashboard-report');
          
          // CRITICAL: Remove all production stylesheets from the CLONE only.
          // This stops html2canvas from looking at the oklch-poisoned CSS bundle.
          clonedDoc.querySelectorAll('link[rel="stylesheet"], style').forEach(el => el.remove());

          // Inject a "Safe Mode" light theme stylesheet specifically for the PDF.
          const pdfStyle = clonedDoc.createElement('style');
          pdfStyle.textContent = `
            #dashboard-report { 
              background-color: #ffffff !important; 
              color: #1e293b !important; 
              font-family: sans-serif; 
              width: 1280px !important; 
              padding: 40px !important; 
              display: flex !important;
              flex-direction: column !important;
              gap: 32px !important;
            }
            .bg-slate-800, .bg-slate-900, .bg-slate-900\\/50 { 
              background-color: #f8fafc !important; 
              border: 1px solid #e2e8f0 !important; 
              border-radius: 24px !important;
            }
            .text-white, .text-slate-300, .text-slate-400 { color: #1e293b !important; }
            .text-cyan-400, .text-cyan-500 { color: #0891b2 !important; }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .flex-row { flex-direction: row !important; }
            .gap-8 { gap: 32px !important; }
            .p-10 { padding: 40px !important; }
            .w-full { width: 100% !important; }
            .lg\\:w-1\\/3 { width: 33.33% !important; }
            .lg\\:w-2\\/3 { width: 66.66% !important; }
            .pdf-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
            .recharts-text { fill: #475569 !important; }
            
            /* Reset all oklch-based utilities to safe defaults */
            * { border-color: #e2e8f0 !important; }
            h2, h3, .text-4xl, .text-8xl { color: #0f172a !important; font-weight: bold !important; }
          `;
          clonedDoc.head.appendChild(pdfStyle);

          // Force-remove oklch from any inline styles in the clone
          clonedDoc.querySelectorAll('*').forEach(el => {
            const style = el.getAttribute('style') || '';
            if (style.includes('okl')) {
              el.setAttribute('style', style.replace(/(?:oklch|oklab|color-mix)\s*\([^)]+\)/gi, '#cbd5e1'));
            }
          });

          // Fix charts scaling in the PDF
          clonedDoc.querySelectorAll('.recharts-wrapper, .recharts-responsive-container').forEach(el => {
            el.style.width = '100%';
            el.style.height = '300px';
          });
          clonedDoc.querySelectorAll('svg').forEach(svg => {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            // Remove oklch from SVG attributes
            ['fill', 'stroke'].forEach(attr => {
              const val = svg.getAttribute(attr);
              if (val && val.includes('okl')) svg.setAttribute(attr, '#cbd5e1');
            });
          });

          // Standard Pagination logic
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
                const spacer = clonedDoc.createElement('div');
                spacer.style.height = `${(pageNumber + 1) * pageHeightInPx - yPos + 20}px`;
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
      console.error('PDF Export Error:', err)
      alert(`Export Failed: Tailwind v4 production colors are causing a crash.\n\nPlease check if charts are rendered and try again.`)
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
      setAiInsight('AI Mentor currently offline. Focus on specialized projects to maintain momentum.')
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
      setError(err.response?.data?.detail || 'GitHub User not found.')
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

      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-2 rounded-xl">
            <Terminal size={24} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">DevAnalyzer<span className="text-cyan-500">.</span></span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        {!report && !loading && (
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight text-white tracking-tighter">
              Analyze Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">Digital Footprint.</span>
            </h1>
          </div>
        )}

        <div className={`w-full max-w-3xl mx-auto transition-all ${report ? 'mb-16' : 'mb-32'}`}>
          <form onSubmit={analyzeProfile} className="relative group">
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
              <div className="pl-6"><GithubIcon size={24} className="text-slate-500" /></div>
              <input
                type="text"
                className="w-full px-6 py-5 bg-transparent text-xl text-white focus:outline-none"
                placeholder="GitHub Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button type="submit" disabled={loading} className="px-10 py-5 bg-cyan-500 text-slate-950 font-black rounded-xl">
                {loading ? 'ANALYZING...' : 'RUN AUDIT'}
              </button>
            </div>
          </form>
          {error && <p className="mt-6 text-center text-red-400">{error}</p>}
        </div>

        {report && (
          <div id="dashboard-report" className="space-y-8 p-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/3 flex flex-col gap-8">
                <div className="pdf-break-avoid bg-slate-900/50 border border-white/5 rounded-[2.5rem] p-10">
                  <div className="border border-white/10 rounded-3xl p-8 bg-slate-800 flex flex-col items-center">
                    <img src={report.avatar_url} className="w-40 h-40 rounded-full border-4 border-cyan-500/30 mb-6" alt="Avatar" />
                    <h2 className="text-4xl font-black text-white mb-2">{report.name || report.github_username}</h2>
                    <p className="text-cyan-400 font-mono">@{report.github_username.toUpperCase()}</p>
                  </div>
                  <div className="pdf-break-avoid border border-white/10 rounded-3xl p-8 mt-8 flex flex-col items-center bg-slate-800">
                    <div className="text-8xl font-black text-white">{report.score}</div>
                    <div className="text-xs text-slate-500 tracking-widest mt-2 uppercase">Developer IQ Score</div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-2/3 flex flex-col gap-8">
                <div className="pdf-break-avoid border border-white/5 rounded-3xl p-8 bg-slate-900">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3"><Code2 className="text-cyan-400" /> Specializations</h3>
                  <div className="flex flex-wrap gap-3">
                    {report.specializations?.map(spec => (
                      <span key={spec} className="px-4 py-2 border border-cyan-500/20 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-900/30">{spec}</span>
                    ))}
                  </div>
                </div>

                <div className="pdf-break-avoid border border-white/5 rounded-[2.5rem] p-10 bg-slate-900">
                  <h3 className="text-lg font-bold text-white mb-10"><PieChart className="text-purple-400 inline mr-2" /> Language DNA</h3>
                  <div className="h-[300px] w-full">
                    <BarChart width={800} height={300} data={Object.entries(report.languages || {}).slice(0, 8).map(([name, value]) => ({ name, value }))}>
                      <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                      <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </div>
                </div>

                <div className="pdf-break-avoid border border-cyan-500/20 rounded-[2.5rem] p-10 bg-slate-900">
                  <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4"><TrendingUp className="text-cyan-400" /> Roadmap</h3>
                  <div className="flex flex-col gap-6">
                    {report.roadmap?.map((step, i) => (
                      <div key={i} className="flex gap-6">
                        <div className="w-8 h-8 rounded-full border-2 border-cyan-500 flex items-center justify-center text-xs font-bold text-cyan-400 shrink-0">{i+1}</div>
                        <p className="text-slate-300 py-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {report && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button onClick={downloadPDF} className="flex items-center gap-3 px-10 py-4 bg-cyan-500 text-slate-950 rounded-full font-black shadow-2xl hover:bg-cyan-400 transition-all">
            <Award size={20} /> EXPORT PDF REPORT
          </button>
        </div>
      )}
    </div>
  )
}

export default App

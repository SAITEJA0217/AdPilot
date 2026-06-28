import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  CheckCircle2, 
  BarChart3, 
  UploadCloud, 
  TrendingDown, 
  Zap,
  FileSpreadsheet,
  XCircle,
  AlertCircle,
  PauseCircle,
  LineChart,
  FileText,
  Plug,
  Trophy,
  Bot,
  Mail,
  Building
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#fafafa] dark:bg-[#0a0a0a] text-foreground font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      
      {/* GLOBAL LAUNCH BANNER */}
      <div className="relative w-full overflow-hidden z-[60]">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-95"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="relative py-3 px-4 text-center text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] border-b border-white/10">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-inner">
            <span className="text-base">🚀</span>
            <span className="font-black tracking-widest text-xs uppercase">Launch Week</span>
          </div>
          <span className="font-semibold tracking-wide text-blue-50 text-sm md:text-base">
            AdAudit AI is completely <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded ml-0.5 shadow-sm">FREE</span> for everyone. Unlimited Audits & Reports.
          </span>
        </div>
      </div>

      {/* HEADER */}
      <header className="px-6 lg:px-12 h-20 flex items-center justify-between border-b bg-white/70 dark:bg-black/70 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">AdAudit AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#workflow" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</Link>
          <Link href="#comparison" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Compare</Link>
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/upload">
            <Button className="bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 rounded-full px-6 font-medium">
              Start Free Audit
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        
        {/* HERO SECTION */}
        <section className="relative w-full pt-10 pb-20 md:pt-16 md:pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-50 animate-pulse"></div>
          </div>

          <div className="container relative z-10 px-4 md:px-6 mx-auto flex flex-col items-center text-center">
            
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-white/50 dark:bg-black/50 backdrop-blur-sm mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              The new standard for Meta Ads analysis
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tighter max-w-[900px] leading-[1.1] mb-6">
              Stop Wasting Money on <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Meta Ads</span>
            </h1>
            
            <p className="mx-auto max-w-[700px] text-muted-foreground text-xl leading-relaxed mb-10 font-medium">
              Upload your Meta Ads report and instantly discover wasted spend, creative fatigue, poor-performing campaigns, and your biggest recovery opportunities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center mb-12">
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.3)] hover:shadow-[0_8px_40px_rgb(37,99,235,0.4)] transition-all hover:-translate-y-0.5">
                  Audit My Ads Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg font-bold rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-sm border-2">
                  View Sample Audit
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No account connection required</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Works with Meta Ads exports</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Executive-level recommendations</span>
            </div>

          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="workflow" className="w-full py-32 bg-white dark:bg-black relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl font-black tracking-tight mb-4">From Raw Data to Recovery Plan</h2>
              <p className="text-lg text-blue-600 dark:text-blue-400 font-bold tracking-wide">No account access. No setup. No waiting.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
              <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent z-0"></div>
              
              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-neutral-900 border-2 shadow-xl flex items-center justify-center text-blue-600 mb-2">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">Upload</h3>
                <p className="text-muted-foreground leading-relaxed">Export your Meta Ads report and upload it in seconds.</p>
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-neutral-900 border-2 shadow-xl flex items-center justify-center text-blue-600 mb-2">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">Analyze</h3>
                <p className="text-muted-foreground leading-relaxed">Our audit engine identifies wasted spend, poor ROAS, creative fatigue, tracking issues, and hidden performance leaks.</p>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-2xl bg-blue-600 border-2 border-blue-500 shadow-xl shadow-blue-500/20 flex items-center justify-center text-white mb-2 transform hover:scale-105 transition-transform">
                  <Zap className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold">Optimize</h3>
                <p className="text-muted-foreground leading-relaxed">Get a clear action plan showing exactly where to cut costs, recover budget, and improve campaign performance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section id="comparison" className="w-full py-32 bg-[#fafafa] dark:bg-[#0a0a0a]">
          <div className="container px-4 md:px-6 mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tight mb-4">The AdAudit AI Difference</h2>
              <p className="text-lg text-muted-foreground">Why elite media buyers use software over spreadsheets.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Without */}
              <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-10 border shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold">Without AdAudit AI</h3>
                </div>
                <ul className="space-y-6">
                  <li className="flex gap-4 items-start">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Staring at endless rows of numbers trying to spot fatigue</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Paying agencies $5k/mo just to run a basic account audit</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Guessing which campaigns to scale and which to kill</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">Burning budget for weeks before realizing an ad is dead</span>
                  </li>
                </ul>
              </div>

              {/* With */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 md:p-10 border shadow-xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="flex items-center gap-3 mb-8 relative z-10">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">With AdAudit AI</h3>
                </div>
                <ul className="space-y-6 relative z-10">
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                    <span className="text-blue-50 font-medium">Instant executive summary of exact dollar amounts wasted</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                    <span className="text-blue-50 font-medium">Mathematical, bias-free recommendations for every campaign</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                    <span className="text-blue-50 font-medium">Zero integration risk—your account data stays secure</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <CheckCircle2 className="w-5 h-5 text-blue-200 shrink-0 mt-0.5" />
                    <span className="text-blue-50 font-medium">Clear Action Board (Pause / Fix / Scale) for immediate ROI</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="w-full py-32 bg-[#ffffff] dark:bg-[#000000]">
          <div className="container px-4 md:px-6 mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Everything You Need to Fix Meta Ads Performance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">Transform raw Meta Ads data into actionable business decisions. Identify wasted spend, recover budget, improve ROAS, and scale winning campaigns.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Wasted Spend Detection</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Instantly identify campaigns spending money without generating results.</p>
                <ul className="space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero-conversion detection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> High CPA alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Budget leak analysis</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Potential savings calculation</li>
                </ul>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Creative Fatigue Analysis</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Detect audience burnout before it destroys campaign performance.</p>
                <ul className="space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Frequency monitoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> CTR decline detection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fatigue risk scoring</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Creative refresh suggestions</li>
                </ul>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Executive Audit Dashboard</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Get a boardroom-ready audit report instead of spreadsheets.</p>
                <ul className="space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Health Score</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Campaign insights</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Money recovery plan</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Risk forecast</li>
                </ul>
              </div>

              {/* Feature 4 */}
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-6 text-orange-600 group-hover:scale-110 transition-transform">
                  <PauseCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Pause • Fix • Scale Engine</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Know exactly which campaigns need attention and what action to take.</p>
                <ul className="space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pause losing campaigns</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Fix underperformers</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Scale winners</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Prioritized recommendations</li>
                </ul>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                  <LineChart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Opportunity Forecasting</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">See the financial impact of optimization before making changes.</p>
                <ul className="space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Potential savings</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> CPA improvement estimates</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> ROAS projections</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Future loss forecasting</li>
                </ul>
              </div>

              {/* Feature 6 */}
              <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-xl flex items-center justify-center mb-6 text-sky-600 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Executive Reports</h3>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">Generate professional audit reports for teams, clients, and stakeholders.</p>
                <ul className="space-y-2 text-sm font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PDF export</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Executive summary</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Campaign breakdowns</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Action checklist</li>
                </ul>
              </div>

            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="w-full py-32 bg-[#fafafa] dark:bg-[#0a0a0a] border-t relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 pointer-events-none"></div>
          <div className="container px-4 md:px-6 mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black tracking-tight mb-4">Simple Pricing</h2>
              <p className="text-lg text-muted-foreground">Maximize your ROI with no hidden fees.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Free Trial Card */}
              <div className="bg-white/60 dark:bg-neutral-900/40 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-neutral-200/60 dark:border-neutral-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] flex flex-col relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity duration-500 group-hover:opacity-100 opacity-30"></div>
                
                <div className="inline-flex max-w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-6">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                  Start Instantly
                </div>
                
                <h3 className="text-3xl font-black mb-2 tracking-tight">Free Trial</h3>
                
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-6xl font-black">₹0</span>
                </div>
                <div className="inline-flex max-w-fit items-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-4 py-2 mb-8 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Valid for 10 Hours</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-4"><div className="bg-emerald-500/10 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div> <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Full Access</span></li>
                  <li className="flex items-center gap-4"><div className="bg-emerald-500/10 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div> <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Unlimited Audits</span></li>
                  <li className="flex items-center gap-4"><div className="bg-emerald-500/10 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div> <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Executive Dashboard</span></li>
                  <li className="flex items-center gap-4"><div className="bg-emerald-500/10 p-1 rounded-full"><CheckCircle2 className="w-5 h-5 text-emerald-500" /></div> <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">PDF Reports</span></li>
                </ul>
                <Link href="/upload" className="w-full relative z-10">
                  <Button variant="outline" className="w-full h-14 text-lg font-bold rounded-2xl border-2 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all hover:border-emerald-500/30 shadow-sm">
                    Start Free Trial
                  </Button>
                </Link>
              </div>

              {/* Launch Offer Card */}
              <div className="bg-white dark:bg-black rounded-3xl p-8 border-2 border-blue-600 shadow-[0_0_40px_rgb(37,99,235,0.15)] flex flex-col relative overflow-hidden transform md:-translate-y-4">
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm flex items-center gap-1">
                  <span>🔥 Most Popular</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Launch Offer</h3>
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-5xl font-black">₹199</span>
                  <span className="text-lg text-muted-foreground line-through font-medium">₹499</span>
                </div>
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6">One-Time Payment per Audit</p>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> <span className="font-medium">Full Audit Unlock</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> <span className="font-medium">AI Recommendations</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> <span className="font-medium">Money Recovery Plan</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> <span className="font-medium">Forecasts</span></li>
                  <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" /> <span className="font-medium">PDF Export</span></li>
                </ul>
                <Link href="/upload" className="w-full">
                  <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:-translate-y-1 transition-transform">
                    Unlock Full Report
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* COMING SOON SECTION */}
        <section className="w-full py-20 bg-white dark:bg-black border-y">
          <div className="container px-4 md:px-6 mx-auto max-w-5xl text-center">
            <h3 className="text-sm font-black tracking-widest text-muted-foreground uppercase mb-10">Coming Soon</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-5 py-3 rounded-full border bg-muted/30 text-sm font-bold text-muted-foreground">
                <Plug className="w-4 h-4" /> Meta Ads Direct Integration
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full border bg-muted/30 text-sm font-bold text-muted-foreground">
                <Trophy className="w-4 h-4" /> Industry Benchmarks
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full border bg-muted/30 text-sm font-bold text-muted-foreground">
                <Bot className="w-4 h-4" /> AI Media Buyer Assistant
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full border bg-muted/30 text-sm font-bold text-muted-foreground">
                <Mail className="w-4 h-4" /> Automated Weekly Audits
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full border bg-muted/30 text-sm font-bold text-muted-foreground">
                <Building className="w-4 h-4" /> White-Label Agency Reports
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="w-full py-32 bg-[#fafafa] dark:bg-[#0a0a0a] text-center relative overflow-hidden border-t">
          <div className="absolute inset-0 bg-blue-600/5 dark:bg-blue-600/10 mix-blend-multiply"></div>
          <div className="container relative z-10 px-4 md:px-6 mx-auto max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Ready to Discover What's Wasting Your Ad Budget?</h2>
            <p className="text-xl text-muted-foreground mb-10 font-medium">Upload your Meta Ads report and receive an executive-level audit in under 60 seconds.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-16 px-10 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all">
                  Audit My Ads Free
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Link href="/upload" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-16 px-10 text-xl font-bold rounded-full bg-white dark:bg-black border-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all">
                  View Sample Report
                </Button>
              </Link>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-white dark:bg-black py-12 border-t">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <BarChart3 className="h-5 w-5" />
            <span className="text-lg font-bold tracking-tight">AdAudit AI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} AdAudit AI. Built for modern media buyers.
          </p>
        </div>
      </footer>
    </div>
  );
}

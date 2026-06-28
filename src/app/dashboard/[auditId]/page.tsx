'use client';

import { useEffect, useState, use } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, AlertCircle, Play, Pause, Wrench, Zap, Trophy, TrendingDown, Lock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export default function DashboardPage({ params }: { params: Promise<{ auditId: string }> }) {
  const router = useRouter();
  const { auditId } = use(params);
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    async function fetchAudit() {
      try {
        const res = await fetch(`/api/audits/${auditId}`);
        const data = await res.json();
        setAudit(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (auditId) {
      fetchAudit();
    }
  }, [auditId]);

  if (loading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!audit || audit.error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Failed to load audit results.</div>;
  }

  const handleExportPDF = () => {
    window.print();
  };

  const formatCurrency = (val: number) => '$' + (val || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const totalSpend = audit.campaignMetrics?.reduce((sum: number, c: any) => sum + (c.spend || 0), 0) || 0;
  
  // Hard recalculate metrics from actual rows to guarantee correctness for the UI
  const validCampaigns = audit.campaignMetrics || [];
  
  const pauseCampaigns = validCampaigns.filter((c: any) => c.conversions === 0 && c.spend > 0);
  let fixCampaigns = validCampaigns.filter((c: any) => c.conversions > 0 && c.roas < 1);
  let scaleCampaigns = validCampaigns.filter((c: any) => c.conversions > 0 && c.roas >= 1);

  const campaignsWithConversions = validCampaigns.filter((c: any) => c.conversions > 0);
  const bestCampaign = campaignsWithConversions.length > 0 
    ? [...campaignsWithConversions].sort((a: any, b: any) => b.roas - a.roas)[0] 
    : null;

  // Never show an empty Scale column if we have a best campaign
  if (scaleCampaigns.length === 0 && bestCampaign) {
    scaleCampaigns = [bestCampaign];
    fixCampaigns = fixCampaigns.filter((c: any) => c.name !== bestCampaign.name);
  }

  const getCampaignStatus = (c: any) => {
    if (pauseCampaigns.find((p: any) => p.name === c.name)) return '🔴 Pause';
    if (scaleCampaigns.find((s: any) => s.name === c.name)) return '🟢 Scale';
    return '🟡 Fix';
  };

  const getPriority = (status: string, spend: number) => {
    if (status.includes('Pause')) return spend > 10000 ? 'High' : 'Medium';
    if (status.includes('Scale')) return 'High';
    return spend > 5000 ? 'Medium' : 'Low';
  };

  const localWastedSpend = pauseCampaigns.reduce((sum: number, c: any) => sum + c.spend, 0);
  const localBudgetAtRisk = fixCampaigns.reduce((sum: number, c: any) => sum + c.spend, 0);
  const localPotentialSavings = localWastedSpend;
  const healthySpend = Math.max(0, totalSpend - localWastedSpend - localBudgetAtRisk);

  const topLosses = audit.findings
    ?.filter((f: any) => f.potentialSavings > 0)
    .sort((a: any, b: any) => b.potentialSavings - a.potentialSavings)
    .slice(0, 5) || [];

  const biggestLeak = pauseCampaigns.length > 0 
    ? [...pauseCampaigns].sort((a: any, b: any) => b.spend - a.spend)[0]
    : null;

  const wastedPercentage = totalSpend > 0 ? Math.round((localWastedSpend / totalSpend) * 100) : 0;
  const atRiskPercentage = totalSpend > 0 ? Math.round((localBudgetAtRisk / totalSpend) * 100) : 0;
  const healthyPercentage = totalSpend > 0 ? Math.round((healthySpend / totalSpend) * 100) : 0;

  // Money Recovery Plan calculations
  const totalConversions = audit.campaignMetrics?.reduce((sum: number, c: any) => sum + (c.conversions || 0), 0) || 0;
  const currentOverallRoas = audit.overallRoas || 0;
  const currentOverallCpa = audit.overallCpa || 0;
  const projectedWaste = 0; // Assuming all paused
  const expectedCpa = bestCampaign?.cpa || currentOverallCpa * 0.5;
  const expectedRoas = bestCampaign?.roas || Math.max(1.5, currentOverallRoas * 1.5);

  const MetricCard = ({ title, value, colorClass = "bg-card" }: { title: string, value: string | React.ReactNode, colorClass?: string }) => (
    <div className={`p-5 border rounded-xl shadow-sm ${colorClass}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold opacity-80">{title}</p>
      <div className="text-3xl font-bold tracking-tight">{value}</div>
    </div>
  );

  const hasFullAccess = audit.accessState?.hasFullAccess || false;
  const isTrialActive = audit.accessState?.isTrialActive && !audit.accessState?.isPaid;

  const handleCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: data.order.amount,
        currency: data.order.currency,
        name: "AdAudit AI",
        description: "Full Audit Unlock",
        order_id: data.order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              auditId
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            toast.success('Payment successful! Unlocking full audit...');
            window.location.reload();
          } else {
            toast.error('Payment verification failed.');
          }
        },
        theme: { color: "#2563eb" }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Payment initiation failed.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 text-foreground pb-20">
      <div className="container mx-auto py-8 px-4 max-w-[1200px] space-y-12">
        
        {/* Header */}
        <div className="flex justify-between items-center print:hidden">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button onClick={handleExportPDF} variant="default" size="sm" className="shadow-sm" disabled={!hasFullAccess}>
            <Download className="mr-2 h-4 w-4" /> Download Report {hasFullAccess ? '' : '(Locked)'}
          </Button>
        </div>

        {/* TRIAL BANNER */}
        {isTrialActive && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-full py-4 px-6 text-center text-sm font-medium flex flex-col sm:flex-row items-center justify-center gap-4 rounded-xl shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold tracking-wide text-lg">Free Trial Activated</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-white/50 rounded-full"></div>
            <span className="text-base">You have full access to AdAudit AI until {new Date(audit.accessState.trialEndsAt).toLocaleString()}</span>
          </div>
        )}

        {/* SECTION 1: HERO AI VERDICT */}
        <div className={`text-center p-12 rounded-3xl border-2 shadow-sm
          ${audit.healthScore < 40 ? 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900/50' : 
            audit.healthScore < 70 ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900/50' : 
            'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50'}`}>
          <p className="text-sm font-black tracking-widest text-muted-foreground uppercase mb-6 opacity-70">
            {audit.healthScore < 40 ? '🔴 CRITICAL ACCOUNT' : audit.healthScore < 70 ? '🟡 WARNING ACCOUNT' : '🟢 HEALTHY ACCOUNT'}
          </p>
          <p className="text-3xl md:text-5xl font-bold tracking-tight mb-10 leading-tight">
            <span className="text-red-600 dark:text-red-400">{wastedPercentage}%</span> of your advertising budget is being wasted.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
            <div className="bg-white/60 dark:bg-black/40 p-6 rounded-2xl border shadow-sm">
              <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-2">Estimated Loss</p>
              <p className="text-red-600 dark:text-red-400 text-4xl font-black tracking-tighter">
                {formatCurrency(localWastedSpend)}
              </p>
            </div>
            <div className="bg-white/60 dark:bg-black/40 p-6 rounded-2xl border shadow-sm">
              <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-2">Immediate Recovery Opportunity</p>
              <p className="text-emerald-600 dark:text-emerald-400 text-4xl font-black tracking-tighter">
                {formatCurrency(localPotentialSavings)}
              </p>
            </div>
          </div>

          <div className="text-lg font-medium text-muted-foreground">
            Recommended:<br/>
            Pause {pauseCampaigns.length} campaigns • Fix {fixCampaigns.length} campaigns • Scale {scaleCampaigns.length} campaign
          </div>
        </div>

        {/* SECTION 2: EXECUTIVE METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <MetricCard title="Health Score" value={
            <div className={`flex items-center gap-2 ${audit.healthScore < 40 ? "text-red-600 dark:text-red-400" : audit.healthScore < 70 ? "text-orange-600 dark:text-orange-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              <span>{audit.healthScore < 40 ? '🔴' : audit.healthScore < 70 ? '🟡' : '🟢'}</span>
              <span>{audit.healthScore}/100</span>
            </div>
          } />
          <MetricCard title="Money Wasted" value={formatCurrency(localWastedSpend)} colorClass="text-red-600 dark:text-red-400 border-red-100 bg-red-50/50 dark:bg-red-950/20" />
          <MetricCard title="Budget At Risk" value={formatCurrency(localBudgetAtRisk)} colorClass="text-orange-600 dark:text-orange-400 border-orange-100 bg-orange-50/50 dark:bg-orange-950/20" />
          <MetricCard title="Potential Savings" value={formatCurrency(localPotentialSavings)} colorClass="text-emerald-600 dark:text-emerald-400 border-emerald-100 bg-emerald-50/50 dark:bg-emerald-950/20" />
        </div>

        {/* Best/Worst Campaigns */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border-2 border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-emerald-600" />
              <h3 className="font-bold text-emerald-800 dark:text-emerald-400 text-lg">Best Campaign</h3>
            </div>
            {bestCampaign ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xl font-bold truncate max-w-[70%]">{bestCampaign.name}</p>
                  <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs px-2 py-1 font-bold rounded-md uppercase tracking-wider">🟢 BEST PERFORMER</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">Status</span><span className="font-semibold text-emerald-700 dark:text-emerald-400">Best Available Performer</span></div>
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">Conversions</span><span className="font-semibold">{bestCampaign.conversions}</span></div>
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">Spend</span><span className="font-semibold">{formatCurrency(bestCampaign.spend)}</span></div>
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">CPA</span><span className="font-semibold">{formatCurrency(bestCampaign.cpa)}</span></div>
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">ROAS</span><span className="font-semibold">{bestCampaign.roas?.toFixed(2)}x</span></div>
                </div>
              </>
            ) : <p className="text-muted-foreground text-sm">No profitable campaigns detected.</p>}
          </div>

          <div className="border-2 border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h3 className="font-bold text-red-800 dark:text-red-400 text-lg">Biggest Money Leak</h3>
            </div>
            {biggestLeak ? (
              <>
                <p className="text-xl font-bold mb-4 truncate">{biggestLeak.name}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">Spend</span><span className="font-semibold">{formatCurrency(biggestLeak.spend)}</span></div>
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">Conversions</span><span className="font-semibold">{biggestLeak.conversions}</span></div>
                  <div><span className="text-muted-foreground block text-xs uppercase tracking-wider">Lost</span><span className="font-semibold text-red-600 dark:text-red-400">{formatCurrency(biggestLeak.spend)}</span></div>
                  <div className="col-span-2 mt-1"><span className="text-muted-foreground block text-xs uppercase tracking-wider">Action</span><span className="font-bold text-red-600 dark:text-red-400">Pause Immediately</span></div>
                </div>
              </>
            ) : <p className="text-muted-foreground text-sm">No active leaks detected.</p>}
          </div>
        </div>

        {/* SECTION 3: WHAT SHOULD I DO? */}
        <div className={`space-y-6 pt-4 border-t relative ${!hasFullAccess ? 'blur-sm pointer-events-none select-none' : ''}`}>
          <h2 className="text-xl font-bold tracking-tight">What Should I Do?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* PAUSE NOW */}
            <div className="border-2 rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-full border-red-100 dark:border-red-900/30">
              <div className="bg-red-50 dark:bg-red-950/30 p-4 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
                <Pause className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-red-600 dark:text-red-400">🔴 PAUSE NOW</h3>
              </div>
              <div className="p-4 space-y-4 grow">
                {pauseCampaigns.length > 0 ? pauseCampaigns.map((c: any, i: number) => (
                  <div key={i} className="pb-3 border-b last:border-0 last:pb-0">
                    <p className="font-semibold text-sm leading-tight mb-1" title={c.name}>{c.name}</p>
                    <p className="text-xs font-medium text-red-600 dark:text-red-400">Save {formatCurrency(c.spend)}</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No campaigns to pause.</p>}
              </div>
            </div>

            {/* FIX */}
            <div className="border-2 rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-full border-orange-100 dark:border-orange-900/30">
              <div className="bg-orange-50 dark:bg-orange-950/30 p-4 border-b border-orange-100 dark:border-orange-900/30 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-orange-600 dark:text-orange-400">🟡 FIX</h3>
              </div>
              <div className="p-4 space-y-4 grow">
                {fixCampaigns.length > 0 ? fixCampaigns.map((c: any, i: number) => (
                  <div key={i} className="pb-3 border-b last:border-0 last:pb-0">
                    <p className="font-semibold text-sm leading-tight mb-1" title={c.name}>{c.name}</p>
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">ROAS is {(c.roas||0).toFixed(2)}x</p>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No campaigns to fix.</p>}
              </div>
            </div>

            {/* SCALE */}
            <div className="border-2 rounded-xl bg-card shadow-sm overflow-hidden flex flex-col h-full border-emerald-100 dark:border-emerald-900/30">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-emerald-600 dark:text-emerald-400">🟢 SCALE</h3>
              </div>
              <div className="p-4 space-y-4 grow">
                {scaleCampaigns.length > 0 ? scaleCampaigns.map((c: any, i: number) => (
                  <div key={i} className="pb-4 border-b last:border-0 last:pb-0">
                    <p className="font-semibold text-sm leading-tight mb-2" title={c.name}>{c.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3 font-mono">
                      <span>Current ROAS: {c.roas?.toFixed(2)}x</span>
                      <span>Current CPA: {formatCurrency(c.cpa)}</span>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-bold space-y-1">
                      <p className="uppercase tracking-wider opacity-70">Recommended:</p>
                      <p>Increase budget by 10–15%</p>
                    </div>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No campaigns to scale.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: MONEY RECOVERY PLAN */}
        <div className={`space-y-6 pt-4 border-t relative ${!hasFullAccess ? 'blur-md pointer-events-none select-none' : ''}`}>
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/50 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Money Recovery Plan</h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4 font-mono text-base">
                <div className="flex justify-between border-b border-blue-100 dark:border-blue-900/50 pb-3">
                  <span className="text-muted-foreground">Current Waste:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">{formatCurrency(localWastedSpend)}</span>
                </div>
                <div className="flex justify-between border-b border-blue-100 dark:border-blue-900/50 pb-3">
                  <span className="text-muted-foreground">After Optimization:</span>
                  <span className="font-bold">{formatCurrency(projectedWaste)}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground font-bold">Potential Savings:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">+{formatCurrency(localPotentialSavings)}</span>
                </div>
              </div>
              <div className="space-y-4 font-mono text-base">
                <div className="flex justify-between border-b border-blue-100 dark:border-blue-900/50 pb-3">
                  <span className="text-muted-foreground">Estimated ROAS:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{currentOverallRoas.toFixed(2)}x → {expectedRoas.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-muted-foreground font-bold">Estimated CPA:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(currentOverallCpa)} → {formatCurrency(expectedCpa)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: RISK FORECAST */}
        <div className={`space-y-6 pt-4 border-t relative ${!hasFullAccess ? 'blur-md pointer-events-none select-none' : ''}`}>
          <div className="border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 rounded-2xl p-10 shadow-sm text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-full">
                <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-red-800 dark:text-red-400 mb-3">Risk Forecast</h2>
            <p className="text-lg text-red-900/70 dark:text-red-300 font-bold mb-10 uppercase tracking-widest">If no action is taken</p>
            
            <p className="text-xl font-semibold mb-8">Current Waste: <span className="text-red-600 dark:text-red-400 font-bold">{formatCurrency(localWastedSpend)}</span></p>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
              <div className="bg-white dark:bg-black/40 p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-3">30 Days</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(localWastedSpend * 1.3)}</p>
              </div>
              <div className="bg-white dark:bg-black/40 p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-3">60 Days</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(localWastedSpend * 1.9)}</p>
              </div>
              <div className="bg-white dark:bg-black/40 p-6 rounded-xl border shadow-sm flex flex-col items-center text-center">
                <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold mb-3">90 Days</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(localWastedSpend * 2.85)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: TOP LOSSES */}
        <div className={`space-y-6 pt-4 border-t relative ${!hasFullAccess ? 'blur-md pointer-events-none select-none' : ''}`}>
          <h2 className="text-xl font-bold tracking-tight">Top Losses</h2>
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold w-[40%]">Campaign</TableHead>
                  <TableHead className="text-right font-semibold">Spend Lost</TableHead>
                  <TableHead className="text-right font-semibold">% of Waste</TableHead>
                  <TableHead className="text-center font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topLosses.map((f: any, i: number) => {
                  const percentOfWaste = localWastedSpend > 0 ? Math.round((f.potentialSavings / localWastedSpend) * 100) : 0;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium truncate max-w-[300px]" title={f.entityName}>{f.entityName}</TableCell>
                      <TableCell className="text-right tabular-nums text-red-600 dark:text-red-400 font-medium">{formatCurrency(f.potentialSavings)}</TableCell>
                      <TableCell className="text-right tabular-nums font-mono text-muted-foreground">{percentOfWaste}%</TableCell>
                      <TableCell className="text-center font-semibold text-xs">
                        {f.reasonCode === 'fatigue' ? 'Fix' : 'Pause'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {topLosses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">No major losses detected.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* SECTION 5: CAMPAIGN PERFORMANCE */}
        <div className={`space-y-6 pt-4 border-t relative ${!hasFullAccess ? 'blur-md pointer-events-none select-none' : ''}`}>
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold tracking-tight">Campaign Performance</h2>
            <div className="text-xs text-muted-foreground print:hidden">
              <span className="mr-3">🔴 ROAS &lt; 1 / 0 Conv</span>
              <span>🟢 ROAS &ge; 1</span>
            </div>
          </div>
          <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="font-semibold w-[30%]">Campaign</TableHead>
                  <TableHead className="text-right font-semibold">Spend</TableHead>
                  <TableHead className="text-right font-semibold">Conversions</TableHead>
                  <TableHead className="text-right font-semibold">CPA</TableHead>
                  <TableHead className="text-right font-semibold">ROAS</TableHead>
                  <TableHead className="text-center font-semibold">Status</TableHead>
                  <TableHead className="text-center font-semibold">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.campaignMetrics?.map((campaign: any, idx: number) => {
                  const status = getCampaignStatus(campaign);
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-medium truncate max-w-[250px]" title={campaign.name}>{campaign.name}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(campaign.spend)}</TableCell>
                      <TableCell className="text-right tabular-nums">{campaign.conversions}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatCurrency(campaign.cpa)}</TableCell>
                      <TableCell className="text-right tabular-nums">{campaign.roas !== undefined ? campaign.roas.toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-center font-medium text-xs whitespace-nowrap">{status}</TableCell>
                      <TableCell className="text-center font-medium text-xs">{getPriority(status, campaign.spend)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* SECTION 6: CHARTS */}
        <div className="space-y-6 pt-4 border-t">
          <h2 className="text-xl font-bold tracking-tight">Financial Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-6 h-[300px]">
            
            {/* Chart 1: Spend Distribution */}
            <div className="border rounded-xl bg-card shadow-sm p-6 flex flex-col relative">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">Spend Distribution</p>
              <div className="grow min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Wasted', value: localWastedSpend },
                        { name: 'At Risk', value: localBudgetAtRisk },
                        { name: 'Healthy', value: healthySpend }
                      ].filter(d => d.value > 0)}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={true}
                    >
                      <Cell fill="#ef4444" />
                      <Cell fill="#f97316" />
                      <Cell fill="#10b981" />
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: ROAS by Campaign */}
            {validCampaigns.some((c: any) => c.roas > 0) ? (
              <div className="border rounded-xl bg-card shadow-sm p-6 flex flex-col relative">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">ROAS by Campaign</p>
                <div className="grow min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={validCampaigns.filter((c: any) => c.roas > 0)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                      <XAxis dataKey="name" fontSize={10} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                      <YAxis fontSize={10} />
                      <Tooltip formatter={(value: any) => Number(value).toFixed(2)} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                      <Bar dataKey="roas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="border rounded-xl bg-card shadow-sm p-6 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No ROAS data available</p>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER & PAYWALL OVERLAY */}
        {!hasFullAccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 md:p-12 border shadow-2xl max-w-2xl w-full text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              
              <Lock className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">You've Already Found Money Being Wasted</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your audit discovered opportunities to improve campaign performance. Unlock the complete report to see:
              </p>
              
              <div className="text-left max-w-md mx-auto space-y-3 mb-10 font-medium">
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-600" /> Which campaigns to pause</div>
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-600" /> Which campaigns to fix</div>
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-600" /> Which campaigns to scale</div>
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-600" /> Full executive recommendations</div>
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-600" /> Financial recovery projections</div>
                <div className="flex items-center gap-3"><Zap className="w-5 h-5 text-blue-600" /> PDF export</div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 mb-8 flex justify-center items-center gap-4">
                <div className="text-left">
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Launch Price</p>
                  <p className="text-4xl font-black">₹199 <span className="text-lg text-muted-foreground line-through font-medium ml-2">₹499</span></p>
                </div>
              </div>
              
              <Button 
                onClick={handleCheckout} 
                disabled={isProcessingPayment}
                className="w-full h-16 text-xl font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:-translate-y-1 transition-transform"
              >
                {isProcessingPayment ? 'Processing...' : 'Unlock Full Audit — ₹199'}
              </Button>
            </div>
          </div>
        )}

        <div className="pt-16 pb-8 text-center text-xs text-muted-foreground font-mono space-y-2 opacity-60 print:mt-12 border-t mt-12">
          <p>Audit Confidence: {audit.confidenceScore || 100}%</p>
          <p>Generated by AdPilot AI</p>
          <p>Next Review Recommended: 7 Days</p>
        </div>

      </div>
    </div>
  );
}

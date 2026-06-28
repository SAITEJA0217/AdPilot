const fs = require('fs');
const path = 'src/app/dashboard/[auditId]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { AlertTriangle, TrendingDown, Lightbulb, Activity, CheckCircle, Download, ArrowLeft, Target, Wallet, Zap, BarChart } from 'lucide-react';",
  `import { AlertTriangle, TrendingDown, Lightbulb, Activity, CheckCircle, Download, ArrowLeft, Target, Wallet, Zap, BarChart, Percent } from 'lucide-react';\nimport { PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';`
);

const kpiCardsStart = content.indexOf('<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">');
const kpiCardsEnd = content.indexOf('<div className="grid gap-8 md:grid-cols-12">');

const newKpiCards = `<div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{audit.healthScore}/100</div>
            <div className="mt-2 flex items-center gap-2">
              <div className={\`h-2 w-full rounded-full \${getBandColor(audit.healthBand)}\`} />
              <span className="text-xs font-semibold uppercase">{audit.healthBand}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wasted Spend</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$\{((audit.wastedSpendAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-1">Budget spent inefficiently</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Potential Savings</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              $\{((audit.potentialSavingsAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">Immediate recovery</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-50/30 dark:bg-orange-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Budget At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
              $\{((audit.budgetAtRiskAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-orange-600/80 dark:text-orange-400/80 mt-1">Fatigue & poor CTR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunity Score</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={\`text-2xl font-bold \${getOpportunityColor(audit.opportunityScore || 0)}\`}>
              {audit.opportunityScore || 0}/100
            </div>
            <p className="text-xs text-muted-foreground mt-1">Room for improvement</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-50/30 dark:bg-blue-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Estimated Imp.</CardTitle>
            <Percent className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-blue-700 dark:text-blue-400">
              CPA: {audit.estimatedImprovement?.expectedCpaReduction || 'N/A'}
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">ROAS: {audit.estimatedImprovement?.expectedRoasIncrease || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>\n\n      `;

content = content.substring(0, kpiCardsStart) + newKpiCards + content.substring(kpiCardsEnd);

const gridStart = content.indexOf('<div className="grid gap-8 md:grid-cols-12">');
const rawDataStart = content.indexOf('<Card>\n        <CardHeader>\n          <CardTitle>Raw Data Findings</CardTitle>');

const newLayout = `<div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-12 space-y-8">
          <Card>
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2 text-primary">
                <BarChart className="h-5 w-5" /> Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {typeof exSum === 'string' ? (
                <p className="text-sm text-muted-foreground">{exSum}</p>
              ) : (
                <>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Current State</h4>
                      <p className="text-sm font-medium leading-relaxed bg-muted/50 p-4 rounded-lg">{exSum.currentState || 'N/A'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Top Risks</h4>
                      <ul className="space-y-2">
                        {(exSum.topRisks || []).map((risk: string, i: number) => (
                          <li key={i} className="text-sm font-medium text-red-600 dark:text-red-400 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2 tracking-wider">Priority Actions</h4>
                      <div className="space-y-3">
                        {(exSum.priorityActions || []).map((action: any, i: number) => (
                          <div key={i} className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                            <h5 className="text-sm font-bold text-blue-700 dark:text-blue-400">{action.action}</h5>
                            <p className="text-xs mt-1 text-muted-foreground">{action.reason}</p>
                            <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">Impact: {action.financialImpact} &rarr; {action.expectedResult}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {audit.campaignMetrics && audit.campaignMetrics.length > 0 && (
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
             <Card>
               <CardHeader><CardTitle className="text-sm">Spend Distribution</CardTitle></CardHeader>
               <CardContent className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={[
                         { name: 'Wasted', value: audit.wastedSpendAmount || 0 },
                         { name: 'At Risk', value: audit.budgetAtRiskAmount || 0 },
                         { name: 'Good', value: Math.max(0, audit.campaignMetrics.reduce((sum: any, c: any) => sum + c.spend, 0) - (audit.wastedSpendAmount || 0) - (audit.budgetAtRiskAmount || 0)) }
                       ]}
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       <Cell fill="#ef4444" />
                       <Cell fill="#f97316" />
                       <Cell fill="#10b981" />
                     </Pie>
                     <Tooltip formatter={(value) => "$" + Number(value).toLocaleString()} />
                   </PieChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>

             <Card>
               <CardHeader><CardTitle className="text-sm">Campaign ROAS vs Spend</CardTitle></CardHeader>
               <CardContent className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid />
                     <XAxis type="number" dataKey="spend" name="Spend" unit="$" />
                     <YAxis type="number" dataKey="roas" name="ROAS" />
                     <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                     <Scatter name="Campaigns" data={audit.campaignMetrics.filter((c: any) => c.roas > 0)} fill="#3b82f6" />
                   </ScatterChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>

             <Card>
               <CardHeader><CardTitle className="text-sm">CTR vs Conversions</CardTitle></CardHeader>
               <CardContent className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                   <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid />
                     <XAxis type="number" dataKey="ctr" name="CTR" unit="%" />
                     <YAxis type="number" dataKey="conversions" name="Conversions" />
                     <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                     <Scatter name="Campaigns" data={audit.campaignMetrics.map((c: any) => ({ ...c, ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0 }))} fill="#8b5cf6" />
                   </ScatterChart>
                 </ResponsiveContainer>
               </CardContent>
             </Card>
          </div>
        )}

        <div className="md:col-span-12">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Consultant Recommendations</CardTitle>
              <CardDescription>Strict, data-backed strategic advice for maximum impact.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {audit.recommendations?.map((rec: any, idx: number) => (
                <div key={idx} className="p-5 border rounded-xl space-y-4 bg-card shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex items-start justify-between pl-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="font-bold">Rank {rec.rank || idx + 1}</Badge>
                      <h4 className="font-bold text-lg">{rec.action || 'Recommendation'}</h4>
                    </div>
                  </div>
                  <div className="pl-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-red-50/50 dark:bg-red-950/20 p-3 rounded-lg border border-red-100 dark:border-red-900">
                        <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">The Problem</h5>
                        <p className="text-sm font-medium">{rec.problem}</p>
                      </div>
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900">
                        <h5 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-1">Expected Result</h5>
                        <p className="text-sm font-medium">{rec.expectedResult}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Affected Campaigns:</span>
                        <p className="font-mono text-xs bg-muted/50 p-2 rounded">{rec.affectedCampaigns}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-1">Financial Impact:</span>
                        <div className="flex items-center gap-2 font-medium">
                          <Wallet className="h-4 w-4 text-orange-500" />
                          <span>{rec.financialImpact}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {(!audit.recommendations || audit.recommendations.length === 0) && (
                <p className="text-sm text-muted-foreground p-4 text-center">No recommendations generated.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>\n\n      `;

content = content.substring(0, gridStart) + newLayout + content.substring(rawDataStart);

fs.writeFileSync(path, content, 'utf8');

import { MetaAdsRow } from './csv-parser';

export interface AuditResult {
  healthScore: number;
  healthBand: 'excellent' | 'good' | 'warning' | 'critical';
  healthReasoning: string;
  wastedSpendAmount: number;
  potentialSavingsAmount: number;
  opportunityScore: number;
  fatigueRisk: 'low' | 'medium' | 'high';
  findings: Array<{
    findingType: 'wasted_spend' | 'fatigue' | 'audience' | 'budget' | 'performance';
    severity: 'low' | 'medium' | 'high';
    entityLevel: 'campaign' | 'ad_set' | 'ad';
    entityName: string;
    reasonCode: string;
    findingText: string;
    metricSnapshot: any;
    potentialSavings?: number;
  }>;
  budgetAtRiskAmount: number;
  campaignMetrics: any[];
  confidenceScore: number;
}

export function runAudit(data: MetaAdsRow[]): AuditResult {
  let totalSpend = 0;
  let totalConversions = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  
  let wastedSpendAmount = 0;
  let fatiguedSpend = 0;
  let potentialSavingsAmount = 0;
  let budgetAtRiskAmount = 0;
  let spendWithZeroConversions = 0;
  let spendWithRoasLessThan1 = 0;

  const findings: AuditResult['findings'] = [];
  const campaignPerformance: Record<string, { spend: number, conversions: number, cpa: number, roas: number, impressions: number, clicks: number }> = {};
  
  // Track metrics for Confidence Score
  let expectedMetrics = data.length * 10; // campaign, spend, impressions, clicks, ctr, frequency, conversions, revenue, roas, cpa
  let availableMetrics = 0;
  
  let totalRevenue = 0;
  let hasRevenueData = false;

  for (const row of data) {
    totalSpend += row.spend;
    totalConversions += row.conversions;
    totalImpressions += row.impressions || 0;
    totalClicks += row.clicks || 0;

    if (row.conversions === 0) spendWithZeroConversions += row.spend;
    if (!row.roas || row.roas < 1) spendWithRoasLessThan1 += row.spend;
    
    if (row.revenue !== undefined) {
      totalRevenue += row.revenue;
      hasRevenueData = true;
    }

    // Confidence Score Checks (Check presence of 10 columns)
    if (row.campaignName || row.adSetName || row.adName) availableMetrics++;
    if (row.spend !== undefined) availableMetrics++;
    if (row.impressions !== undefined) availableMetrics++;
    if (row.clicks !== undefined) availableMetrics++;
    if (row.ctr !== undefined) availableMetrics++;
    if (row.frequency !== undefined) availableMetrics++;
    if (row.conversions !== undefined) availableMetrics++;
    if (row.revenue !== undefined) availableMetrics++;
    if (row.roas !== undefined) availableMetrics++;
    if (row.cpa !== undefined) availableMetrics++;
    
    // Aggregate campaign performance
    if (!campaignPerformance[row.campaignName]) {
      campaignPerformance[row.campaignName] = { spend: 0, conversions: 0, cpa: 0, roas: 0, impressions: 0, clicks: 0 };
    }
    campaignPerformance[row.campaignName].spend += row.spend;
    campaignPerformance[row.campaignName].conversions += row.conversions;
    campaignPerformance[row.campaignName].impressions += (row.impressions || 0);
    campaignPerformance[row.campaignName].clicks += (row.clicks || 0);
    if (row.roas && row.roas > campaignPerformance[row.campaignName].roas) {
      campaignPerformance[row.campaignName].roas = row.roas; 
    }
  }

  // Calculate Average CPA only from rows with conversions
  const spendWithConversions = data.filter(r => r.conversions > 0).reduce((sum, r) => sum + r.spend, 0);
  const accountCpa = totalConversions > 0 ? spendWithConversions / totalConversions : 0;
  const accountCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  for (const row of data) {
    const entityName = row.campaignName || row.adSetName || row.adName || 'Unknown';
    const entityLevel = row.campaignName ? 'campaign' : (row.adSetName ? 'ad_set' : 'ad');

    // Wasted Spend / Potential Savings (conversions == 0 OR ROAS < 1 OR CPA > 2x account CPA)
    const isWastedSpend = row.conversions === 0 || (row.roas !== undefined && row.roas < 1) || (accountCpa > 0 && row.cpa > accountCpa * 2);

    if (isWastedSpend) {
      potentialSavingsAmount += row.spend;
    } else {
      // Budget At Risk: Spend affected by Creative Fatigue, Poor CTR, Declining ROAS (excluding Wasted Spend)
      const isFatigued = row.frequency > 4;
      const isPoorCtr = row.ctr < accountCtr;
      const isDecliningRoas = row.roas !== undefined && row.roas < 2; // Below healthy 2x threshold but not < 1 (wasted)
      if (isFatigued || isPoorCtr || isDecliningRoas) {
        budgetAtRiskAmount += row.spend;
      }
    }

    // Wasted Spend Findings (Subset of savings)
    if (row.spend > 50 && row.conversions === 0) {
      wastedSpendAmount += row.spend;
      findings.push({
        findingType: 'wasted_spend',
        severity: 'high',
        entityLevel,
        entityName,
        reasonCode: 'high_spend_zero_conversions',
        findingText: `Spent $${row.spend.toFixed(2)} with 0 conversions.`,
        metricSnapshot: { spend: row.spend, conversions: row.conversions },
        potentialSavings: row.spend
      });
    } else if (accountCpa > 0 && row.spend > accountCpa * 3 && row.cpa > accountCpa * 2) {
      wastedSpendAmount += row.spend;
      findings.push({
        findingType: 'wasted_spend',
        severity: 'medium',
        entityLevel,
        entityName,
        reasonCode: 'high_cpa',
        findingText: `CPA is $${row.cpa.toFixed(2)}, which is significantly higher than account average of $${accountCpa.toFixed(2)}.`,
        metricSnapshot: { spend: row.spend, cpa: row.cpa, accountCpa },
        potentialSavings: row.spend
      });
    }

    // Fatigue
    if (row.frequency > 4) {
      fatiguedSpend += row.spend;
      findings.push({
        findingType: 'fatigue',
        severity: row.frequency > 6 ? 'high' : 'medium',
        entityLevel,
        entityName,
        reasonCode: 'high_frequency',
        findingText: `Frequency is ${row.frequency.toFixed(2)}, indicating potential creative fatigue.`,
        metricSnapshot: { spend: row.spend, frequency: row.frequency, ctr: row.ctr }
      });
    } else if (row.frequency > 3 && row.ctr < 1) {
      fatiguedSpend += row.spend;
      findings.push({
        findingType: 'fatigue',
        severity: 'medium',
        entityLevel,
        entityName,
        reasonCode: 'frequency_low_ctr',
        findingText: `Frequency is ${row.frequency.toFixed(2)} with a low CTR of ${row.ctr.toFixed(2)}%, indicating fatigue.`,
        metricSnapshot: { spend: row.spend, frequency: row.frequency, ctr: row.ctr }
      });
    }
  }

  // Budget Allocation & Performance
  Object.keys(campaignPerformance).forEach(campaignName => {
    const perf = campaignPerformance[campaignName];
    perf.cpa = perf.conversions > 0 ? perf.spend / perf.conversions : 0;
  });

  const campaignsArray = Object.entries(campaignPerformance).map(([name, data]) => ({ name, ...data }));
  campaignsArray.sort((a, b) => b.spend - a.spend); 

  let trueTopPerformer = null;
  let bestAvailable = null;

  for (const c of campaignsArray) {
      const cCtr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0;
      if (c.conversions >= 3 && c.roas >= 2 && c.cpa < accountCpa && cCtr > accountCtr) {
          if (!trueTopPerformer || c.cpa < trueTopPerformer.cpa) {
              trueTopPerformer = c;
          }
      }
      if (c.conversions > 0) {
          if (!bestAvailable || c.cpa < bestAvailable.cpa) {
              bestAvailable = c;
          }
      }
  }

  if (trueTopPerformer) {
    findings.push({
      findingType: 'performance',
      severity: 'low',
      entityLevel: 'campaign',
      entityName: trueTopPerformer.name,
      reasonCode: 'top_performer',
      findingText: `Top performer with CPA $${trueTopPerformer.cpa.toFixed(2)}, ROAS ${trueTopPerformer.roas}, and high CTR. Scale this campaign immediately.`,
      metricSnapshot: { spend: trueTopPerformer.spend, cpa: trueTopPerformer.cpa, roas: trueTopPerformer.roas, conversions: trueTopPerformer.conversions }
    });
  } else if (bestAvailable) {
      findings.push({
      findingType: 'performance',
      severity: 'medium',
      entityLevel: 'campaign',
      entityName: bestAvailable.name,
      reasonCode: 'best_available_performer',
      findingText: `Best available performer (CPA $${bestAvailable.cpa.toFixed(2)}), but lacks ideal volume/ROAS for aggressive scaling.`,
      metricSnapshot: { spend: bestAvailable.spend, cpa: bestAvailable.cpa, conversions: bestAvailable.conversions }
    });
  }

  const worstPerformer = campaignsArray.filter(c => c.spend > 50).sort((a, b) => b.cpa - a.cpa)[0];
  if (worstPerformer && worstPerformer.cpa > accountCpa * 1.5) {
    findings.push({
      findingType: 'budget',
      severity: 'high',
      entityLevel: 'campaign',
      entityName: worstPerformer.name,
      reasonCode: 'worst_performer_overspend',
      findingText: `High spend ($${worstPerformer.spend.toFixed(2)}) on poor CPA ($${worstPerformer.cpa.toFixed(2)}). Reallocate budget to top performers.`,
      metricSnapshot: { spend: worstPerformer.spend, cpa: worstPerformer.cpa, accountCpa }
    });
  }

  const wastedSpendRatio = totalSpend > 0 ? wastedSpendAmount / totalSpend : 0;
  const fatiguedSpendRatio = totalSpend > 0 ? fatiguedSpend / totalSpend : 0;
  
  // Average ROAS
  let averageRoas = hasRevenueData ? (totalSpend > 0 ? totalRevenue / totalSpend : 0) : null;

  // Audit Confidence Score
  const confidenceScore = expectedMetrics > 0 ? Math.round((availableMetrics / expectedMetrics) * 100) : 0;

  // Health Score Logic (Wasted Spend = 35%, ROAS = 25%, CPA = 15%, Fatigue = 15%, Confidence = 10%)
  let healthScore = 100;
  healthScore -= (wastedSpendRatio * 35);
  if (averageRoas !== null && averageRoas < 2) {
    healthScore -= ((2 - averageRoas) / 2) * 25; // Deduct up to 25% if ROAS is below 2
  }
  if (accountCpa > 0 && totalConversions > 0) {
    const cpaEfficiency = spendWithConversions / accountCpa; // Rough efficiency
    // Simplified: if average CPA is high relative to a baseline, deduct
  }
  healthScore -= (fatiguedSpendRatio * 15);
  healthScore -= ((100 - confidenceScore) / 100) * 10;
  
  if (totalSpend === 0) healthScore = 0;
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  // Health Reasoning
  const reasons = [];
  if (wastedSpendRatio > 0.2) reasons.push(`Significant wasted spend identified`);
  if (averageRoas !== null && averageRoas < 1) reasons.push(`Account average ROAS is below 1`);
  if (fatiguedSpendRatio > 0.2) reasons.push(`Creative fatigue affecting significant budget`);
  if (confidenceScore < 80) reasons.push(`Missing data metrics reducing audit confidence`);
  const healthReasoning = reasons.length > 0 ? reasons.join('. ') + '.' : 'Account metrics are looking solid with efficient spend.';

  let healthBand: AuditResult['healthBand'] = 'excellent';
  if (healthScore < 40) healthBand = 'critical';
  else if (healthScore < 70) healthBand = 'warning';
  else if (healthScore < 90) healthBand = 'good';

  let fatigueRisk: AuditResult['fatigueRisk'] = 'low';
  if (fatiguedSpendRatio > 0.4) fatigueRisk = 'high';
  else if (fatiguedSpendRatio > 0.15) fatigueRisk = 'medium';

  // Opportunity Score (0-95)
  // formula = ((100 - HealthScore) * 0.5 + WastedSpendPercent * 0.3 + FatiguePercent * 0.2)
  let oppScore = ((100 - healthScore) * 0.5) + (wastedSpendRatio * 100 * 0.3) + (fatiguedSpendRatio * 100 * 0.2);
  const opportunityScore = Math.max(0, Math.min(95, Math.round(oppScore)));

  return {
    healthScore,
    healthBand,
    healthReasoning,
    wastedSpendAmount,
    potentialSavingsAmount,
    opportunityScore,
    confidenceScore,
    fatigueRisk,
    budgetAtRiskAmount,
    campaignMetrics: campaignsArray,
    findings: findings.sort((a, b) => {
      const severityMap = { high: 3, medium: 2, low: 1 };
      return severityMap[b.severity] - severityMap[a.severity];
    }).slice(0, 20)
  };
}

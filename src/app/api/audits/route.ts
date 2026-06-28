import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseMetaAdsCsv } from '@/lib/csv-parser';
import { runAudit } from '@/lib/audit-engine';
import { validateKPIs } from '@/lib/kpi-validator';
import { generateRecommendations } from '@/lib/ai-service';
import { readFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const { uploadId, industry } = await req.json();

    if (!uploadId) {
      return NextResponse.json({ success: false, error: 'Missing uploadId' }, { status: 400 });
    }

    const upload = await prisma.upload.findUnique({
      where: { id: uploadId },
      include: { user: true }
    });

    if (!upload) {
      return NextResponse.json({ success: false, error: 'Upload not found' }, { status: 404 });
    }

    // Read CSV from disk
    const text = await readFile(upload.storagePath, 'utf-8');
    const { data } = parseMetaAdsCsv(text);

    // Run heuristics
    let auditResult = runAudit(data);
    
    // Validate KPIs
    const totalSpend = data.reduce((sum, row) => sum + (row.spend || 0), 0);
    auditResult = validateKPIs(auditResult, totalSpend);

    const totalConversions = data.reduce((sum, row) => sum + (row.conversions || 0), 0);
    const spendWithConversions = data.filter(r => r.conversions > 0).reduce((sum, r) => sum + r.spend, 0);
    const averageCpa = totalConversions > 0 ? spendWithConversions / totalConversions : 0;
    const roasCampaigns = auditResult.campaignMetrics.filter((c) => c.roas > 0);
    const averageRoas = roasCampaigns.length > 0 
      ? roasCampaigns.reduce((sum, c) => sum + c.roas, 0) / roasCampaigns.length 
      : 0;

    // Generate AI Recommendations
    const aiOutput = await generateRecommendations(auditResult, industry);

    console.log({
      totalSpend,
      totalConversions,
      wastedSpend: auditResult.wastedSpendAmount,
      potentialSavings: auditResult.potentialSavingsAmount,
      budgetAtRisk: auditResult.budgetAtRiskAmount,
      averageCPA: averageCpa,
      averageROAS: averageRoas,
      confidenceScore: auditResult.confidenceScore
    });
    
    console.log("=== AI RECOMMENDATION OUTPUT ===");
    console.log(JSON.stringify(aiOutput, null, 2));
    console.log("================================");

    // Save to database
    const audit = await prisma.audit.create({
      data: {
        userId: upload.userId,
        uploadId: upload.id,
        industry,
        healthScore: auditResult.healthScore,
        healthBand: auditResult.healthBand,
        wastedSpendAmount: auditResult.wastedSpendAmount,
        potentialSavingsAmount: auditResult.potentialSavingsAmount,
        budgetAtRiskAmount: auditResult.budgetAtRiskAmount,
        opportunityScore: auditResult.opportunityScore,
        healthReasoning: auditResult.healthReasoning,
        fatigueRisk: auditResult.fatigueRisk,
        confidenceScore: auditResult.confidenceScore,
        campaignMetrics: auditResult.campaignMetrics as any,
        executiveSummary: aiOutput.executiveSummary as any,
        estimatedImprovement: aiOutput.estimatedImprovement as any,
        priorityActions: [], // we will store the priority actions as part of executive summary now, or just leave empty array if unused
        findings: {
          create: auditResult.findings.map(f => ({
            findingType: f.findingType,
            severity: f.severity,
            entityLevel: f.entityLevel,
            entityName: f.entityName,
            reasonCode: f.reasonCode,
            findingText: f.findingText,
            metricSnapshot: f.metricSnapshot,
            potentialSavings: f.potentialSavings,
          }))
        },
        recommendations: {
          create: aiOutput.recommendations.map(r => ({
            rank: r.rank || 1,
            category: 'general',
            title: r.title || 'Recommendation',
            rationale: '',
            action: r.action || 'Review campaign settings',
            problem: r.problem || 'Unknown issue detected',
            affectedCampaigns: Array.isArray(r.affectedCampaigns) ? r.affectedCampaigns.join(', ') : (r.affectedCampaigns || 'Multiple campaigns'),
            financialImpact: r.financialImpact || 'Not calculated',
            expectedResult: r.expectedResult || 'Improved performance'
          }))
        }
      }
    });

    return NextResponse.json({ success: true, auditId: audit.id });

  } catch (error: any) {
    console.error('Audit generation error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

import { GoogleGenAI } from '@google/genai';
import { AuditResult } from './audit-engine';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AIRecommendation {
  rank: number;
  title: string;
  problem: string;
  affectedCampaigns: string[];
  financialImpact: string;
  action: string;
  expectedResult: string;
}

export interface AIGeneratedOutput {
  executiveSummary: {
    totalSpend: string;
    wastedSpend: string;
    potentialSavings: string;
    budgetAtRisk: string;
    averageCtr: string;
    averageCpa: string;
    averageRoas: string;
    currentState: string;
    topRisks: string[];
    priorityActions: Array<{
      action: string;
      reason: string;
      affectedCampaigns: string[];
      financialImpact: string;
      expectedResult: string;
    }>;
  };
  estimatedImprovement: {
    expectedCpaReduction: string;
    expectedRoasIncrease: string;
    expectedEfficiencyGain: string;
  };
  recommendations: AIRecommendation[];
}

export async function generateRecommendations(audit: AuditResult, industry?: string): Promise<AIGeneratedOutput> {
  const prompt = `
You are a Senior Meta Ads Consultant advising a client.
Review the following automated findings and metrics from a Meta Ads account.
Industry: ${industry || 'Not specified'}

Health Score: ${audit.healthScore} (${audit.healthBand})
Health Reasoning: ${audit.healthReasoning}
Wasted Spend: $${audit.wastedSpendAmount.toFixed(2)}
Potential Savings: $${audit.potentialSavingsAmount.toFixed(2)}
Budget At Risk: $${audit.budgetAtRiskAmount.toFixed(2)}
Opportunity Score: ${audit.opportunityScore}/100
Fatigue Risk: ${audit.fatigueRisk}

Top Findings:
${JSON.stringify(audit.findings, null, 2)}

Requirements:
1. Act strictly as a Senior Meta Ads Consultant. Do not act like an AI summarizer.
2. AI must NEVER say: "Improve creatives", "Improve targeting", "Optimize campaigns". Generic advice is strictly forbidden.
3. Maximum 5 recommendations. Rank them by business impact (1 is highest).
4. For Priority Actions AND Recommendations, you MUST reference the specific Campaign Name.
5. NEVER use generic terms like "Cold Audience", "General Audience", "Broad Audience" if they are Ad Sets, ALWAYS roll up to the Campaign Name first.
6. Every recommendation MUST contain: Campaign Name, Exact Spend, Conversions, CPA, ROAS, Expected Savings, and Expected Outcome.

Example Recommendation Body:
"Pause Black Friday Sale.
Spend: $27,000
Conversions: 0
ROAS: 0
Savings: $27,000
Expected Impact: +35% account efficiency."

Respond with exactly this JSON schema:
{
  "executiveSummary": {
    "totalSpend": "e.g., $111,000",
    "wastedSpend": "e.g., $58,000",
    "potentialSavings": "e.g., $58,000",
    "budgetAtRisk": "e.g., $106,000",
    "averageCtr": "e.g., 0.8%",
    "averageCpa": "e.g., $45.00",
    "averageRoas": "e.g., 1.2",
    "currentState": "e.g., $111,000 spent across various segments...",
    "topRisks": [
      "1. Black Friday Sale wasted $27,000.",
      "2. Conversion Campaign wasted $16,000."
    ],
    "priorityActions": [
      {
        "action": "Pause Black Friday Sale immediately.",
        "reason": "Because...",
        "affectedCampaigns": ["Black Friday Sale"],
        "financialImpact": "$27,000 saved",
        "expectedResult": "Improve ROAS by 10%"
      }
    ]
  },
  "estimatedImprovement": {
    "expectedCpaReduction": "30%",
    "expectedRoasIncrease": "40%",
    "expectedEfficiencyGain": "55%"
  },
  "recommendations": [
    {
      "rank": 1,
      "title": "Short title describing the issue",
      "problem": "Explicit data-backed problem.",
      "affectedCampaigns": ["Campaign Name 1", "Campaign Name 2"],
      "financialImpact": "Explicit impact.",
      "action": "Exact action (e.g., Pause these campaigns immediately).",
      "expectedResult": "Math-backed result."
    }
  ]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI');
    }

    const parsed: AIGeneratedOutput = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error('Error generating AI recommendations:');
    console.error(error);
    return {
      executiveSummary: {
        totalSpend: 'N/A',
        wastedSpend: 'N/A',
        potentialSavings: 'N/A',
        budgetAtRisk: 'N/A',
        averageCtr: 'N/A',
        averageCpa: 'N/A',
        averageRoas: 'N/A',
        currentState: 'Unable to generate AI analysis.',
        topRisks: ['Unknown risks'],
        priorityActions: []
      },
      estimatedImprovement: {
        expectedCpaReduction: 'N/A',
        expectedRoasIncrease: 'N/A',
        expectedEfficiencyGain: 'N/A'
      },
      recommendations: []
    };
  }
}

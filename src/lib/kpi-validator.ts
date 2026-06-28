import { AuditResult } from './audit-engine';

export function validateKPIs(auditResult: AuditResult, totalSpend: number): AuditResult {
  let validated = { ...auditResult };

  if (validated.potentialSavingsAmount > totalSpend) {
    throw new Error(`Validation Error: Potential Savings ($${validated.potentialSavingsAmount}) cannot exceed Total Spend ($${totalSpend}).`);
  }

  if (validated.budgetAtRiskAmount > totalSpend) {
    throw new Error(`Validation Error: Budget At Risk ($${validated.budgetAtRiskAmount}) cannot exceed Total Spend ($${totalSpend}).`);
  }

  if (validated.opportunityScore > 95 || validated.opportunityScore < 0) {
    throw new Error(`Validation Error: Opportunity Score (${validated.opportunityScore}) must be between 0 and 95.`);
  }

  if (validated.confidenceScore < 0 || validated.confidenceScore > 100) {
    throw new Error(`Validation Error: Confidence Score (${validated.confidenceScore}) must be between 0 and 100.`);
  }

  if (validated.healthScore < 0 || validated.healthScore > 100) {
    throw new Error(`Validation Error: Health Score (${validated.healthScore}) must be between 0 and 100.`);
  }

  return validated;
}

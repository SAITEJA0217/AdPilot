const fs = require('fs');
const { parseMetaAdsCsv } = require('./src/lib/csv-parser');
const { runAudit } = require('./src/lib/audit-engine');
const { validateKPIs } = require('./src/lib/kpi-validator');

// Read demo file
const text = fs.readFileSync('./public/demos/bad_meta_ads.csv', 'utf-8');
const { data } = parseMetaAdsCsv(text);

const totalSpend = data.reduce((sum, row) => sum + (row.spend || 0), 0);
console.log('Total Spend from CSV:', totalSpend);

let auditResult = runAudit(data);

console.log('--- Before Validation ---');
console.log('potentialSavingsAmount:', auditResult.potentialSavingsAmount);
console.log('budgetAtRiskAmount:', auditResult.budgetAtRiskAmount);
console.log('opportunityScore:', auditResult.opportunityScore);
console.log('confidenceScore:', auditResult.confidenceScore);

auditResult = validateKPIs(auditResult, totalSpend);

console.log('--- After Validation ---');
console.log('potentialSavingsAmount:', auditResult.potentialSavingsAmount);
console.log('budgetAtRiskAmount:', auditResult.budgetAtRiskAmount);
console.log('opportunityScore:', auditResult.opportunityScore);
console.log('confidenceScore:', auditResult.confidenceScore);

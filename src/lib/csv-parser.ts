import Papa from 'papaparse';

export interface MetaAdsRow {
  campaignName: string;
  adSetName?: string;
  adName?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cpa: number;
  frequency: number;
  dateStart?: string;
  dateEnd?: string;
  roas?: number;
  revenue?: number;
}

const COLUMN_ALIASES: Record<keyof MetaAdsRow, string[]> = {
  campaignName: ['campaign name', 'campaign', 'campaign_name'],
  adSetName: ['ad set name', 'ad set', 'adset name', 'adset_name'],
  adName: ['ad name', 'ad', 'ad_name'],
  spend: ['amount spent (usd)', 'amount spent', 'spend', 'cost'],
  impressions: ['impressions', 'impr'],
  clicks: ['link clicks', 'clicks (all)', 'clicks', 'outbound clicks'],
  ctr: ['ctr (link click-through rate)', 'ctr (all)', 'ctr', 'outbound ctr'],
  cpc: ['cpc (cost per link click)', 'cpc (all)', 'cpc'],
  cpm: ['cpm (cost per 1,000 impressions)', 'cpm'],
  conversions: ['results', 'purchases', 'leads', 'conversions'],
  cpa: ['cost per result', 'cost per purchase', 'cost per lead', 'cpa'],
  frequency: ['frequency'],
  dateStart: ['reporting starts', 'date start', 'start date'],
  dateEnd: ['reporting ends', 'date end', 'end date'],
  roas: ['purchase roas (return on ad spend)', 'roas'],
  revenue: ['purchase conversion value', 'revenue', 'purchases conversion value'],
};

export function parseMetaAdsCsv(csvString: string): { data: MetaAdsRow[], errors: string[] } {
  const { data, errors: papaErrors, meta } = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = papaErrors.map(e => e.message);
  const parsedData: MetaAdsRow[] = [];

  if (!meta.fields || meta.fields.length === 0) {
    return { data: [], errors: ['No columns found in CSV'] };
  }

  const headers = meta.fields.map(h => h.toLowerCase().trim());
  const fieldMapping: Partial<Record<keyof MetaAdsRow, string>> = {};

  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const header of headers) {
      if (aliases.some(alias => header.includes(alias))) {
        fieldMapping[key as keyof MetaAdsRow] = header;
        break;
      }
    }
  }

  // Strict Validation for MVP
  if (!fieldMapping.campaignName && !fieldMapping.adSetName && !fieldMapping.adName) {
    errors.push('Missing required entity column: Must include Campaign, Ad Set, or Ad Name.');
  }
  if (!fieldMapping.spend) {
    errors.push('Missing required column: Spend / Amount Spent.');
  }

  if (errors.length > 0 && papaErrors.length === 0) {
    return { data: [], errors };
  }

  const parseNumber = (val: any): number => {
    if (val === undefined || val === null || val === '') return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  for (const row of data as any[]) {
    const normalizedRow: Record<string, any> = {};
    for (const [k, v] of Object.entries(row)) {
      normalizedRow[k.toLowerCase().trim()] = v;
    }

    const spend = parseNumber(normalizedRow[fieldMapping.spend || '']);
    if (spend === 0 && !normalizedRow[fieldMapping.campaignName || '']) {
      // Skip totally empty summary rows
      continue;
    }

    const impressions = parseNumber(normalizedRow[fieldMapping.impressions || '']);
    const clicks = parseNumber(normalizedRow[fieldMapping.clicks || '']);
    const conversions = parseNumber(normalizedRow[fieldMapping.conversions || '']);
    const roas = parseNumber(normalizedRow[fieldMapping.roas || '']);
    const revenueValue = normalizedRow[fieldMapping.revenue || ''];
    const revenue = revenueValue !== undefined && revenueValue !== '' ? parseNumber(revenueValue) : undefined;

    const ctr = parseNumber(normalizedRow[fieldMapping.ctr || '']) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
    const cpc = parseNumber(normalizedRow[fieldMapping.cpc || '']) || (clicks > 0 ? spend / clicks : 0);
    const cpm = parseNumber(normalizedRow[fieldMapping.cpm || '']) || (impressions > 0 ? (spend / impressions) * 1000 : 0);
    const cpa = parseNumber(normalizedRow[fieldMapping.cpa || '']) || (conversions > 0 ? spend / conversions : 0);
    const frequency = parseNumber(normalizedRow[fieldMapping.frequency || '']) || 1;

    parsedData.push({
      campaignName: String(normalizedRow[fieldMapping.campaignName || ''] || 'Unknown Campaign'),
      adSetName: normalizedRow[fieldMapping.adSetName || ''] ? String(normalizedRow[fieldMapping.adSetName || '']) : undefined,
      adName: normalizedRow[fieldMapping.adName || ''] ? String(normalizedRow[fieldMapping.adName || '']) : undefined,
      spend,
      impressions,
      clicks,
      ctr,
      cpc,
      cpm,
      conversions,
      cpa,
      frequency,
      roas,
      revenue,
      dateStart: normalizedRow[fieldMapping.dateStart || ''] || undefined,
      dateEnd: normalizedRow[fieldMapping.dateEnd || ''] || undefined,
    });
  }

  return { data: parsedData, errors };
}

import { pages } from './pages';
import { leads } from './leads';

/* ── Per-page leads & conversions distribution ── */

// Deterministic pseudo-random from seed
function seededRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

let _leadsPerPage: Record<string, number> | null = null;

/** Distribute total lead count across top ~300 pages by traffic weight (power-law) */
export function getLeadsPerPage(): Record<string, number> {
  if (_leadsPerPage) return _leadsPerPage;

  const totalLeads = leads.length; // 2,934
  const rng = seededRng(42);

  // Build page weights with a gentle slope (flatter than traffic distribution)
  // Top pages ~15 leads, mid-range ~8-10, tail ~3-5
  const weighted = pages.map((p, idx) => {
    const rank = idx + 1;
    // Very gentle power law — exponent 0.18 gives ~2:1 ratio between top and #300
    const weight = Math.pow(pages.length / rank, 0.18);
    return { id: p.id, weight: Math.max(0, weight) };
  });

  // Only top ~300 pages get leads; add small noise for realism
  const cutoff = 300;
  weighted.forEach((w, i) => {
    if (i >= cutoff) w.weight = 0;
    else w.weight *= (0.85 + rng() * 0.30); // ±15% noise
  });

  // Normalize weights to sum to totalLeads
  const totalWeight = weighted.reduce((s, w) => s + w.weight, 0);
  const result: Record<string, number> = {};
  let allocated = 0;

  weighted.forEach((w) => {
    const raw = (w.weight / totalWeight) * totalLeads;
    const count = Math.round(raw);
    result[w.id] = count;
    allocated += count;
  });

  // Fix rounding to match exact total
  const diff = totalLeads - allocated;
  if (diff !== 0) {
    for (let i = 0; i < Math.abs(diff); i++) {
      const id = weighted[i % cutoff].id;
      result[id] += diff > 0 ? 1 : -1;
    }
  }

  _leadsPerPage = result;
  return result;
}

let _conversionsPerPage: Record<string, number> | null = null;

/** Conversions = small fraction of leads (5-15%) per page */
export function getConversionsPerPage(): Record<string, number> {
  if (_conversionsPerPage) return _conversionsPerPage;

  const leadsMap = getLeadsPerPage();
  const rng = seededRng(77);
  const result: Record<string, number> = {};

  for (const [id, leadCount] of Object.entries(leadsMap)) {
    if (leadCount <= 0) {
      result[id] = 0;
    } else {
      // 5-15% conversion rate from leads → conversions
      const rate = 0.05 + rng() * 0.10;
      result[id] = Math.max(0, Math.round(leadCount * rate));
    }
  }

  _conversionsPerPage = result;
  return result;
}

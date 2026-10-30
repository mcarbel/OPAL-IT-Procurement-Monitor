import assert from 'node:assert/strict';
import { gatherTenderReport } from './services/aggregator.ts';
import { server } from './server.ts';

async function runTests() {
  console.log('🧪 Running TenderScan (IT Procurement Monitor) verification suite...\n');

  // 1. Test default aggregation across all 4 portals
  const fullReport = await gatherTenderReport({
    keywords: '',
    regionFilter: '',
    includeLiveFetch: false
  });

  assert.ok(fullReport.tenders.length >= 12, 'Expected at least 12 curated IT tenders across the 4 portals');
  assert.ok(fullReport.summary.bySource.LUXEMBOURG_PORTAL > 0, 'Expected tenders from Marchés Publics du Luxembourg');
  assert.ok(fullReport.summary.bySource.TED > 0, 'Expected tenders from TED');
  assert.ok(fullReport.summary.bySource.TENDOLIO > 0, 'Expected tenders from Tendolio');
  assert.ok(fullReport.summary.bySource.EU_TENDERS > 0, 'Expected tenders from EU Tenders (CPV)');
  assert.ok(fullReport.markdownTable.includes('| Tender Title | Source | Region |'), 'Markdown table header must match Opal spec');
  console.log('✅ Test 1 Passed: Multi-portal aggregation returns all 4 procurement sources & Markdown table.');

  // 2. Test keyword & region filtering
  const cloudLuxReport = await gatherTenderReport({
    keywords: 'Cloud Kubernetes',
    regionFilter: 'Luxembourg',
    includeLiveFetch: false
  });
  assert.ok(cloudLuxReport.tenders.length > 0, 'Expected matching tenders for Cloud Kubernetes in Luxembourg');
  for (const t of cloudLuxReport.tenders) {
    assert.ok(['LU', 'EU'].includes(t.countryCode), `Expected LU or EU country code, got ${t.countryCode}`);
  }
  console.log(`✅ Test 2 Passed: Keyword ("Cloud Kubernetes") + Region ("Luxembourg") matched ${cloudLuxReport.tenders.length} tenders.`);

  // 3. Test CPV code filtering
  const cyberReport = await gatherTenderReport({
    keywords: '',
    regionFilter: '',
    cpvCodes: ['72800000-8'],
    includeLiveFetch: false
  });
  assert.ok(cyberReport.tenders.length > 0, 'Expected tenders for CPV 72800000-8 (Cybersecurity / Audit)');
  for (const t of cyberReport.tenders) {
    assert.ok(t.cpvCodes.some((c) => c.startsWith('728')), 'All returned tenders must include CPV 72800000-8');
  }
  console.log(`✅ Test 3 Passed: CPV Code filter (72800000-8) returned ${cyberReport.tenders.length} cybersecurity/audit tenders.`);

  // 4. Test Opal workflow & static assets integrity
  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  const workflowRaw = await fs.readFile(path.resolve('opal-workflow.json'), 'utf-8');
  const workflow = JSON.parse(workflowRaw) as { title: string; nodes: unknown[] };
  assert.equal(workflow.title, 'TenderScan');
  assert.equal(workflow.nodes.length, 4);

  const indexHtml = await fs.readFile(path.resolve('public/index.html'), 'utf-8');
  assert.ok(indexHtml.includes('IT Procurement Monitor'));
  assert.ok(indexHtml.includes('ask_user_keywords'));
  assert.ok(indexHtml.includes('ask_user_region_filter'));
  console.log('✅ Test 4 Passed: Opal workflow specification & Dashboard UI verified.');

  console.log('\n🎉 All verification tests passed!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

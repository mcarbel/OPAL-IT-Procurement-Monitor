const SOURCE_STYLES = {
  LUXEMBOURG_PORTAL: {
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
    cardAccent: 'border-l-4 border-l-emerald-500',
    shortLabel: 'Luxembourg Portal'
  },
  TED: {
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
    cardAccent: 'border-l-4 border-l-blue-500',
    shortLabel: 'TED Europe'
  },
  TENDOLIO: {
    badgeBg: 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800',
    dot: 'bg-violet-500',
    cardAccent: 'border-l-4 border-l-violet-500',
    shortLabel: 'Tendolio IT'
  },
  EU_TENDERS: {
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
    cardAccent: 'border-l-4 border-l-amber-500',
    shortLabel: 'EU Tenders (CPV)'
  }
};

const state = {
  keywords: '',
  regionFilter: '',
  selectedCpv: '',
  activeSources: new Set(['LUXEMBOURG_PORTAL', 'TED', 'TENDOLIO', 'EU_TENDERS']),
  sortBy: 'relevance',
  portalsMetadata: {},
  cpvDirectory: [],
  currentReport: null
};

// DOM Elements
const searchForm = document.getElementById('searchForm');
const inputKeywords = document.getElementById('inputKeywords');
const inputRegion = document.getElementById('inputRegion');
const selectCpv = document.getElementById('selectCpv');
const btnResetFilters = document.getElementById('btnResetFilters');
const sortSelect = document.getElementById('sortSelect');
const activeParametersBreadcrumbs = document.getElementById('activeParametersBreadcrumbs');
const lastScanTimestamp = document.getElementById('lastScanTimestamp');
const portalCardsContainer = document.getElementById('portalCardsContainer');
const tendersTableBody = document.getElementById('tendersTableBody');
const tendersMobileCards = document.getElementById('tendersMobileCards');
const resultsCountBadge = document.getElementById('resultsCountBadge');
const cpvDirectoryGrid = document.getElementById('cpvDirectoryGrid');

// Modals
const tenderDetailModal = document.getElementById('tenderDetailModal');
const btnCloseDetailModal = document.getElementById('btnCloseDetailModal');
const opalWorkflowModal = document.getElementById('opalWorkflowModal');
const btnOpalWorkflow = document.getElementById('btnOpalWorkflow');
const btnCloseOpalModal = document.getElementById('btnCloseOpalModal');
const opalMarkdownOutput = document.getElementById('opalMarkdownOutput');
const btnCopyMarkdown = document.getElementById('btnCopyMarkdown');
const btnExportCsv = document.getElementById('btnExportCsv');
const btnThemeToggle = document.getElementById('btnThemeToggle');
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadMetadata() {
  const res = await fetch('/api/metadata');
  const data = await res.json();
  state.portalsMetadata = data.portals || {};
  state.cpvDirectory = data.cpvCodes || [];
  renderCpvDirectory();
}

async function fetchTenders() {
  const params = new URLSearchParams();
  if (state.keywords.trim()) params.set('keywords', state.keywords.trim());
  if (state.regionFilter.trim()) params.set('region', state.regionFilter.trim());
  if (state.selectedCpv) params.set('cpv', state.selectedCpv);
  if (state.activeSources.size > 0 && state.activeSources.size < 4) {
    params.set('sources', Array.from(state.activeSources).join(','));
  }

  const res = await fetch(`/api/tenders?${params.toString()}`);
  const report = await res.json();
  state.currentReport = report;

  renderBreadcrumbs(report);
  renderPortalCards(report);
  renderTenders(report);
}

function renderBreadcrumbs(report) {
  const kwText = state.keywords.trim() || 'All IT & Software Keywords';
  const regText = state.regionFilter.trim() || 'Luxembourg & European Union';
  const cpvText = state.selectedCpv || 'CPV 72000000-5, 48000000-8, 30200000-1';

  activeParametersBreadcrumbs.innerHTML = `
    <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">Active Criteria:</span>
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200/80 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800">
      <strong class="font-semibold">Keywords:</strong> ${escapeHtml(kwText)}
    </span>
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
      <strong class="font-semibold">Region:</strong> ${escapeHtml(regText)}
    </span>
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
      <strong class="font-sans font-semibold">CPV:</strong> ${escapeHtml(cpvText)}
    </span>
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-50 text-violet-800 border border-violet-200/80 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800">
      <strong class="font-semibold">Portals:</strong> ${state.activeSources.size} / 4 active
    </span>
  `;

  const ts = new Date(report.query.timestamp);
  lastScanTimestamp.textContent = `Updated: ${ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
}

function renderPortalCards(report) {
  const portalOrder = ['LUXEMBOURG_PORTAL', 'TED', 'TENDOLIO', 'EU_TENDERS'];
  const kwQuery = encodeURIComponent(state.keywords.trim() || 'Informatique IT Software');

  portalCardsContainer.innerHTML = portalOrder
    .map((sourceId) => {
      const meta = state.portalsMetadata[sourceId] || {
        name: sourceId,
        shortName: sourceId,
        description: '',
        searchUrlTemplate: '#'
      };
      const style = SOURCE_STYLES[sourceId];
      const count = report.summary?.bySource?.[sourceId] ?? 0;
      const isSelected = state.activeSources.has(sourceId);
      const directSearchUrl = (meta.searchUrlTemplate || '#').replace('{query}', kwQuery);

      return `
        <div
          data-portal-id="${sourceId}"
          class="portal-card group relative rounded-2xl bg-white dark:bg-slate-900 p-4 border transition cursor-pointer select-none ${
            style.cardAccent
          } ${
            isSelected
              ? 'border-slate-200/90 dark:border-slate-800 shadow-sm ring-1 ring-blue-500/20'
              : 'border-slate-200/40 dark:border-slate-800/40 opacity-55 hover:opacity-90'
          }"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style.badgeBg}">
                <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
                ${escapeHtml(meta.shortName)}
              </span>
              <h3 class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2 line-clamp-1">
                ${escapeHtml(meta.name)}
              </h3>
            </div>
            <span class="font-display text-2xl font-extrabold text-[#1e293b] dark:text-white">
              ${count}
            </span>
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            ${escapeHtml(meta.description)}
          </p>
          <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span class="font-medium ${isSelected ? 'text-blue-600 dark:text-[#5fd4fd]' : 'text-slate-400'}">
              ${isSelected ? '✓ Filter Enabled' : 'Click to Enable'}
            </span>
            <a
              href="${escapeHtml(directSearchUrl)}"
              target="_blank"
              rel="noopener noreferrer"
              onclick="event.stopPropagation()"
              class="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-[#5fd4fd] transition"
              title="Open live search on ${escapeHtml(meta.shortName)}"
            >
              <span>Live Portal</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      `;
    })
    .join('');

  document.querySelectorAll('.portal-card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-portal-id');
      if (!id) return;
      if (state.activeSources.has(id) && state.activeSources.size > 1) {
        state.activeSources.delete(id);
      } else {
        state.activeSources.add(id);
      }
      fetchTenders();
    });
  });
}

function getSortedTenders(tenders) {
  const copy = [...tenders];
  switch (state.sortBy) {
    case 'deadline_asc':
      return copy.sort((a, b) => a.deadlineDate.localeCompare(b.deadlineDate));
    case 'published_desc':
      return copy.sort((a, b) => b.publishedDate.localeCompare(a.publishedDate));
    case 'source':
      return copy.sort((a, b) => a.sourceLabel.localeCompare(b.sourceLabel));
    default:
      return copy.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));
  }
}

function renderTenders(report) {
  const sorted = getSortedTenders(report.tenders || []);
  resultsCountBadge.textContent = `${sorted.length} ${sorted.length === 1 ? 'tender' : 'tenders'}`;

  // Desktop Table Rows
  tendersTableBody.innerHTML = sorted
    .map((tender) => {
      const style = SOURCE_STYLES[tender.source] || SOURCE_STYLES.TED;
      const isClosingSoon = tender.status === 'Closing Soon';

      return `
        <tr class="zebra-row transition-colors">
          <!-- Primary Column: Tender Title, Buyer, CPVs -->
          <td class="py-4 px-6 align-top">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Ref: ${escapeHtml(tender.referenceNumber)}
              </span>
              ${
                tender.estimatedValue
                  ? `<span class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">Est. ${escapeHtml(tender.estimatedValue)}</span>`
                  : ''
              }
              ${
                tender.isLiveResult
                  ? `<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">Live API</span>`
                  : ''
              }
            </div>

            <button
              type="button"
              data-tender-id="${escapeHtml(tender.id)}"
              class="btn-open-detail text-left font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-[#5fd4fd] transition leading-snug block"
            >
              ${escapeHtml(tender.title)}
            </button>

            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              ${escapeHtml(tender.buyer)}
            </div>

            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              ${tender.cpvCodes
                .map(
                  (cpv) => `
                <span class="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                  CPV ${escapeHtml(cpv)}
                </span>`
                )
                .join('')}
              ${tender.tags
                .slice(0, 4)
                .map(
                  (tag) => `
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-50/70 dark:bg-slate-800 text-blue-700 dark:text-slate-300">
                  #${escapeHtml(tag)}
                </span>`
                )
                .join('')}
            </div>
          </td>

          <!-- Secondary Column: Source Badge -->
          <td class="py-4 px-4 align-top">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${style.badgeBg}">
              <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
              ${escapeHtml(style.shortLabel)}
            </span>
            <div class="text-[11px] text-slate-400 mt-1.5">
              ${escapeHtml(tender.procedureType)}
            </div>
          </td>

          <!-- Secondary Column: Region -->
          <td class="py-4 px-4 align-top">
            <div class="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                ${escapeHtml(tender.countryCode)}
              </span>
              <span>${escapeHtml(tender.region)}</span>
            </div>
          </td>

          <!-- Deadline Column -->
          <td class="py-4 px-4 align-top">
            <div class="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
              ${escapeHtml(tender.deadlineDate)}
            </div>
            <span class="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
              isClosingSoon
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
            }">
              ${escapeHtml(tender.status)}
            </span>
          </td>

          <!-- Action / Link Column -->
          <td class="py-4 px-6 align-top text-right">
            <div class="inline-flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
              <button
                type="button"
                data-tender-id="${escapeHtml(tender.id)}"
                class="btn-open-detail inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <span>View Details</span>
              </button>
              <a
                href="${escapeHtml(tender.link)}"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3b82f6] hover:bg-blue-700 text-white shadow-xs transition"
                title="Open Notice on Official Portal"
              >
                <span>Portal</span>
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  // Mobile Stacked Cards
  tendersMobileCards.innerHTML = sorted
    .map((tender) => {
      const style = SOURCE_STYLES[tender.source] || SOURCE_STYLES.TED;
      return `
        <div class="p-4 space-y-2.5">
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badgeBg}">
              <span class="w-1.5 h-1.5 rounded-full ${style.dot}"></span>
              ${escapeHtml(style.shortLabel)}
            </span>
            <span class="font-mono text-xs text-slate-500">Due: ${escapeHtml(tender.deadlineDate)}</span>
          </div>
          <h3 class="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
            ${escapeHtml(tender.title)}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">${escapeHtml(tender.buyer)}</p>
          <div class="flex items-center justify-between pt-2">
            <span class="text-xs font-medium text-slate-600 dark:text-slate-300">${escapeHtml(tender.region)}</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                data-tender-id="${escapeHtml(tender.id)}"
                class="btn-open-detail px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                View Details
              </button>
              <a
                href="${escapeHtml(tender.link)}"
                target="_blank"
                rel="noopener noreferrer"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3b82f6] text-white"
              >
                Portal &rarr;
              </a>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Bind View Details buttons
  document.querySelectorAll('.btn-open-detail').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-tender-id');
      const tender = sorted.find((t) => t.id === id);
      if (tender) openTenderDetailModal(tender);
    });
  });
}

function renderCpvDirectory() {
  cpvDirectoryGrid.innerHTML = state.cpvDirectory
    .map(
      (item) => `
      <button
        type="button"
        data-cpv-code="${escapeHtml(item.code)}"
        class="cpv-pill-btn text-left p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500 dark:hover:border-[#3bb8e0] bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/40 transition group cursor-pointer"
      >
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-xs font-bold text-blue-600 dark:text-[#5fd4fd] group-hover:underline">
            CPV ${escapeHtml(item.code)}
          </span>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            ${escapeHtml(item.category)}
          </span>
        </div>
        <div class="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-1">
          ${escapeHtml(item.labelFr)}
        </div>
        <div class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
          ${escapeHtml(item.labelEn)}
        </div>
      </button>
    `
    )
    .join('');

  document.querySelectorAll('.cpv-pill-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-cpv-code') || '';
      state.selectedCpv = code;
      // Add option to selectCpv if not present
      if (!Array.from(selectCpv.options).some((o) => o.value === code)) {
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = `${code}`;
        selectCpv.appendChild(opt);
      }
      selectCpv.value = code;
      fetchTenders();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function openTenderDetailModal(tender) {
  document.getElementById('modalSourceBadge').textContent = tender.sourceLabel;
  document.getElementById('modalRefNumber').textContent = `Ref: ${tender.referenceNumber} • Published: ${tender.publishedDate}`;
  document.getElementById('modalTitle').textContent = tender.title;
  document.getElementById('modalBuyer').textContent = tender.buyer;
  document.getElementById('modalDescription').textContent = tender.description;
  document.getElementById('modalRegion').textContent = tender.region;
  document.getElementById('modalDeadline').textContent = `${tender.deadlineDate} (${tender.status})`;
  document.getElementById('modalValue').textContent = tender.estimatedValue || 'Not specified (Open Call)';

  const tagsEl = document.getElementById('modalTags');
  tagsEl.innerHTML = [
    ...tender.cpvCodes.map(
      (c) => `<span class="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">CPV ${escapeHtml(c)}</span>`
    ),
    ...tender.tags.map(
      (t) => `<span class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">#${escapeHtml(t)}</span>`
    )
  ].join('');

  document.getElementById('modalDirectLink').href = tender.link;
  document.getElementById('modalPortalSearchLink').href = tender.portalSearchLink || tender.link;

  tenderDetailModal.classList.remove('hidden');
  tenderDetailModal.classList.add('flex');
}

// Event Listeners
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  state.keywords = inputKeywords.value;
  state.regionFilter = inputRegion.value;
  state.selectedCpv = selectCpv.value;
  fetchTenders();
});

selectCpv.addEventListener('change', () => {
  state.selectedCpv = selectCpv.value;
  fetchTenders();
});

sortSelect.addEventListener('change', () => {
  state.sortBy = sortSelect.value;
  if (state.currentReport) {
    renderTenders(state.currentReport);
  }
});

btnResetFilters.addEventListener('click', () => {
  inputKeywords.value = '';
  inputRegion.value = '';
  selectCpv.value = '';
  state.keywords = '';
  state.regionFilter = '';
  state.selectedCpv = '';
  state.activeSources = new Set(['LUXEMBOURG_PORTAL', 'TED', 'TENDOLIO', 'EU_TENDERS']);
  fetchTenders();
});

document.querySelectorAll('.preset-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const kw = btn.getAttribute('data-preset-kw') || '';
    const reg = btn.getAttribute('data-preset-reg') || '';
    inputKeywords.value = kw;
    inputRegion.value = reg;
    state.keywords = kw;
    state.regionFilter = reg;
    fetchTenders();
  });
});

btnCloseDetailModal.addEventListener('click', () => {
  tenderDetailModal.classList.add('hidden');
  tenderDetailModal.classList.remove('flex');
});

tenderDetailModal.addEventListener('click', (e) => {
  if (e.target === tenderDetailModal) {
    tenderDetailModal.classList.add('hidden');
    tenderDetailModal.classList.remove('flex');
  }
});

btnOpalWorkflow.addEventListener('click', () => {
  opalMarkdownOutput.textContent = state.currentReport?.markdownTable || 'No report generated yet.';
  opalWorkflowModal.classList.remove('hidden');
  opalWorkflowModal.classList.add('flex');
});

btnCloseOpalModal.addEventListener('click', () => {
  opalWorkflowModal.classList.add('hidden');
  opalWorkflowModal.classList.remove('flex');
});

opalWorkflowModal.addEventListener('click', (e) => {
  if (e.target === opalWorkflowModal) {
    opalWorkflowModal.classList.add('hidden');
    opalWorkflowModal.classList.remove('flex');
  }
});

btnCopyMarkdown.addEventListener('click', async () => {
  const md = state.currentReport?.markdownTable || '';
  await navigator.clipboard.writeText(md);
  const original = btnCopyMarkdown.textContent;
  btnCopyMarkdown.textContent = '✓ Copied to Clipboard!';
  setTimeout(() => {
    btnCopyMarkdown.textContent = original;
  }, 1800);
});

btnExportCsv.addEventListener('click', () => {
  const tenders = state.currentReport?.tenders || [];
  if (!tenders.length) return;

  const headers = ['Reference', 'Tender Title', 'Source', 'Buyer', 'Region', 'CPV Codes', 'Deadline', 'Estimated Value', 'Link'];
  const csvRows = [
    headers.join(','),
    ...tenders.map((t) =>
      [
        t.referenceNumber,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${t.sourceLabel}"`,
        `"${t.buyer.replace(/"/g, '""')}"`,
        `"${t.region}"`,
        `"${t.cpvCodes.join('; ')}"`,
        t.deadlineDate,
        `"${t.estimatedValue || ''}"`,
        `"${t.link}"`
      ].join(',')
    )
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tenderscan-it-procurement-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

btnThemeToggle.addEventListener('click', () => {
  const html = document.documentElement;
  html.classList.toggle('dark');
  const isDark = html.classList.contains('dark');
  iconSun.classList.toggle('hidden', !isDark);
  iconMoon.classList.toggle('hidden', isDark);
});

// Initialize Application
(async () => {
  await loadMetadata();
  await fetchTenders();
})();

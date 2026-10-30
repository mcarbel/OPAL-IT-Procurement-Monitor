import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gatherTenderReport } from './services/aggregator.ts';
import { IT_CPV_CODES, PORTALS } from './data/cpvCodes.ts';
import type { PortalSourceId } from './types/tender.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const WORKFLOW_PATH = path.resolve(__dirname, '../opal-workflow.json');

const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

function sendJson(res: http.ServerResponse, statusCode: number, payload: unknown): void {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function parseJsonBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

export const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = reqUrl.pathname;

    // 1. Metadata Endpoint (Portals & CPV Codes)
    if (pathname === '/api/metadata' && req.method === 'GET') {
      sendJson(res, 200, {
        title: 'TenderScan — IT Procurement Monitor',
        version: '0.0.1',
        portals: PORTALS,
        cpvCodes: IT_CPV_CODES
      });
      return;
    }

    // 2. Opal Workflow Specification Endpoint
    if (pathname === '/api/opal-workflow' && req.method === 'GET') {
      const content = await fs.readFile(WORKFLOW_PATH, 'utf-8');
      sendJson(res, 200, JSON.parse(content));
      return;
    }

    // 3. GET /api/tenders
    if (pathname === '/api/tenders' && req.method === 'GET') {
      const keywords = reqUrl.searchParams.get('keywords') || '';
      const regionFilter = reqUrl.searchParams.get('region') || '';
      const cpvParam = reqUrl.searchParams.get('cpv') || '';
      const sourcesParam = reqUrl.searchParams.get('sources') || '';
      const liveParam = reqUrl.searchParams.get('live');

      const cpvCodes = cpvParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const sources = sourcesParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean) as PortalSourceId[];

      const report = await gatherTenderReport({
        keywords,
        regionFilter,
        cpvCodes: cpvCodes.length > 0 ? cpvCodes : undefined,
        sources: sources.length > 0 ? sources : undefined,
        includeLiveFetch: liveParam !== 'false'
      });

      sendJson(res, 200, report);
      return;
    }

    // 4. POST /api/search (Opal node_step_tender_data_report execution endpoint)
    if (pathname === '/api/search' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const keywords = String(body.keywords ?? body.ask_user_keywords ?? '');
      const regionFilter = String(body.regionFilter ?? body.ask_user_region_filter ?? '');
      const cpvCodes = Array.isArray(body.cpvCodes)
        ? body.cpvCodes.map(String)
        : undefined;
      const sources = Array.isArray(body.sources)
        ? (body.sources.map(String) as PortalSourceId[])
        : undefined;

      const report = await gatherTenderReport({
        keywords,
        regionFilter,
        cpvCodes,
        sources,
        includeLiveFetch: body.includeLiveFetch !== false
      });

      sendJson(res, 200, report);
      return;
    }

    // 5. Static Frontend Serving
    const safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC_DIR, path.normalize(safePath));

    if (!filePath.startsWith(PUBLIC_DIR)) {
      sendJson(res, 403, { error: 'Forbidden' });
      return;
    }

    try {
      const stat = await fs.stat(filePath);
      if (stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const content = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
    } catch {
      // Fallback to index.html for SPA routes
      const indexHtml = await fs.readFile(path.join(PUBLIC_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
      return;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    sendJson(res, 500, { error: message });
  }
});

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`\n🚀 TenderScan — IT Procurement Monitor running at http://localhost:${PORT}`);
    console.log(`   ├─ Dashboard UI:      http://localhost:${PORT}`);
    console.log(`   ├─ Tenders REST API:  http://localhost:${PORT}/api/tenders?keywords=Cloud&region=Luxembourg`);
    console.log(`   ├─ Opal Search Node:  POST http://localhost:${PORT}/api/search`);
    console.log(`   └─ Opal Workflow:     http://localhost:${PORT}/api/opal-workflow\n`);
  });
}

# TenderScan — IT Procurement Monitor

Centralize and monitor your IT tender opportunities across major European and Luxembourg public procurement portals, built from the **TenderScan (`0.0.1`)** Opal specification.

---

## Connected Procurement Portals

1. **Marchés Publics du Luxembourg** (`pmp.b2g.etat.lu`) — Portail officiel national des marchés publics du Grand-Duché de Luxembourg.
2. **TED — Tenders Electronic Daily** (`ted.europa.eu`) — Supplément au Journal officiel de l’Union européenne dédié aux marchés publics européens (with live TED Search API v3 integration + curated fallback).
3. **Tendolio — Informatique Luxembourg** (`tendolio.com`) — Sélection sectorielle spécialisée dans les appels d’offres IT, logiciels et transformation digitale au Luxembourg et en Grande Région.
4. **EU Tenders — Services Informatiques (CPV)** (`simap.ted.europa.eu`) — Appels d’offres européens filtrés par code CPV (Division `72000000-5` Services IT, `48000000-8` Logiciels & Systèmes d’Information, `30200000-1` Matériel Informatique).

---

## Opal Workflow Architecture

| Opal Node ID | Title | Implementation |
| :--- | :--- | :--- |
| `ask_user_keywords` | **Keywords** | Interactive search input + technical presets (`Cloud`, `Kubernetes`, `Cybersecurity`, `Java`, `AI`, `SAP`, etc.) |
| `ask_user_region_filter` | **Region Filter** | Geographic region/country filter (`Luxembourg`, `European Union`, `Belgium`, `France Grand Est`, `Germany`) |
| `node_step_tender_data_report` | **Gather Tender Information** | Multi-portal aggregator (`src/services/aggregator.ts`) + REST endpoints (`GET /api/tenders`, `POST /api/search`) producing structured JSON & Markdown tables |
| `node_step_tender_dashboard` | **Generate Tender Dashboard** | Responsive "Premium Corporate Tech" dashboard (`public/index.html`, `public/app.js`) with metadata breadcrumbs, source badges, CPV filter directory, CSV export, and Opal Markdown output viewer |

---

## Getting Started

### Prerequisites
- **Node.js** `>= 22.6.0` (runs TypeScript natively with zero build step required)

### Run the Application
```bash
npm start
```
Then open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Development Mode (Auto-Reload)
```bash
npm run dev
```

### Run Verification Tests
```bash
npm test
```

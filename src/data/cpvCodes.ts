import type { CpvCodeInfo, PortalMetadata, PortalSourceId } from '../types/tender.ts';

export const PORTALS: Record<PortalSourceId, PortalMetadata> = {
  LUXEMBOURG_PORTAL: {
    id: 'LUXEMBOURG_PORTAL',
    name: 'Marchés Publics du Luxembourg',
    shortName: 'Luxembourg Portal',
    description: 'Portail officiel national des marchés publics du Grand-Duché de Luxembourg (pmp.b2g.etat.lu).',
    baseUrl: 'https://pmp.b2g.etat.lu',
    searchUrlTemplate: 'https://pmp.b2g.etat.lu/?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons&keyWord={query}',
    badgeColor: 'emerald',
    regionFocus: 'Luxembourg (LU)'
  },
  TED: {
    id: 'TED',
    name: 'TED — Tenders Electronic Daily',
    shortName: 'TED Europe',
    description: 'Supplément au Journal officiel de l’Union européenne dédié aux marchés publics européens.',
    baseUrl: 'https://ted.europa.eu',
    searchUrlTemplate: 'https://ted.europa.eu/en/search/result?FT={query}',
    badgeColor: 'blue',
    regionFocus: 'European Union (EU / EEA)'
  },
  TENDOLIO: {
    id: 'TENDOLIO',
    name: 'Tendolio — Informatique Luxembourg',
    shortName: 'Tendolio IT',
    description: 'Sélection sectorielle spécialisée dans les appels d’offres IT, logiciels et transformation digitale au Luxembourg et Grande Région.',
    baseUrl: 'https://www.tendolio.com',
    searchUrlTemplate: 'https://ted.europa.eu/en/search/result?FT={query}+LUX',
    badgeColor: 'violet',
    regionFocus: 'Luxembourg & Greater Region'
  },
  EU_TENDERS: {
    id: 'EU_TENDERS',
    name: 'EU Tenders — Services Informatiques (CPV)',
    shortName: 'EU Tenders (CPV)',
    description: 'Agrégation européenne d’appels d’offres filtrés par nomenclature CPV (Division 72 & 48 — Services IT et Logiciels).',
    baseUrl: 'https://simap.ted.europa.eu',
    searchUrlTemplate: 'https://ted.europa.eu/en/search/result?classification-cpv=72000000&FT={query}',
    badgeColor: 'amber',
    regionFocus: 'Pan-European (CPV 72/48)'
  }
};

export const IT_CPV_CODES: CpvCodeInfo[] = [
  {
    code: '72000000-5',
    labelFr: 'Services de technologies de l’information: conseil, développement de logiciels, Internet et appui',
    labelEn: 'IT services: consulting, software development, Internet and support',
    category: 'IT Services'
  },
  {
    code: '72200000-7',
    labelFr: 'Services de programmation de logiciels et de conseil',
    labelEn: 'Software programming and consultancy services',
    category: 'IT Services'
  },
  {
    code: '72212000-4',
    labelFr: 'Services de programmation de logiciels d’application',
    labelEn: 'Programming services of application software',
    category: 'Software'
  },
  {
    code: '72220000-3',
    labelFr: 'Services de conseil en systèmes informatiques et en assistance technique',
    labelEn: 'Systems and technical consultancy services',
    category: 'IT Services'
  },
  {
    code: '72260000-5',
    labelFr: 'Services relatifs aux logiciels (développement, maintenance, tests)',
    labelEn: 'Software-related services (development, maintenance, testing)',
    category: 'Software'
  },
  {
    code: '72300000-8',
    labelFr: 'Services de données, hébergement, IA et Big Data',
    labelEn: 'Data services, hosting, AI and Big Data processing',
    category: 'Cloud & Security'
  },
  {
    code: '72317000-0',
    labelFr: 'Services de stockage de données et Cloud Computing',
    labelEn: 'Data storage and Cloud Computing services',
    category: 'Cloud & Security'
  },
  {
    code: '72400000-4',
    labelFr: 'Services Internet, portails web et plateformes numériques',
    labelEn: 'Internet services, web portals and digital platforms',
    category: 'IT Services'
  },
  {
    code: '72500000-0',
    labelFr: 'Services informatiques (gestion d’infrastructures et infogérance)',
    labelEn: 'Computer-related services (infrastructure & managed services)',
    category: 'IT Services'
  },
  {
    code: '72600000-6',
    labelFr: 'Services d’assistance et de conseil informatiques',
    labelEn: 'Computer support and consultancy services',
    category: 'IT Services'
  },
  {
    code: '72800000-8',
    labelFr: 'Services d’audit informatique et d’essais d’ordinateurs (Cybersécurité / SOC)',
    labelEn: 'Computer audit and testing services (Cybersecurity / Pentesting)',
    category: 'Cloud & Security'
  },
  {
    code: '48000000-8',
    labelFr: 'Logiciels et systèmes d’information (progiciels, licences, ERP/CRM)',
    labelEn: 'Software package and information systems (ERP, CRM, licenses)',
    category: 'Software'
  },
  {
    code: '48730000-4',
    labelFr: 'Logiciels de sécurité (SIEM, IAM, EDR, pare-feu)',
    labelEn: 'Security software package (SIEM, IAM, EDR, firewall)',
    category: 'Cloud & Security'
  },
  {
    code: '30200000-1',
    labelFr: 'Matériel et fournitures informatiques (serveurs, postes de travail, réseaux)',
    labelEn: 'Computer equipment and supplies (servers, workstations, network)',
    category: 'Hardware & Telecom'
  }
];

export type PortalSourceId =
  | 'LUXEMBOURG_PORTAL'
  | 'TED'
  | 'TENDOLIO'
  | 'EU_TENDERS';

export interface PortalMetadata {
  id: PortalSourceId;
  name: string;
  shortName: string;
  description: string;
  baseUrl: string;
  searchUrlTemplate: string;
  badgeColor: string;
  regionFocus: string;
}

export interface CpvCodeInfo {
  code: string;
  labelFr: string;
  labelEn: string;
  category: 'IT Services' | 'Software' | 'Hardware & Telecom' | 'Cloud & Security';
}

export interface TenderItem {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  buyer: string;
  source: PortalSourceId;
  sourceLabel: string;
  region: string;
  countryCode: string;
  nutsCode?: string;
  cpvCodes: string[];
  publishedDate: string;
  deadlineDate: string;
  estimatedValue?: string;
  currency?: string;
  procedureType: string;
  status: 'Active' | 'Closing Soon' | 'Open';
  link: string;
  portalSearchLink: string;
  tags: string[];
  isLiveResult?: boolean;
  relevanceScore?: number;
}

export interface SearchParameters {
  keywords: string;
  regionFilter: string;
  cpvCodes?: string[];
  sources?: PortalSourceId[];
  includeLiveFetch?: boolean;
}

export interface PortalFetchResult {
  source: PortalSourceId;
  status: 'live' | 'curated_fallback' | 'error';
  count: number;
  latencyMs: number;
  message?: string;
  tenders: TenderItem[];
}

export interface AggregatedTenderReport {
  query: {
    keywords: string;
    regionFilter: string;
    appliedCpvCodes: string[];
    appliedSources: PortalSourceId[];
    timestamp: string;
  };
  summary: {
    totalTenders: number;
    bySource: Record<PortalSourceId, number>;
    closingSoonCount: number;
  };
  portalStatuses: Omit<PortalFetchResult, 'tenders'>[];
  tenders: TenderItem[];
  markdownTable: string;
}

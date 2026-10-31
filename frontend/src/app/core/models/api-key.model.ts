export type ApiKeyEnv = 'production' | 'staging';
export type ApiKeyExpiryStatus = 'ok' | 'warning' | 'never';

export interface ApiKeyKpis {
    activeKeys: { value: string; delta: string; breakdown: string };
    dailyRequests: { value: string; sub: string; sparkline: number[] };
    expiring: { value: string; status: string; nextExpiry: string };
    successRate: { value: string; slaTarget: string; percent: number };
}

export interface ApiKeyRow {
    id: string;
    serviceName: string;
    serviceId: string;
    icon: string;
    iconColor: 'primary' | 'secondary' | 'outline';
    keyPrefix: string;
    keyFullPrefix: string;
    environment: ApiKeyEnv;
    scopes: string[];
    scopesOverflow?: number;
    lastUsedRelative: string;
    lastUsedIp: string;
    expiryStatus: ApiKeyExpiryStatus;
    expiryLabel: string;
}

export interface LiveLogEntry {
    timestamp: string;
    eventType: 'AUTH_GRANTED' | 'CACHE_HIT' | 'AUTH_DENIED';
    keyId: string;
    service: string;
    ip: string;
    action: string;
    result: string;
}

export interface ApiKeysOverview {
    kpis: ApiKeyKpis;
    keys: ApiKeyRow[];
    liveLogs: LiveLogEntry[];
}
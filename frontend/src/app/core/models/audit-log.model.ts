export type AuditSeverity = 'critical' | 'warning' | 'info';
export type AuditStatus = 'success' | 'failed' | 'blocked';
export type AuditEventType =
    | 'anomaly.ip_blocked'
    | 'role.permission_changed'
    | 'api_key.rotated'
    | 'user.password_reset'
    | 'login.success';

export type ActorType = 'system_agent' | 'user' | 'service' | 'root';

export interface AuditActor {
    type: ActorType;
    initials: string;
    initialsBg: 'primary' | 'secondary' | 'error' | 'neutral';
    name: string;
    subLabel: string;
    isError?: boolean;
}

export interface AuditGeo {
    city: string;
    country: string;
    flag: string;
    networkType: string;
    isError?: boolean;
}

export interface AuditTarget {
    primary: string;
    secondary: string;
    isError?: boolean;
}

export interface AuditDetail {
    merkleLeafIndex: number;
    hmacPayload: string;
    prevMerkleRoot: string;
    asn: string;
    ja3: string;
    tlsVersion: string;
    requestId: string;
    policy: string;
    trigger: string;
    blacklistTtl: string;
    receptorNotified: string;
    rawJson: string;
}

export interface AuditLog {
    id: string;
    timestamp: string;
    relativeTime: string;
    severity: AuditSeverity;
    eventType: AuditEventType;
    actor: AuditActor;
    geo: AuditGeo;
    target: AuditTarget;
    status: AuditStatus;
    statusLabel: string;
    statusIcon: string;
    detail: AuditDetail;
    isExpanded?: boolean;
}

export interface AuditKpi {
    id: string;
    label: string;
    value: string;
    delta: string;
    deltaStyle: 'success' | 'error' | 'warning' | 'neutral';
    icon: string;
    iconColor: 'primary' | 'error' | 'tertiary-container' | 'secondary';
    progress: number;
    progressColor: 'primary' | 'error' | 'tertiary-container' | 'secondary-container';
}

export interface AuditQuickFilter {
    id: string;
    label: string;
    query: string;
    isCritical: boolean;
}

export interface AuditLogsOverview {
    kpis: AuditKpi[];
    logs: AuditLog[];
    quickFilters: AuditQuickFilter[];
}
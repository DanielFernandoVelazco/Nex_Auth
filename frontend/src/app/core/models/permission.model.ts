export type PermissionCriticality = 'low' | 'medium' | 'high';

export type ResourceServerId = 'USER_MGMT' | 'BILLING' | 'AUDIT' | 'AUTH_CORE';

export type ResourceServerIconColor = 'primary' | 'secondary' | 'tertiary' | 'outline';

export interface ResourceFilter {
    id: 'ALL' | ResourceServerId;
    label: string;
    count: number;
}

export interface Permission {
    id: string;
    scopeIdentifier: string;         // 'users:read'
    urnIdentifier: string;           // 'urn:nexauth:scope:users.profile.read'
    resourceServerId: ResourceServerId;
    resourceServerLabel: string;     // 'User Management API'
    resourceServerMeta: string;      // 'v2.4 · Cluster US-East'
    resourceServerIcon: string;
    resourceServerIconColor: ResourceServerIconColor;
    consentDescription: string;
    consentPrompt?: string;          // Texto que ve el usuario
    criticality: PermissionCriticality;
    requiresStepUp?: boolean;
    requiresElevation?: boolean;
    requiresDoubleApproval?: boolean;
    consumers: {
        rolesCount: number;
        appsCount: number;
    };
}

export interface PermissionKpi {
    id: string;
    label: string;
    value: string;
    deltaLabel: string;
    deltaStyle: 'success' | 'danger' | 'neutral' | 'warning';
    icon: string;
    iconColor: 'primary' | 'secondary' | 'tertiary' | 'error';
    footer: string;
}

export interface RiskDistribution {
    lowPct: number;
    mediumPct: number;
    highPct: number;
}

export interface ZeroTrustPolicy {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
}

export interface PermissionsOverview {
    kpis: PermissionKpi[];
    riskDistribution: RiskDistribution;
    permissions: Permission[];
    jwtPreviewJson: string;
    jwtKid: string;
    policies: ZeroTrustPolicy[];
}
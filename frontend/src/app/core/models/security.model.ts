export type SecurityKpiColor = 'primary' | 'secondary' | 'tertiary' | 'error';

export interface SecurityKpi {
    id: string;
    label: string;
    value: string;
    delta: string;
    deltaIcon: string;
    deltaStyle: 'success' | 'warning' | 'primary';
    icon: string;
    iconColor: SecurityKpiColor;
}

// ─── Social Connections ─────────────────────────────────
export interface SocialConnection {
    id: string;
    name: string;
    identifier: string;
    icon: string;               // 'google' | 'github' | 'azure' | 'apple'
    enabled: boolean;
    enabledLabel: string;

    infoLabel: string;          // 'Client ID' | 'Scopes Requeridos' | 'Tenant Mode'
    infoValue: string;
    infoMasked?: boolean;
    scopes?: string[];
    warningText?: string;       // rojo

    footerLabel?: string;
    footerValue?: string;
    footerValueColor?: 'success' | 'neutral' | 'error';

    isDisabledStyle?: boolean;  // opacidad reducida
}

// ─── DB & Passwordless ─────────────────────────────────
export interface DbConnection {
    id: string;
    name: string;
    icon: string;
    iconColor: 'primary' | 'secondary';
    algorithmBadge: string;
    userCount: string;
    features: { id: string; label: string; enabled: boolean }[];
}

export interface PasswordlessRoute {
    id: string;
    name: string;
    icon: string;
    iconColor: 'secondary';
    ttlBadge: string;
    enabled: boolean;
    features: string[];
}

// ─── Enterprise SSO ────────────────────────────────────
export interface EnterpriseSso {
    id: string;
    initials: string;
    initialsColor: 'primary' | 'tertiary';
    name: string;
    identifier: string;
    metaLabel: string;
    metaValue: string;
    statusLabel: string;
}

// ─── MFA ───────────────────────────────────────────────
export type MfaPolicyId = 'disabled' | 'optional' | 'admins-only' | 'required';

export interface MfaPolicyOption {
    id: MfaPolicyId;
    label: string;
    description: string;
}

export type MfaFactorIconColor = 'primary' | 'secondary' | 'tertiary' | 'error';
export type MfaFactorBadgeStyle = 'success' | 'danger' | 'neutral';

export interface MfaFactor {
    id: string;
    name: string;
    icon: string;
    iconColor: MfaFactorIconColor;
    badgeLabel: string;
    badgeStyle: MfaFactorBadgeStyle;
    description: string;
    infoLabel: string;
    infoValue: string;
    infoStatus: 'ok' | 'warning';
    enabledLabel: string;
    enabledLabelColor: 'success' | 'neutral' | 'primary';
    enabled: boolean;
    isRecovery?: boolean;
}

// ─── Threats ───────────────────────────────────────────
export interface ThreatCard {
    id: string;
    icon: string;
    iconColor: 'error' | 'primary' | 'secondary';
    title: string;
    description: string;
    actionLabel: string;
    actionValue: string;
    thresholdLabel?: string;
    thresholdValue?: string;
    thresholdHighlight?: string;
    footerLabel: string;
    footerValue: string;
    footerValueColor: 'success' | 'neutral' | 'error';
    enabled: boolean;
}

// ─── Root ──────────────────────────────────────────────
export interface SecurityOverview {
    kpis: SecurityKpi[];
    socialConnections: SocialConnection[];
    dbConnections: DbConnection[];
    passwordlessRoutes: PasswordlessRoute[];
    enterpriseSso: EnterpriseSso[];
    mfaPolicies: MfaPolicyOption[];
    activeMfaPolicyId: MfaPolicyId;
    mfaFactors: MfaFactor[];
    threats: ThreatCard[];
}
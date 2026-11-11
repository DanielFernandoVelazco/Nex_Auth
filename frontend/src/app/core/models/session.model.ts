export type SessionRiskLevel = 'low' | 'medium' | 'high';

export interface SessionKpi {
    id: string;
    label: string;
    value: string;
    delta: string;
    deltaStyle: 'success' | 'danger' | 'neutral' | 'primary';
    icon: string;
    iconColor: 'primary' | 'secondary' | 'tertiary' | 'error';
    footer: string;
    footerHighlight?: string;
    progress?: number;
    progressColor?: 'tertiary' | 'secondary-container' | 'error' | 'tertiary-container';
}

export interface SessionJwt {
    iss: string;
    sub: string;
    aud: string;
    exp: number;
    iat: number;
    amr: string[];
    jti: string;
    scope: string;
    algorithm: string;
    ttlLabel: string;
}

export interface SessionRow {
    id: string;
    userName: string;
    userEmail: string;
    userInitials: string;
    avatarBg: 'primary' | 'secondary' | 'error';
    online: boolean;

    device: { browser: string; os: string; icon: string };

    geo: {
        flag: string;
        city: string;
        country: string;
        ip: string;
        networkType: string;
        isAnomaly: boolean;
    };

    authMethod: { icon: string; label: string; iconColor: 'primary' | 'secondary' | 'tertiary' };

    refreshGrantPrefix: string;

    lastActivity: {
        relative: string;
        endpoint: string;
        isCritical?: boolean;
    };

    riskLevel: SessionRiskLevel;
    riskScore: number;

    jwt: SessionJwt;
}

export interface SessionsOverview {
    kpis: SessionKpi[];
    sessions: SessionRow[];
}
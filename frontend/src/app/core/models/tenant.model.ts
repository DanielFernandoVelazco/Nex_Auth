export type EmailProvider = 'resend' | 'ses' | 'sendgrid';

export type EmailTemplateId = 'otp' | 'welcome' | 'reset';

export interface EmailTemplate {
    id: EmailTemplateId;
    label: string;
    icon: string;
    title: string;
    description: string;
    ctaLabel: string;
}

export interface DnsVerification {
    id: string;
    label: string;
    status: 'validated' | 'warning';
    statusLabel: string;
}

export interface EmailProviderOption {
    id: EmailProvider;
    label: string;
    icon: string;
}

export interface TenantIdentity {
    organizationName: string;
    tenantId: string;
    customDomain: string;
    sslStatus: {
        active: boolean;
        label: string;
        expiresOn: string;
    };
}

export interface TenantSession {
    accessTokenTtl: number;        // minutos
    idleTimeout: number;           // minutos
    maxConcurrency: 1 | 3 | 5 | -1;
    backchannelLogout: boolean;
}

export interface TenantEmailConfig {
    provider: EmailProvider;
    senderEmail: string;
    dnsVerifications: DnsVerification[];
    templates: EmailTemplate[];
}

export interface TenantSettings {
    identity: TenantIdentity;
    session: TenantSession;
    email: TenantEmailConfig;
    systemHealth: {
        synced: boolean;
        cluster: string;
        lastSync: string;
    };
}
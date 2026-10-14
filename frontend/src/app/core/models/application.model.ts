export type AppType = 'spa' | 'web' | 'm2m' | 'native';

export type AppStatus = 'active' | 'staging' | 'disabled';

export type AppIconColor = 'primary' | 'secondary' | 'tertiary' | 'outline' | 'primary-container';

export interface Application {
    id: string;
    name: string;
    subtitle: string;         // 'SPA · React / Next.js'
    icon: string;              // material symbol name
    iconColor: AppIconColor;
    clientId: string;
    type: AppType;
    status: AppStatus;
    statusLabel: string;       // 'Activa', 'Staging', 'Deshabilitada'
    isSelected?: boolean;

    // Domain / URL info
    domainLabel: string;       // 'Dominio Principal', 'URI Scheme', 'Scopes Asignados'
    domainValue: string;       // 'https://app.acme.com'
    domainIcon: string;        // 'lock', 'link', 'code'

    // Metrics footer
    metricLabel: string;       // 'Logins (24h)', 'Token Requests'
    metricValue: string;       // '124,400', '1.4M / día'
    metricSecondary?: string;  // 'v3.4.1 client', '99.98%'
    metricSecondaryIcon?: string;
}
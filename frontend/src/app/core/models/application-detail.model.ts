export interface ApplicationDetail {
    id: string;

    // Identity (para el header)
    name: string;
    icon: string;
    clientId: string;
    clientType: string;          // 'SPA OIDC RFC 8252'
    tlsVerified: boolean;
    createdBy: string;           // '@s.alarcon'
    createdAgo: string;          // 'hace 3 meses'

    // Configuración Rápida
    issuerDomain: string;        // 'auth.acme.com'
    issuerSslActive: boolean;
    clientSecret: string;        // 'sec_prod_live_xxx'
    lastRotationDays: number;    // 14

    callbackUrls: string;        // multiline text
    logoutUrls: string;          // multiline text
    corsOrigins: string;         // comma-separated

    accessTokenTtl: number;      // 3600
    refreshTokenTtl: number;     // 2592000
    refreshRotationEnabled: boolean;

    // Métricas del panel derecho
    successRate: number;          // 99.98
    pkceCodeExchanges: number;    // 108200
    refreshTokenGrants: number;   // 16200

    // SDK Quickstart
    sdkSnippets: {
        nodejs: string;
        python: string;
        curl: string;
    };
}
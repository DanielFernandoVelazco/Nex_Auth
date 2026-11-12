import { Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

type CodeLanguage = 'nextjs' | 'nodejs' | 'python' | 'curl';

interface LanguageTab {
    id: CodeLanguage;
    label: string;
}

interface TrustedLogo {
    id: string;
    label: string;
    type: 'vercel' | 'supabase' | 'stripe' | 'linear' | 'fintech';
}

interface BentoFeature {
    id: string;
    icon: string;
    iconColor: 'primary' | 'secondary' | 'error';
    badge: string;
    badgeColor: 'primary' | 'secondary' | 'error';
    title: string;
    description: string;
    span: 'small' | 'large';
    extraType: 'auth' | 'sso' | 'threat' | 'rbac';
}

@Component({
    selector: 'app-landing',
    imports: [RouterLink],
    templateUrl: './landing.html',
    styleUrl: './landing.scss',
})
export class Landing {
    protected readonly activeLang = signal<CodeLanguage>('nextjs');

    protected readonly languages: LanguageTab[] = [
        { id: 'nextjs', label: 'Next.js' },
        { id: 'nodejs', label: 'Node.js' },
        { id: 'python', label: 'Python' },
        { id: 'curl', label: 'cURL' },
    ];

    protected readonly trustedLogos: TrustedLogo[] = [
        { id: 'vercel', label: 'Vercel Core', type: 'vercel' },
        { id: 'supabase', label: 'Supabase', type: 'supabase' },
        { id: 'stripe', label: 'stripe', type: 'stripe' },
        { id: 'linear', label: 'Linear API', type: 'linear' },
        { id: 'fintech', label: 'FinTech Core', type: 'fintech' },
    ];

    protected readonly bentoFeatures: BentoFeature[] = [
        {
            id: 'passkeys',
            icon: 'fingerprint',
            iconColor: 'primary',
            badge: 'Zero Password Surface',
            badgeColor: 'primary',
            title: 'Passkeys & Passwordless FIDO2',
            description: 'Habilita autenticación biométrica FaceID, TouchID y llaves de seguridad físicas YubiKey mediante la API WebAuthn. Elimina el 100% de ataques de phishing y relleno de credenciales.',
            span: 'large',
            extraType: 'auth',
        },
        {
            id: 'sso',
            icon: 'hub',
            iconColor: 'secondary',
            badge: 'Multi-Tenant Ready',
            badgeColor: 'secondary',
            title: 'Federación Enterprise & SSO',
            description: 'Conecta los directorios de tus clientes con un clic: SAML 2.0, Okta, Azure AD, Google Workspace y PingIdentity con aprovisionamiento SCIM 2.0.',
            span: 'small',
            extraType: 'sso',
        },
        {
            id: 'threat',
            icon: 'security',
            iconColor: 'error',
            badge: 'Defensa Adaptativa',
            badgeColor: 'error',
            title: 'Threat Intelligence & Zero Trust',
            description: 'Puntuación de riesgo contextual en milisegundos. Bloqueo automático de IP anónimas Tor/VPN, prevención de fuerza bruta y step-up authentication.',
            span: 'small',
            extraType: 'threat',
        },
        {
            id: 'rbac',
            icon: 'admin_panel_settings',
            iconColor: 'primary',
            badge: 'Fine-Grained Authorization',
            badgeColor: 'primary',
            title: 'Motor RBAC, ReBAC & Scopes Finos',
            description: 'Políticas inspiradas en Google Zanzibar. Aplica modelos de control de acceso basados en roles, atributos (ABAC) o relaciones jerárquicas directas en el token JWT.',
            span: 'large',
            extraType: 'rbac',
        },
    ];

    protected setLang(id: CodeLanguage): void {
        this.activeLang.set(id);
    }

    protected currentSnippet(): string {
        const map: Record<CodeLanguage, string> = {
            nextjs: `import { NexAuth, PasskeyProvider } from "@nexauth/next";

export const { GET, POST } = NexAuth({
  tenantId: process.env.NEXAUTH_TENANT_ID,
  providers: [
    PasskeyProvider({ rpName: "Production Core" }),
    EnterpriseSSO({ enforceMFA: true })
  ],
  sessionPolicy: { rfc9068Compliance: true }
});`,
            nodejs: `import { verifySessionToken } from "@nexauth/node";

app.addHook("onRequest", async (req, res) => {
  const claims = await verifySessionToken(req.headers.authorization);
  if (!claims.hasScope("org:billing:write")) {
    return res.status(403).send({ error: "E_FORBIDDEN" });
  }
});`,
            python: `from nexauth.fastapi import NexAuthSecurity, SecurityClaims

security = NexAuthSecurity(jwks_url="https://auth.company.com/.well-known/jwks.json")

@app.get("/v1/data")
async def get_data(user: SecurityClaims = Depends(security.require_mfa)):
    return {"status": "granted", "user_id": user.sub}`,
            curl: `curl -X POST https://api.nexauth.io/v1/oauth2/introspect \\
  -H "Authorization: Bearer nex_sec_87e2f901a" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "token=eyJhbGciOiJSUzI1NiIsInR5cCI6ImF0K2p3dCJ9..."`,
        };
        return map[this.activeLang()];
    }

    protected copySnippet(): void {
        navigator.clipboard.writeText(this.currentSnippet());
    }
}
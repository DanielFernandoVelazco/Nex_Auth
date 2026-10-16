import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Application, AppType } from '../models/application.model';
import { ApplicationDetail } from '../models/application-detail.model';
import { Kpi } from '../models/kpi.model';
import { RegisterApplicationResult } from '../../features/applications/components/register-application-dialog/register-application-dialog';

interface ApplicationsMockResponse {
    kpis: Kpi[];
    applications: Application[];
    details: Record<string, ApplicationDetail>;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
    private readonly http = inject(HttpClient);

    private readonly _applications = signal<Application[]>([]);
    private readonly _details = signal<Record<string, ApplicationDetail>>({});
    private readonly _kpis = signal<Kpi[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly applications = this._applications.asReadonly();
    readonly kpis = this._kpis.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();

    readonly selectedDetail = computed<ApplicationDetail | null>(() => {
        const id = this._selectedId();
        if (!id) return null;
        return this._details()[id] ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<ApplicationsMockResponse>('/mock/applications.json')
            );
            this._applications.set(data.applications);
            this._kpis.set(data.kpis);
            this._details.set(data.details);

            const preselected = data.applications.find(a => a.isSelected);
            if (preselected) this._selectedId.set(preselected.id);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }

    add(input: RegisterApplicationResult): Application {
        const id = `app-${Date.now()}`;
        const clientId = this.generateClientId(input.type);

        const newApp: Application = {
            id,
            name: input.name,
            subtitle: this.subtitleFor(input.type),
            icon: this.iconFor(input.type),
            iconColor: 'primary',
            clientId,
            type: input.type,
            status: 'active',
            statusLabel: 'Activa',
            domainLabel: 'Dominio Principal',
            domainValue: input.domain ? `https://${input.domain}` : 'Sin dominio',
            domainIcon: 'lock',
            metricLabel: 'Logins (24h)',
            metricValue: '0',
            metricSecondary: 'Recién creada',
        };

        // Agregar al inicio de la lista
        this._applications.update(list => [newApp, ...list]);

        // Crear detalle mínimo para que se pueda ver el panel
        const detail: ApplicationDetail = {
            id,
            name: input.name,
            icon: newApp.icon,
            clientId,
            clientType: this.subtitleFor(input.type),
            tlsVerified: false,
            createdBy: '@you',
            createdAgo: 'hace unos segundos',
            issuerDomain: 'auth.nexauth.io',
            issuerSslActive: true,
            clientSecret: `sec_new_${Math.random().toString(36).slice(2, 18)}`,
            lastRotationDays: 0,
            callbackUrls: '',
            logoutUrls: '',
            corsOrigins: input.domain ? `https://${input.domain}` : '',
            accessTokenTtl: 3600,
            refreshTokenTtl: 2592000,
            refreshRotationEnabled: true,
            successRate: 0,
            pkceCodeExchanges: 0,
            refreshTokenGrants: 0,
            sdkSnippets: {
                nodejs: `import { AuthShieldClient } from '@authshield/nextjs';\n\nexport const auth = new AuthShieldClient({\n  domain: 'auth.nexauth.io',\n  clientId: '${clientId}'\n});`,
                python: `from authshield import AuthShieldClient\n\nauth = AuthShieldClient(\n    domain='auth.nexauth.io',\n    client_id='${clientId}'\n)`,
                curl: `curl https://auth.nexauth.io/.well-known/openid-configuration`,
            },
        };

        this._details.update(map => ({ ...map, [id]: detail }));

        // Auto-seleccionar la nueva app
        this._selectedId.set(id);

        return newApp;
    }

    remove(id: string): void {
        this._applications.update(list => list.filter(a => a.id !== id));
        this._details.update(map => {
            const copy = { ...map };
            delete copy[id];
            return copy;
        });
        if (this._selectedId() === id) this._selectedId.set(null);
    }

    private subtitleFor(type: AppType): string {
        const map: Record<AppType, string> = {
            spa: 'SPA · Single Page App',
            web: 'Regular Web App',
            m2m: 'Machine-to-Machine',
            native: 'Native PKCE · iOS/Android',
        };
        return map[type];
    }

    private iconFor(type: AppType): string {
        const map: Record<AppType, string> = {
            spa: 'web',
            web: 'language',
            m2m: 'dns',
            native: 'smartphone',
        };
        return map[type];
    }

    private generateClientId(type: AppType): string {
        const prefix = type === 'm2m' ? 'm2m_srv_' : 'app_clnt_';
        const rand = Math.random().toString(16).slice(2, 14);
        return `${prefix}${rand}`;
    }
}
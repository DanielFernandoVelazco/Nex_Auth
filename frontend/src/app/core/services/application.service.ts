import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Application, AppType } from '../models/application.model';
import { ApplicationDetail } from '../models/application-detail.model';
import { Kpi } from '../models/kpi.model';
import { RegisterApplicationResult } from '../../features/applications/components/register-application-dialog/register-application-dialog';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
    private readonly http = inject(HttpClient);

    private readonly _applications = signal<Application[]>([]);
    private readonly _details = signal<Record<string, ApplicationDetail>>({});
    private readonly _kpis = signal<Kpi[]>([]);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly applications = this._applications.asReadonly();
    readonly kpis = this._kpis.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();

    readonly selectedDetail = computed<ApplicationDetail | null>(() => {
        const id = this._selectedId();
        return id ? this._details()[id] ?? null : null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const apps = await firstValueFrom(
                this.http.get<Application[]>('/api/applications')
            );
            this._applications.set(apps);
            this._kpis.set(this.computeKpis(apps));
            this._details.set(this.buildDetails(apps));

            if (apps.length > 0 && !this._selectedId()) {
                this._selectedId.set(apps[0].id);
            }
        } catch (err) {
            console.error('[Applications] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }

    async add(input: RegisterApplicationResult): Promise<Application | null> {
        try {
            const created = await firstValueFrom(
                this.http.post<Application>('/api/applications', {
                    name: input.name,
                    subtitle: this.subtitleFor(input.type),
                    type: input.type,
                    domainValue: input.domain,
                })
            );
            this._applications.update(list => [created, ...list]);
            this._details.update(d => ({
                ...d,
                [created.id]: this.buildDetail(created),
            }));
            this._selectedId.set(created.id);
            return created;
        } catch (err) {
            console.error('[Applications] create failed:', err);
            return null;
        }
    }

    async remove(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.delete(`/api/applications/${id}`));
            this._applications.update(list => list.filter(a => a.id !== id));
            this._details.update(d => {
                const copy = { ...d };
                delete copy[id];
                return copy;
            });
            if (this._selectedId() === id) this._selectedId.set(null);
            return true;
        } catch {
            return false;
        }
    }

    // ─── Helpers ─────────────────────────────────────────
    private computeKpis(apps: Application[]): Kpi[] {
        const active = apps.filter(a => a.status === 'active').length;
        return [
            {
                id: 'total-apps',
                label: 'Total Aplicaciones',
                value: apps.length.toString(),
                delta: `${active} activas`,
                trend: 'up',
                icon: 'apps',
                color: 'primary',
                footer: 'Todas las plataformas',
            },
            {
                id: 'active-clients',
                label: 'Clientes Activos',
                value: `${active} / ${apps.length}`,
                delta: `${Math.round((active / Math.max(apps.length, 1)) * 100)}%`,
                trend: 'neutral',
                icon: 'verified_user',
                color: 'tertiary',
                progress: Math.round((active / Math.max(apps.length, 1)) * 100),
            },
            {
                id: 'spa-count',
                label: 'SPA Aplicaciones',
                value: apps.filter(a => a.type === 'spa').length.toString(),
                delta: 'Frontend',
                trend: 'neutral',
                icon: 'web',
                color: 'primary',
            },
            {
                id: 'm2m-count',
                label: 'M2M Services',
                value: apps.filter(a => a.type === 'm2m').length.toString(),
                delta: 'Server-to-server',
                trend: 'neutral',
                icon: 'dns',
                color: 'secondary',
            },
        ];
    }

    private buildDetails(apps: Application[]): Record<string, ApplicationDetail> {
        return apps.reduce((acc, app) => {
            acc[app.id] = this.buildDetail(app);
            return acc;
        }, {} as Record<string, ApplicationDetail>);
    }

    private buildDetail(app: Application): ApplicationDetail {
        return {
            id: app.id,
            name: app.name,
            icon: app.icon,
            clientId: app.clientId,
            clientType: app.subtitle,
            tlsVerified: app.status === 'active',
            createdBy: '@system',
            createdAgo: 'hace poco',
            issuerDomain: 'auth.nexauth.io',
            issuerSslActive: true,
            clientSecret: `sec_${Math.random().toString(36).slice(2, 18)}`,
            lastRotationDays: 0,
            callbackUrls: app.domainValue,
            logoutUrls: '',
            corsOrigins: app.domainValue,
            accessTokenTtl: 3600,
            refreshTokenTtl: 2592000,
            refreshRotationEnabled: true,
            successRate: 0,
            pkceCodeExchanges: 0,
            refreshTokenGrants: 0,
            sdkSnippets: {
                nodejs: `import { AuthShieldClient } from '@authshield/nextjs';\n\nexport const auth = new AuthShieldClient({\n  domain: 'auth.nexauth.io',\n  clientId: '${app.clientId}'\n});`,
                python: `from authshield import AuthShieldClient\n\nauth = AuthShieldClient(domain='auth.nexauth.io', client_id='${app.clientId}')`,
                curl: `curl https://auth.nexauth.io/.well-known/openid-configuration`,
            },
        };
    }

    private subtitleFor(type: AppType): string {
        return {
            spa: 'SPA · Single Page App',
            web: 'Regular Web App',
            m2m: 'Machine-to-Machine',
            native: 'Native PKCE · iOS/Android',
        }[type];
    }
}
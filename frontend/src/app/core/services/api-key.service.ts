import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { relativeTime, expiryLabel } from '../utils/format.util';
import { ApiKeyRow, ApiKeyEnv, ApiKeyKpis, LiveLogEntry } from '../models/api-key.model';

interface BackendApiKey {
    id: string;
    serviceName: string;
    serviceId: string;
    icon: string;
    iconColor: string;
    keyPrefix: string;
    environment: string;
    scopes: string[];
    lastUsedAt: string | null;
    lastUsedIp: string | null;
    expiresAt: string | null;
    createdAt: string;
}

export interface GenerateKeyInput {
    serviceName: string;
    environment: ApiKeyEnv;
    expiryDays: number;
    scopes: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
    private readonly http = inject(HttpClient);

    private readonly _keys = signal<ApiKeyRow[]>([]);
    private readonly _loading = signal(false);

    readonly loading = this._loading.asReadonly();
    readonly keys = this._keys.asReadonly();
    readonly liveLogs = signal<LiveLogEntry[]>([]).asReadonly();

    readonly kpis = computed<ApiKeyKpis>(() => {
        const keys = this._keys();
        const prod = keys.filter(k => k.environment === 'production').length;
        const staging = keys.filter(k => k.environment === 'staging').length;

        return {
            activeKeys: {
                value: keys.length.toString(),
                delta: `${prod} prod · ${staging} staging`,
                breakdown: `${prod} Producción · ${staging} Staging`,
            },
            dailyRequests: {
                value: '—',
                sub: '/ 24h',
                sparkline: [10, 12, 8, 15, 10, 14, 9, 11],
            },
            expiring: {
                value: keys.filter(k => k.expiryStatus === 'warning').length.toString(),
                status: 'Estado óptimo',
                nextExpiry: 'Sin expiraciones próximas',
            },
            successRate: {
                value: '100%',
                slaTarget: 'SLA target: 99.95%',
                percent: 100,
            },
        };
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const backend = await firstValueFrom(
                this.http.get<BackendApiKey[]>('/api/api-keys')
            );
            this._keys.set(backend.map(k => this.mapBackend(k)));
        } catch (err) {
            console.error('[ApiKeys] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    async generate(input: GenerateKeyInput): Promise<ApiKeyRow | null> {
        try {
            const res = await firstValueFrom(
                this.http.post<BackendApiKey & { fullKey: string }>('/api/api-keys', {
                    serviceName: input.serviceName,
                    environment: input.environment,
                    scopes: input.scopes,
                    expiryDays: input.expiryDays,
                })
            );
            const mapped = this.mapBackend(res);
            this._keys.update(list => [mapped, ...list]);
            return mapped;
        } catch (err) {
            console.error('[ApiKeys] generate failed:', err);
            return null;
        }
    }

    async revoke(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.patch(`/api/api-keys/${id}/revoke`, {}));
            this._keys.update(list => list.filter(k => k.id !== id));
            return true;
        } catch {
            return false;
        }
    }

    async rotate(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.patch(`/api/api-keys/${id}/rotate`, {}));
            return true;
        } catch {
            return false;
        }
    }

    // ─── Mappers ─────────────────────────────────────────
    private mapBackend(bk: BackendApiKey): ApiKeyRow {
        const exp = expiryLabel(bk.expiresAt);
        return {
            id: bk.id,
            serviceName: bk.serviceName,
            serviceId: bk.serviceId,
            icon: bk.icon,
            iconColor: (bk.iconColor as 'primary' | 'secondary' | 'outline') ?? 'primary',
            keyPrefix: bk.keyPrefix,
            keyFullPrefix: bk.keyPrefix,
            environment: bk.environment as ApiKeyEnv,
            scopes: bk.scopes,
            lastUsedRelative: bk.lastUsedAt ? relativeTime(bk.lastUsedAt) : 'Nunca usado',
            lastUsedIp: bk.lastUsedIp ?? '—',
            expiryStatus: exp.status,
            expiryLabel: exp.label,
        };
    }
}
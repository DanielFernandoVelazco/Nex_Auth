import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiKeysOverview, ApiKeyRow, ApiKeyEnv } from '../models/api-key.model';

export interface GenerateKeyInput {
    serviceName: string;
    environment: ApiKeyEnv;
    expiryDays: number;
    scopes: string[];
}

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<ApiKeysOverview | null>(null);
    private readonly _loading = signal(false);

    readonly loading = this._loading.asReadonly();
    readonly kpis = computed(() => this._data()?.kpis ?? null);
    readonly keys = computed(() => this._data()?.keys ?? []);
    readonly liveLogs = computed(() => this._data()?.liveLogs ?? []);

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<ApiKeysOverview>('/mock/api-keys.json')
            );
            this._data.set(data);
        } finally {
            this._loading.set(false);
        }
    }

    generate(input: GenerateKeyInput): ApiKeyRow {
        const id = `key-${Date.now()}`;
        const envPrefix = input.environment === 'production' ? 'nex_live_' : 'nex_test_';
        const rand = Math.random().toString(16).slice(2, 10);

        const newKey: ApiKeyRow = {
            id,
            serviceName: input.serviceName,
            serviceId: `srv_${rand.slice(0, 5)}`,
            icon: 'vpn_key',
            iconColor: 'primary',
            keyPrefix: `${envPrefix}${rand.slice(0, 4)}...••••`,
            keyFullPrefix: `${envPrefix}${rand}a1b2c3d4e5f6`,
            environment: input.environment,
            scopes: input.scopes,
            lastUsedRelative: 'Nunca usado',
            lastUsedIp: '—',
            expiryStatus: 'ok',
            expiryLabel: input.expiryDays >= 365 ? `En ${Math.floor(input.expiryDays / 365)} año(s)` : `En ${input.expiryDays} días`,
        };

        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                keys: [newKey, ...data.keys],
                kpis: {
                    ...data.kpis,
                    activeKeys: {
                        ...data.kpis.activeKeys,
                        value: String(Number(data.kpis.activeKeys.value) + 1),
                    },
                },
            };
        });

        return newKey;
    }

    revoke(id: string): void {
        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                keys: data.keys.filter(k => k.id !== id),
                kpis: {
                    ...data.kpis,
                    activeKeys: {
                        ...data.kpis.activeKeys,
                        value: String(Math.max(0, Number(data.kpis.activeKeys.value) - 1)),
                    },
                },
            };
        });
    }
}
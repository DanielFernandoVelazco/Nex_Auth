import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    SecurityOverview,
    MfaPolicyId,
} from '../models/security.model';

@Injectable({ providedIn: 'root' })
export class SecurityService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<SecurityOverview | null>(null);
    private readonly _loading = signal(false);
    private readonly _activeMfaPolicy = signal<MfaPolicyId>('required');
    private readonly _hasUnsavedChanges = signal(true);

    readonly data = this._data.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly activeMfaPolicy = this._activeMfaPolicy.asReadonly();
    readonly hasUnsavedChanges = this._hasUnsavedChanges.asReadonly();

    readonly kpis = computed(() => this._data()?.kpis ?? []);
    readonly socialConnections = computed(() => this._data()?.socialConnections ?? []);
    readonly dbConnections = computed(() => this._data()?.dbConnections ?? []);
    readonly passwordlessRoutes = computed(() => this._data()?.passwordlessRoutes ?? []);
    readonly enterpriseSso = computed(() => this._data()?.enterpriseSso ?? []);
    readonly mfaPolicies = computed(() => this._data()?.mfaPolicies ?? []);
    readonly mfaFactors = computed(() => this._data()?.mfaFactors ?? []);
    readonly threats = computed(() => this._data()?.threats ?? []);

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<SecurityOverview>('/mock/security.json')
            );
            this._data.set(data);
            this._activeMfaPolicy.set(data.activeMfaPolicyId);
            this._hasUnsavedChanges.set(true);
        } finally {
            this._loading.set(false);
        }
    }

    setMfaPolicy(id: MfaPolicyId): void {
        this._activeMfaPolicy.set(id);
        this._hasUnsavedChanges.set(true);
    }

    // Métodos para toggles (mutan el objeto en memoria)
    toggleSocialConnection(id: string): void {
        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                socialConnections: data.socialConnections.map(c =>
                    c.id === id ? { ...c, enabled: !c.enabled } : c
                ),
            };
        });
        this._hasUnsavedChanges.set(true);
    }

    toggleMfaFactor(id: string): void {
        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                mfaFactors: data.mfaFactors.map(f =>
                    f.id === id ? { ...f, enabled: !f.enabled } : f
                ),
            };
        });
        this._hasUnsavedChanges.set(true);
    }

    toggleThreat(id: string): void {
        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                threats: data.threats.map(t =>
                    t.id === id ? { ...t, enabled: !t.enabled } : t
                ),
            };
        });
        this._hasUnsavedChanges.set(true);
    }

    save(): void {
        this._hasUnsavedChanges.set(false);
    }

    discard(): void {
        this.load();
    }
}
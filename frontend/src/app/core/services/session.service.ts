import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionsOverview, SessionRow } from '../models/session.model';

@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<SessionsOverview | null>(null);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly kpis = computed(() => this._data()?.kpis ?? []);
    readonly sessions = computed(() => this._data()?.sessions ?? []);
    readonly selectedId = this._selectedId.asReadonly();

    readonly selectedSession = computed<SessionRow | null>(() => {
        const id = this._selectedId();
        if (!id) return null;
        return this._data()?.sessions.find(s => s.id === id) ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<SessionsOverview>('/mock/sessions.json')
            );
            this._data.set(data);
            // Auto-seleccionar la sesión de alto riesgo
            const anomaly = data.sessions.find(s => s.riskLevel === 'high');
            this._selectedId.set(anomaly?.id ?? data.sessions[0]?.id ?? null);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }

    revoke(id: string): void {
        this._data.update(data => {
            if (!data) return data;
            return { ...data, sessions: data.sessions.filter(s => s.id !== id) };
        });
        if (this._selectedId() === id) {
            const next = this._data()?.sessions[0]?.id ?? null;
            this._selectedId.set(next);
        }
    }

    revokeAllAnomalies(): number {
        const anomalies = this.sessions().filter(s => s.riskLevel === 'high');
        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                sessions: data.sessions.filter(s => s.riskLevel !== 'high'),
            };
        });
        const next = this._data()?.sessions[0]?.id ?? null;
        this._selectedId.set(next);
        return anomalies.length;
    }
}
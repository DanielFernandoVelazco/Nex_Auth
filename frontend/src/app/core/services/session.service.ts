import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionRow, SessionKpi } from '../models/session.model';
import { relativeTime } from '../utils/format.util';

interface BackendSession {
    id: string;
    userId: string;
    userAgent: string | null;
    ipAddress: string | null;
    expiresAt: string;
    createdAt: string;
    user: { id: string; email: string; name: string | null };
}

interface SessionsResponse {
    data: BackendSession[];
    total: number;
    page: number;
    limit: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
    private readonly http = inject(HttpClient);

    private readonly _sessions = signal<SessionRow[]>([]);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);
    private readonly _total = signal(0);

    readonly loading = this._loading.asReadonly();
    readonly sessions = this._sessions.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();
    readonly total = this._total.asReadonly();

    readonly kpis = computed<SessionKpi[]>(() => {
        const sessions = this._sessions();
        return [
            {
                id: 'active',
                label: 'Sesiones Activas',
                value: sessions.length.toString(),
                delta: 'En vivo',
                deltaStyle: 'success',
                icon: 'hub',
                iconColor: 'primary',
                footer: 'Refresh tokens válidos',
                footerHighlight: '100%',
                progress: 94,
                progressColor: 'tertiary',
            },
            {
                id: 'concurrency',
                label: 'Concurrencia',
                value: sessions.length > 0
                    ? (sessions.length / new Set(sessions.map(s => s.userEmail)).size).toFixed(1)
                    : '0',
                delta: 'por usuario',
                deltaStyle: 'neutral',
                icon: 'devices',
                iconColor: 'secondary',
                footer: 'Soft Cap: 4',
                footerHighlight: '—',
                progress: 52,
                progressColor: 'secondary-container',
            },
            {
                id: 'anomalies',
                label: 'Sospechosas',
                value: sessions.filter(s => s.riskLevel === 'high').length.toString(),
                delta: 'Revisar',
                deltaStyle: 'danger',
                icon: 'travel_explore',
                iconColor: 'error',
                footer: 'Anomalías detectadas',
                footerHighlight: '—',
                progress: 20,
                progressColor: 'error',
            },
            {
                id: 'latency',
                label: 'Latencia',
                value: '45ms',
                delta: 'p99 < 90ms',
                deltaStyle: 'success',
                icon: 'bolt',
                iconColor: 'tertiary',
                footer: 'Edge Redis',
                footerHighlight: '32 regiones',
                progress: 38,
                progressColor: 'tertiary-container',
            },
        ];
    });

    readonly selectedSession = computed<SessionRow | null>(() => {
        const id = this._selectedId();
        return id ? this._sessions().find(s => s.id === id) ?? null : null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<SessionsResponse>('/api/sessions?page=1&limit=50')
            );
            const mapped = res.data.map(s => this.mapBackend(s));
            this._sessions.set(mapped);
            this._total.set(res.total);

            if (!this._selectedId() && mapped.length > 0) {
                this._selectedId.set(mapped[0].id);
            }
        } catch (err) {
            console.error('[Sessions] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }

    async revoke(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.patch(`/api/sessions/${id}/revoke`, {}));
            this._sessions.update(list => list.filter(s => s.id !== id));
            if (this._selectedId() === id) {
                this._selectedId.set(this._sessions()[0]?.id ?? null);
            }
            return true;
        } catch {
            return false;
        }
    }

    async revokeAllAnomalies(): Promise<number> {
        try {
            const res = await firstValueFrom(
                this.http.patch<{ revokedCount: number }>('/api/sessions/revoke-anomalies', {})
            );
            await this.load();
            return res.revokedCount;
        } catch {
            return 0;
        }
    }

    // ─── Mappers ─────────────────────────────────────────
    private mapBackend(bs: BackendSession): SessionRow {
        const ua = bs.userAgent ?? 'Unknown';
        const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
        const browser = browserMatch?.[0] ?? 'Unknown';
        const osMatch = ua.match(/(Windows|Mac|Linux|Android|iOS)[^;)]*/);
        const os = osMatch?.[0] ?? 'Unknown';

        const initials = (bs.user.name ?? bs.user.email)
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        return {
            id: bs.id,
            userName: bs.user.name ?? bs.user.email.split('@')[0],
            userEmail: bs.user.email,
            userInitials: initials,
            avatarBg: 'primary',
            online: true,
            device: {
                browser,
                os,
                icon: ua.includes('Mobile') ? 'phone_iphone' : 'desktop_windows',
            },
            geo: {
                flag: '🌐',
                city: '—',
                country: '—',
                ip: bs.ipAddress ?? '—',
                networkType: 'Unknown',
                isAnomaly: false,
            },
            authMethod: {
                icon: 'key',
                label: 'Session',
                iconColor: 'primary',
            },
            refreshGrantPrefix: `rft_${bs.id.slice(-10)}...`,
            lastActivity: {
                relative: relativeTime(bs.createdAt),
                endpoint: '—',
            },
            riskLevel: 'low',
            riskScore: 5,
            jwt: {
                iss: 'https://auth.nexauth.io',
                sub: bs.userId,
                aud: 'api://nexauth',
                exp: new Date(bs.expiresAt).getTime() / 1000,
                iat: new Date(bs.createdAt).getTime() / 1000,
                amr: ['pwd'],
                jti: bs.id,
                scope: 'openid profile',
                algorithm: 'RS256 (RSA 4096)',
                ttlLabel: expiryLabelStr(bs.expiresAt),
            },
        };
    }
}

function expiryLabelStr(date: string): string {
    const diff = new Date(date).getTime() - Date.now();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
}
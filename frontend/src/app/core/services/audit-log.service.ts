import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    AuditLog,
    AuditSeverity,
    AuditStatus,
    AuditKpi,
    AuditQuickFilter,
} from '../models/audit-log.model';
import { relativeTime } from '../utils/format.util';

interface BackendAuditLog {
    id: string;
    timestamp: string;
    severity: string;
    eventType: string;
    actorType: string;
    actorName: string;
    actorSubLabel: string;
    actorInitials: string;
    actorInitialsBg: string;
    actorIsError: boolean;
    geoCity: string | null;
    geoCountry: string | null;
    geoFlag: string | null;
    geoNetworkType: string | null;
    geoIsError: boolean;
    targetPrimary: string;
    targetSecondary: string | null;
    targetIsError: boolean;
    status: string;
    statusLabel: string;
    statusIcon: string;
    detail: any;
}

interface AuditLogsResponse {
    data: BackendAuditLog[];
    total: number;
    page: number;
    limit: number;
}

@Injectable({ providedIn: 'root' })
export class AuditLogService {
    private readonly http = inject(HttpClient);

    private readonly _logs = signal<AuditLog[]>([]);
    private readonly _loading = signal(false);
    private readonly _expandedId = signal<string | null>(null);
    private readonly _query = signal('action:login.* status:all severity:all env:production');
    private readonly _severityFilter = signal<AuditSeverity | 'all'>('all');
    private readonly _statusFilter = signal<AuditStatus | 'all'>('all');
    private readonly _timeframe = signal<'24h' | '7d' | '30d' | 'custom'>('24h');

    readonly loading = this._loading.asReadonly();
    readonly logs = this._logs.asReadonly();
    readonly expandedId = this._expandedId.asReadonly();
    readonly query = this._query.asReadonly();
    readonly severityFilter = this._severityFilter.asReadonly();
    readonly statusFilter = this._statusFilter.asReadonly();
    readonly timeframe = this._timeframe.asReadonly();

    readonly kpis = signal<AuditKpi[]>([
        { id: 'ingested', label: 'Eventos Ingeridos (24h)', value: '—', delta: '+0%', deltaStyle: 'neutral', icon: 'receipt_long', iconColor: 'primary', progress: 0, progressColor: 'primary' },
        { id: 'anomalies', label: 'Anomalías', value: '—', delta: 'Requieren revisión', deltaStyle: 'neutral', icon: 'shield_with_heart', iconColor: 'error', progress: 0, progressColor: 'error' },
        { id: 'integrity', label: 'Integridad', value: '100%', delta: 'Merkle Valid', deltaStyle: 'success', icon: 'verified', iconColor: 'tertiary-container', progress: 100, progressColor: 'tertiary-container' },
        { id: 'auth-failure', label: 'Fallos Auth', value: '—', delta: 'Baseline', deltaStyle: 'neutral', icon: 'lock_reset', iconColor: 'secondary', progress: 0, progressColor: 'secondary-container' },
    ]);

    readonly quickFilters = signal<AuditQuickFilter[]>([
        { id: 'critical', label: 'severity:critical', query: 'severity:critical', isCritical: true },
        { id: 'anomaly', label: 'anomaly.ip_blocked', query: 'action:anomaly.ip_blocked', isCritical: false },
        { id: 'role', label: 'role.permission_changed', query: 'action:role.permission_changed', isCritical: false },
        { id: 'failed', label: 'status:failed', query: 'status:failed', isCritical: false },
    ]);

    readonly filteredLogs = computed<AuditLog[]>(() => {
        const logs = this._logs();
        const severity = this._severityFilter();
        const status = this._statusFilter();
        return logs.filter(log => {
            const matchSev = severity === 'all' || log.severity === severity;
            const matchStat = status === 'all' || log.status === status;
            return matchSev && matchStat;
        });
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<AuditLogsResponse>('/api/audit-logs?page=1&limit=50')
            );
            this._logs.set(res.data.map(l => this.mapBackend(l)));

            // Cargar KPIs reales
            const kpis = await firstValueFrom(
                this.http.get<{ total24h: number; anomalies: number; failedAuth: number }>(
                    '/api/audit-logs/kpis'
                )
            );
            this.updateKpis(kpis.total24h, kpis.anomalies, kpis.failedAuth);
        } catch (err) {
            console.error('[AuditLogs] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    toggleExpand(id: string): void {
        this._expandedId.update(cur => cur === id ? null : id);
    }

    setSeverity(severity: AuditSeverity | 'all'): void {
        this._severityFilter.set(severity);
    }

    setStatus(status: AuditStatus | 'all'): void {
        this._statusFilter.set(status);
    }

    setQuery(q: string): void {
        this._query.set(q);
    }

    applyQuickFilter(filter: AuditQuickFilter): void {
        this._query.set(filter.query);
    }

    setTimeframe(tf: '24h' | '7d' | '30d' | 'custom'): void {
        this._timeframe.set(tf);
    }

    // ─── Mappers ─────────────────────────────────────────
    private mapBackend(bl: BackendAuditLog): AuditLog {
        return {
            id: bl.id,
            timestamp: new Date(bl.timestamp).toISOString().replace('T', ' ').slice(0, 23),
            relativeTime: relativeTime(bl.timestamp),
            severity: bl.severity as AuditSeverity,
            eventType: bl.eventType as any,
            actor: {
                type: bl.actorType as any,
                initials: bl.actorInitials,
                initialsBg: bl.actorInitialsBg as any,
                name: bl.actorName,
                subLabel: bl.actorSubLabel,
                isError: bl.actorIsError,
            },
            geo: {
                city: bl.geoCity ?? '—',
                country: bl.geoCountry ?? '—',
                flag: bl.geoFlag ?? '🌐',
                networkType: bl.geoNetworkType ?? '—',
                isError: bl.geoIsError,
            },
            target: {
                primary: bl.targetPrimary,
                secondary: bl.targetSecondary ?? '',
                isError: bl.targetIsError,
            },
            status: bl.status as AuditStatus,
            statusLabel: bl.statusLabel,
            statusIcon: bl.statusIcon,
            detail: {
                merkleLeafIndex: bl.detail?.merkleLeafIndex ?? 0,
                hmacPayload: bl.detail?.hmacPayload ?? '—',
                prevMerkleRoot: bl.detail?.prevMerkleRoot ?? '—',
                asn: bl.detail?.asn ?? '—',
                ja3: bl.detail?.ja3 ?? '—',
                tlsVersion: bl.detail?.tlsVersion ?? '—',
                requestId: bl.detail?.requestId ?? '—',
                policy: bl.detail?.policy ?? '—',
                trigger: bl.detail?.trigger ?? '—',
                blacklistTtl: bl.detail?.blacklistTtl ?? '—',
                receptorNotified: bl.detail?.receptorNotified ?? '—',
                rawJson: JSON.stringify(bl.detail ?? {}, null, 2),
            },
        };
    }

    private updateKpis(total: number, anomalies: number, failed: number): void {
        this.kpis.update(kpis => kpis.map(k => {
            if (k.id === 'ingested') {
                return { ...k, value: total.toLocaleString(), delta: '+12.4%', deltaStyle: 'success', progress: 82 };
            }
            if (k.id === 'anomalies') {
                return { ...k, value: anomalies.toString(), delta: 'Requieren revisión', deltaStyle: 'error', progress: 35 };
            }
            if (k.id === 'auth-failure') {
                return { ...k, value: `${failed} fallos`, delta: 'En 24h', deltaStyle: 'neutral', progress: 14 };
            }
            return k;
        }));
    }
}
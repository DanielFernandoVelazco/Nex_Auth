import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    AuditLogsOverview,
    AuditLog,
    AuditSeverity,
    AuditStatus,
    AuditQuickFilter,
} from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<AuditLogsOverview | null>(null);
    private readonly _loading = signal(false);
    private readonly _expandedId = signal<string | null>(null);
    private readonly _query = signal('action:login.* status:all severity:all env:production');
    private readonly _severityFilter = signal<AuditSeverity | 'all'>('all');
    private readonly _statusFilter = signal<AuditStatus | 'all'>('all');
    private readonly _timeframe = signal<'24h' | '7d' | '30d' | 'custom'>('24h');

    readonly loading = this._loading.asReadonly();
    readonly kpis = computed(() => this._data()?.kpis ?? []);
    readonly logs = computed(() => this._data()?.logs ?? []);
    readonly quickFilters = computed(() => this._data()?.quickFilters ?? []);
    readonly expandedId = this._expandedId.asReadonly();
    readonly query = this._query.asReadonly();
    readonly severityFilter = this._severityFilter.asReadonly();
    readonly statusFilter = this._statusFilter.asReadonly();
    readonly timeframe = this._timeframe.asReadonly();

    readonly filteredLogs = computed<AuditLog[]>(() => {
        const logs = this.logs();
        const severity = this._severityFilter();
        const status = this._statusFilter();

        return logs.filter(log => {
            const matchesSeverity = severity === 'all' || log.severity === severity;
            const matchesStatus = status === 'all' || log.status === status;
            return matchesSeverity && matchesStatus;
        });
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<AuditLogsOverview>('/mock/audit-logs.json')
            );
            this._data.set(data);
        } finally {
            this._loading.set(false);
        }
    }

    toggleExpand(id: string): void {
        this._expandedId.update(current => (current === id ? null : id));
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
}
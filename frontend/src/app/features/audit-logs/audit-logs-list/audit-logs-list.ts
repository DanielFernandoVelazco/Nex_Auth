import { Component, inject, OnInit } from '@angular/core';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuditRow } from '../components/audit-row/audit-row';
import { AuditQuickFilter, AuditSeverity, AuditStatus } from '../../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs-list',
  imports: [AuditRow],
  templateUrl: './audit-logs-list.html',
  styleUrl: './audit-logs-list.scss',
})
export class AuditLogsList implements OnInit {
  private readonly auditService = inject(AuditLogService);
  private readonly toast = inject(ToastService);

  protected readonly kpis = this.auditService.kpis;
  protected readonly logs = this.auditService.logs;
  protected readonly filteredLogs = this.auditService.filteredLogs;
  protected readonly expandedId = this.auditService.expandedId;
  protected readonly query = this.auditService.query;
  protected readonly quickFilters = this.auditService.quickFilters;
  protected readonly severityFilter = this.auditService.severityFilter;
  protected readonly statusFilter = this.auditService.statusFilter;
  protected readonly timeframe = this.auditService.timeframe;
  protected readonly loading = this.auditService.loading;

  protected readonly exportMenuOpen = false;

  ngOnInit(): void {
    this.auditService.load();
  }

  protected setTimeframe(tf: '24h' | '7d' | '30d' | 'custom'): void {
    this.auditService.setTimeframe(tf);
    this.toast.info('Rango actualizado', `Mostrando eventos de ${tf.toUpperCase()}.`);
  }

  protected onQueryInput(event: Event): void {
    this.auditService.setQuery((event.target as HTMLInputElement).value);
  }

  protected applyQuery(): void {
    this.toast.success('Filtro aplicado', this.query());
  }

  protected clearQuery(): void {
    this.auditService.setQuery('');
  }

  protected applyQuickFilter(filter: AuditQuickFilter): void {
    this.auditService.applyQuickFilter(filter);
    this.toast.info('Filtro rápido aplicado', filter.query);
  }

  protected onSeverityChange(event: Event): void {
    this.auditService.setSeverity((event.target as HTMLSelectElement).value as AuditSeverity | 'all');
  }

  protected onStatusChange(event: Event): void {
    this.auditService.setStatus((event.target as HTMLSelectElement).value as AuditStatus | 'all');
  }

  protected toggleRow(id: string): void {
    this.auditService.toggleExpand(id);
  }

  protected exportAs(format: string): void {
    this.toast.success('Exportación iniciada', `Streaming a ${format}...`);
  }
}
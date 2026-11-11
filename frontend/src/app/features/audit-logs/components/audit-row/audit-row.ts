import { Component, input, output, computed, inject } from '@angular/core';
import { AuditLog, AuditSeverity } from '../../../../core/models/audit-log.model';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-audit-row',
  imports: [],
  templateUrl: './audit-row.html',
  styleUrl: './audit-row.scss',
})
export class AuditRow {
  private readonly toast = inject(ToastService);

  readonly log = input.required<AuditLog>();
  readonly expanded = input<boolean>(false);
  readonly toggled = output<string>();

  protected readonly severityBadgeClass = computed(() => {
    const map: Record<AuditSeverity, string> = {
      critical: 'bg-error-container text-on-error-container',
      warning: 'bg-surface-container-high text-on-surface',
      info: 'bg-surface-container-high text-on-surface-variant',
    };
    return map[this.log().severity];
  });

  protected readonly severityDotClass = computed(() => {
    const map: Record<AuditSeverity, string> = {
      critical: 'bg-error',
      warning: 'bg-secondary',
      info: 'bg-outline',
    };
    return map[this.log().severity];
  });

  protected readonly severityLabel = computed(() => {
    const map: Record<AuditSeverity, string> = {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    };
    return map[this.log().severity];
  });

  protected readonly eventClass = computed(() => {
    const sev = this.log().severity;
    if (sev === 'critical') return 'text-error font-semibold';
    if (sev === 'warning') return 'text-secondary font-semibold';
    return 'text-on-surface font-semibold';
  });

  protected readonly actorInitialsClass = computed(() => {
    const bg = this.log().actor.initialsBg;
    const map = {
      primary: 'bg-primary-container text-on-primary',
      secondary: 'bg-secondary-fixed text-on-secondary-fixed',
      error: 'bg-error-container text-on-error-container',
      neutral: 'bg-surface-container-high text-on-surface-variant',
    };
    return map[bg];
  });

  protected readonly statusBadgeClass = computed(() => {
    const status = this.log().status;
    if (status === 'success') return 'bg-tertiary-fixed text-on-tertiary-fixed';
    if (status === 'blocked') return 'bg-tertiary-fixed text-on-tertiary-fixed';
    return 'bg-error-container text-on-error-container';
  });

  protected toggle(): void {
    this.toggled.emit(this.log().id);
  }

  protected copyEventType(): void {
    navigator.clipboard.writeText(this.log().eventType).then(() => {
      this.toast.success('Evento copiado', this.log().eventType);
    });
  }

  protected copyRawJson(): void {
    navigator.clipboard.writeText(this.log().detail.rawJson).then(() => {
      this.toast.success('JSON copiado', 'Payload forense completo.');
    });
  }
}
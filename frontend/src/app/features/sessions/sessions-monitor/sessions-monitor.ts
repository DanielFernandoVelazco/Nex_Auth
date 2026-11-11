import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { SessionService } from '../../../core/services/session.service';
import { ToastService } from '../../../core/services/toast.service';
import { SessionRow } from '../components/session-row/session-row';
import { JwtInspector } from '../components/jwt-inspector/jwt-inspector';

@Component({
  selector: 'app-sessions-monitor',
  imports: [SessionRow, JwtInspector],
  templateUrl: './sessions-monitor.html',
  styleUrl: './sessions-monitor.scss',
})
export class SessionsMonitor implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly toast = inject(ToastService);

  protected readonly kpis = this.sessionService.kpis;
  protected readonly sessions = this.sessionService.sessions;
  protected readonly selectedSession = this.sessionService.selectedSession;
  protected readonly selectedId = this.sessionService.selectedId;
  protected readonly loading = this.sessionService.loading;

  protected readonly searchQuery = signal('');
  protected readonly tabFilter = signal<'all' | 'suspicious' | 'fido2'>('all');

  protected readonly filteredSessions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const tab = this.tabFilter();
    return this.sessions().filter(s => {
      const matchesSearch = !q
        || s.userName.toLowerCase().includes(q)
        || s.userEmail.toLowerCase().includes(q)
        || s.geo.ip.includes(q);
      const matchesTab =
        tab === 'all'
        || (tab === 'suspicious' && s.riskLevel === 'high')
        || (tab === 'fido2' && s.jwt.amr.includes('fido2'));
      return matchesSearch && matchesTab;
    });
  });

  ngOnInit(): void {
    this.sessionService.load();
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected setTab(tab: 'all' | 'suspicious' | 'fido2'): void {
    this.tabFilter.set(tab);
  }

  protected selectSession(id: string): void {
    this.sessionService.select(id);
  }

  protected revokeSelected(): void {
    const s = this.selectedSession();
    if (!s) return;
    const confirmed = confirm(`¿Revocar la sesión de ${s.userName}?`);
    if (!confirmed) return;
    this.sessionService.revoke(s.id);
    this.toast.success('Sesión revocada', `Sesión ${s.id} fue invalidada en Redis.`);
  }

  protected stepUpSelected(): void {
    const s = this.selectedSession();
    if (!s) return;
    this.toast.info('Step-up iniciado', `Se solicitó re-autenticación FIDO2 a ${s.userName}.`);
  }

  protected revokeSingle(id: string): void {
    this.sessionService.revoke(id);
    this.toast.success('Sesión revocada', `Sesión ${id} fue eliminada.`);
  }

  protected revokeAllAnomalies(): void {
    const count = this.sessionService.revokeAllAnomalies();
    this.toast.success('Revocación masiva', `${count} sesiones anómalas fueron invalidadas.`);
  }

  protected refreshTelemetry(): void {
    this.toast.info('Actualizando telemetría...');
    setTimeout(() => this.toast.success('Telemetría actualizada'), 800);
  }
}
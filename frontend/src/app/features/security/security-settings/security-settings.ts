import { Component, inject, OnInit, signal } from '@angular/core';
import { SecurityService } from '../../../core/services/security.service';
import { ToastService } from '../../../core/services/toast.service';
import { MfaPolicyId } from '../../../core/models/security.model';
import { ConnectionCard } from '../components/connection-card/connection-card';
import { MfaFactorCard } from '../components/mfa-factor-card/mfa-factor-card';
import { ThreatCard } from '../components/threat-card/threat-card';

@Component({
  selector: 'app-security-settings',
  imports: [ConnectionCard, MfaFactorCard, ThreatCard],
  templateUrl: './security-settings.html',
  styleUrl: './security-settings.scss',
})
export class SecuritySettings implements OnInit {
  private readonly securityService = inject(SecurityService);
  private readonly toast = inject(ToastService);

  protected readonly kpis = this.securityService.kpis;
  protected readonly socialConnections = this.securityService.socialConnections;
  protected readonly dbConnections = this.securityService.dbConnections;
  protected readonly passwordlessRoutes = this.securityService.passwordlessRoutes;
  protected readonly enterpriseSso = this.securityService.enterpriseSso;
  protected readonly mfaPolicies = this.securityService.mfaPolicies;
  protected readonly mfaFactors = this.securityService.mfaFactors;
  protected readonly threats = this.securityService.threats;
  protected readonly activeMfaPolicy = this.securityService.activeMfaPolicy;
  protected readonly hasUnsavedChanges = this.securityService.hasUnsavedChanges;
  protected readonly loading = this.securityService.loading;

  protected readonly activeTab = signal<'connections' | 'mfa' | 'passwords' | 'threats'>('connections');

  protected readonly tabs = [
    { id: 'connections' as const, label: 'Conexiones & Proveedores', icon: 'hub' },
    { id: 'mfa' as const, label: 'Multi-Factor (MFA) & Passkeys', icon: 'fingerprint' },
    { id: 'passwords' as const, label: 'Políticas de Contraseñas', icon: 'password' },
    { id: 'threats' as const, label: 'Protección contra Ataques', icon: 'shield', badge: '3 alertas' },
  ];

  ngOnInit(): void {
    this.securityService.load();
  }

  protected setTab(id: typeof this.tabs[number]['id']): void {
    this.activeTab.set(id);
  }

  protected setMfaPolicy(id: MfaPolicyId): void {
    this.securityService.setMfaPolicy(id);
  }

  protected onToggleSocialConnection(id: string): void {
    this.securityService.toggleSocialConnection(id);
    const conn = this.socialConnections().find(c => c.id === id);
    if (conn) {
      this.toast.info(
        conn.enabled ? 'Conexión habilitada' : 'Conexión deshabilitada',
        conn.name
      );
    }
  }

  protected onToggleMfaFactor(id: string): void {
    this.securityService.toggleMfaFactor(id);
  }

  protected onToggleThreat(id: string): void {
    this.securityService.toggleThreat(id);
  }

  protected onDownloadRecovery(): void {
    this.toast.success('Descargando códigos', 'Se generará un archivo .txt con 10 códigos.');
  }

  protected saveChanges(): void {
    this.securityService.save();
    this.toast.success('Políticas guardadas', 'Los cambios fueron desplegados a los edges globales.');
  }

  protected discardChanges(): void {
    this.securityService.discard();
    this.toast.info('Cambios descartados', 'Los valores volvieron al último guardado.');
  }
}
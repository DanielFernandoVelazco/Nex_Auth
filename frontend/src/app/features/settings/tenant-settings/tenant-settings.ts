import { Component, inject, OnInit, signal } from '@angular/core';
import { TenantService } from '../../../core/services/tenant.service';
import { ToastService } from '../../../core/services/toast.service';
import { SmtpPreview } from '../components/smtp-preview/smtp-preview';
import { EmailProvider, EmailTemplateId } from '../../../core/models/tenant.model';

type SettingsTab = 'general' | 'security' | 'mfa' | 'email';

@Component({
  selector: 'app-tenant-settings',
  imports: [SmtpPreview],
  templateUrl: './tenant-settings.html',
  styleUrl: './tenant-settings.scss',
})
export class TenantSettings implements OnInit {
  private readonly tenantService = inject(TenantService);
  private readonly toast = inject(ToastService);

  protected readonly identity = this.tenantService.identity;
  protected readonly session = this.tenantService.session;
  protected readonly email = this.tenantService.email;
  protected readonly health = this.tenantService.health;
  protected readonly activeTemplate = this.tenantService.activeTemplate;
  protected readonly activeTemplateObj = this.tenantService.activeTemplateObj;
  protected readonly hasChanges = this.tenantService.hasChanges;
  protected readonly loading = this.tenantService.loading;

  protected readonly activeTab = signal<SettingsTab>('general');

  protected readonly tabs = [
    { id: 'general' as const, label: 'General', icon: 'tune' },
    { id: 'security' as const, label: 'Seguridad Global', icon: 'shield' },
    { id: 'mfa' as const, label: 'MFA & Factores', icon: 'phonelink_lock' },
    { id: 'email' as const, label: 'Email & Notificaciones (SMTP)', icon: 'mark_email_read' },
  ];

  protected readonly emailProviders: { id: EmailProvider; label: string; icon: string }[] = [
    { id: 'resend', label: 'Resend', icon: 'bolt' },
    { id: 'ses', label: 'AWS SES', icon: 'cloud' },
    { id: 'sendgrid', label: 'SendGrid', icon: 'send' },
  ];

  ngOnInit(): void {
    this.tenantService.load();
  }

  protected setTab(id: SettingsTab): void {
    this.activeTab.set(id);
  }

  protected onOrgNameInput(event: Event): void {
    this.tenantService.updateOrganizationName((event.target as HTMLInputElement).value);
  }

  protected onProviderClick(id: EmailProvider): void {
    this.tenantService.updateEmailProvider(id);
    const provider = this.emailProviders.find(p => p.id === id);
    if (provider) {
      this.toast.success('Proveedor actualizado', provider.label);
    }
  }

  protected onTemplateChange(id: EmailTemplateId): void {
    this.tenantService.setTemplate(id);
  }

  protected copyTenantId(): void {
    const id = this.identity()?.tenantId;
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      this.toast.success('Tenant ID copiado', id);
    });
  }

  protected onBackchannelToggle(): void {
    this.tenantService.toggleBackchannelLogout();
  }

  protected saveChanges(): void {
    this.tenantService.save();
    this.toast.success('Configuración guardada', 'Los cambios fueron desplegados a los edges globales.');
  }

  protected discardChanges(): void {
    this.tenantService.discard();
    this.toast.info('Cambios descartados', 'Los valores volvieron al último guardado.');
  }

  protected transferOwnership(): void {
    const confirmed = confirm('¿Transferir la propiedad del tenant? Esta acción requiere confirmación del nuevo super-admin.');
    if (!confirmed) return;
    this.toast.info('Transferencia iniciada', 'Se envió un email al nuevo administrador.');
  }

  protected deleteTenant(): void {
    const confirmed = confirm('⚠️ ¿Eliminar el tenant PERMANENTEMENTE? Todos los usuarios, tokens y datos serán purgados.');
    if (!confirmed) return;
    this.toast.error('Eliminación bloqueada', 'Esta acción requiere aprobación del CISO.');
  }
}
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { EmailProvider, EmailTemplateId } from '../models/tenant.model';

interface BackendSettings {
    id: string;
    organizationId: string;
    organizationName: string;
    customDomain: string | null;
    sslActive: boolean;
    sslExpiresOn: string | null;
    accessTokenTtl: number;
    idleTimeout: number;
    maxConcurrency: number;
    backchannelLogout: boolean;
    emailProvider: string;
    senderEmail: string;
}

@Injectable({ providedIn: 'root' })
export class TenantService {
    private readonly http = inject(HttpClient);

    private readonly _settings = signal<BackendSettings | null>(null);
    private readonly _loading = signal(false);
    private readonly _activeTemplate = signal<EmailTemplateId>('otp');
    private readonly _hasChanges = signal(false);

    readonly loading = this._loading.asReadonly();
    readonly activeTemplate = this._activeTemplate.asReadonly();
    readonly hasChanges = this._hasChanges.asReadonly();

    readonly identity = computed(() => {
        const s = this._settings();
        if (!s) return null;
        return {
            organizationName: s.organizationName,
            tenantId: s.organizationId,
            customDomain: s.customDomain ?? '—',
            sslStatus: {
                active: s.sslActive,
                label: 'SSL Verificado',
                expiresOn: s.sslExpiresOn
                    ? new Date(s.sslExpiresOn).toLocaleDateString('es-ES')
                    : 'Sin fecha',
            },
        };
    });

    readonly session = computed(() => {
        const s = this._settings();
        if (!s) return null;
        return {
            accessTokenTtl: s.accessTokenTtl,
            idleTimeout: s.idleTimeout,
            maxConcurrency: s.maxConcurrency,
            backchannelLogout: s.backchannelLogout,
        };
    });

    readonly email = computed(() => {
        const s = this._settings();
        if (!s) return null;
        return {
            provider: s.emailProvider as EmailProvider,
            senderEmail: s.senderEmail,
            dnsVerifications: [
                { id: 'dkim', label: 'DKIM (2048-bit RSA)', status: 'validated' as const, statusLabel: 'VALIDADO' },
                { id: 'spf', label: 'SPF (~all Include)', status: 'validated' as const, statusLabel: 'VALIDADO' },
                { id: 'dmarc', label: 'DMARC (p=reject)', status: 'validated' as const, statusLabel: 'POLÍTICA ACTIVA' },
            ],
            templates: [
                { id: 'otp' as const, label: 'Código OTP', icon: 'key', title: 'Código de Verificación OTP', description: 'Has solicitado acceso temporal a la consola NexAuth.', ctaLabel: '842 - 910' },
                { id: 'welcome' as const, label: 'Bienvenida', icon: 'handshake', title: 'Bienvenido a NexAuth', description: 'Tu credencial corporativa ha sido autorizada.', ctaLabel: 'Activar Cuenta Institucional' },
                { id: 'reset' as const, label: 'Recuperar Clave', icon: 'lock_reset', title: 'Restablecimiento de Credenciales', description: 'Recibimos una solicitud para resetear tu factor principal.', ctaLabel: 'Restablecer mi Contraseña' },
            ],
        };
    });

    readonly health = computed(() => ({
        synced: true,
        cluster: 'East-Primary',
        lastSync: 'hace 4 minutos',
    }));

    readonly activeTemplateObj = computed(() => {
        const email = this.email();
        if (!email) return null;
        return email.templates.find(t => t.id === this._activeTemplate()) ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const settings = await firstValueFrom(
                this.http.get<BackendSettings>('/api/settings')
            );
            this._settings.set(settings);
        } catch (err) {
            console.error('[Tenant] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    setTemplate(id: EmailTemplateId): void {
        this._activeTemplate.set(id);
    }

    updateOrganizationName(name: string): void {
        this._settings.update(s => (s ? { ...s, organizationName: name } : s));
        this._hasChanges.set(true);
    }

    updateEmailProvider(provider: EmailProvider): void {
        this._settings.update(s => (s ? { ...s, emailProvider: provider } : s));
        this._hasChanges.set(true);
    }

    toggleBackchannelLogout(): void {
        this._settings.update(s =>
            s ? { ...s, backchannelLogout: !s.backchannelLogout } : s
        );
        this._hasChanges.set(true);
    }

    async save(): Promise<void> {
        const s = this._settings();
        if (!s) return;
        try {
            await firstValueFrom(
                this.http.patch('/api/settings', {
                    organizationName: s.organizationName,
                    emailProvider: s.emailProvider,
                    backchannelLogout: s.backchannelLogout,
                    accessTokenTtl: s.accessTokenTtl,
                    idleTimeout: s.idleTimeout,
                    maxConcurrency: s.maxConcurrency,
                    senderEmail: s.senderEmail,
                })
            );
            this._hasChanges.set(false);
        } catch (err) {
            console.error('[Tenant] save failed:', err);
        }
    }

    discard(): void {
        this.load();
        this._hasChanges.set(false);
    }
}
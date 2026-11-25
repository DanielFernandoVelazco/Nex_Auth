import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MfaPolicyId } from '../models/security.model';

interface SecurityConfig {
    id: string;
    organizationId: string;
    mfaPolicy: string;
    backchannelLogout: boolean;
    socialConnections: any[];
    mfaFactors: any[];
    threats: any[];
    dbConnections: any[];
    passwordlessRoutes: any[];
    enterpriseSso: any[];
    dnsVerifications: any[];
}

@Injectable({ providedIn: 'root' })
export class SecurityService {
    private readonly http = inject(HttpClient);

    private readonly _config = signal<SecurityConfig | null>(null);
    private readonly _loading = signal(false);
    private readonly _hasUnsavedChanges = signal(true);

    readonly data = this._config.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly hasUnsavedChanges = this._hasUnsavedChanges.asReadonly();

    readonly kpis = computed(() => {
        const c = this._config();
        if (!c) return [];
        const activeSocial = (c.socialConnections as any[]).filter(x => x.enabled).length;
        const totalSocial = (c.socialConnections as any[]).length;

        return [
            { id: 'active-connections', label: 'Conexiones Activas', value: `${activeSocial} / ${totalSocial}`, delta: '1 Enterprise SAML', deltaIcon: 'check_circle', deltaStyle: 'success', icon: 'dataset', iconColor: 'primary' },
            { id: 'fido2-adoption', label: 'Adopción FIDO2', value: '84.2%', delta: '+12% este mes', deltaIcon: 'trending_up', deltaStyle: 'success', icon: 'key', iconColor: 'tertiary' },
            { id: 'blocked-attacks', label: 'Ataques Bloqueados', value: '14,290', delta: 'IP Throttling activo', deltaIcon: 'block', deltaStyle: 'warning', icon: 'shield', iconColor: 'error' },
            { id: 'posture-level', label: 'Nivel de Postura', value: 'Tier 1', delta: 'Zero-Trust Enforced', deltaIcon: 'verified', deltaStyle: 'primary', icon: 'lock_clock', iconColor: 'primary' },
        ];
    });

    readonly socialConnections = computed(() => (this._config()?.socialConnections as any[]) ?? []);
    readonly dbConnections = computed(() => (this._config()?.dbConnections as any[]) ?? []);
    readonly passwordlessRoutes = computed(() => (this._config()?.passwordlessRoutes as any[]) ?? []);
    readonly enterpriseSso = computed(() => (this._config()?.enterpriseSso as any[]) ?? []);
    readonly mfaFactors = computed(() => (this._config()?.mfaFactors as any[]) ?? []);
    readonly threats = computed(() => (this._config()?.threats as any[]) ?? []);
    readonly activeMfaPolicy = computed(() => (this._config()?.mfaPolicy ?? 'required') as MfaPolicyId);

    readonly mfaPolicies = signal([
        { id: 'disabled', label: 'Deshabilitado', description: 'Sin segundo factor' },
        { id: 'optional', label: 'Opcional / Por usuario', description: 'A discreción del usuario' },
        { id: 'admins-only', label: 'Sólo Administradores', description: 'Roles con permisos write/admin' },
        { id: 'required', label: 'Requerido para Todos', description: 'Obligatorio en todo inicio' },
    ]);

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const config = await firstValueFrom(
                this.http.get<SecurityConfig>('/api/security')
            );
            this._config.set(config);
        } catch (err) {
            console.error('[Security] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    async setMfaPolicy(id: MfaPolicyId): Promise<void> {
        try {
            await firstValueFrom(
                this.http.patch('/api/security/mfa-policy', { mfaPolicy: id })
            );
            this._config.update(c => (c ? { ...c, mfaPolicy: id } : c));
            this._hasUnsavedChanges.set(true);
        } catch (err) {
            console.error('[Security] setMfaPolicy failed:', err);
        }
    }

    async toggleSocialConnection(id: string): Promise<void> {
        try {
            const config = await firstValueFrom(
                this.http.patch<SecurityConfig>(`/api/security/social-connections/${id}`, {})
            );
            this._config.set(config);
            this._hasUnsavedChanges.set(true);
        } catch (err) {
            console.error('[Security] toggleSocial failed:', err);
        }
    }

    async toggleMfaFactor(id: string): Promise<void> {
        try {
            const config = await firstValueFrom(
                this.http.patch<SecurityConfig>(`/api/security/mfa-factors/${id}`, {})
            );
            this._config.set(config);
            this._hasUnsavedChanges.set(true);
        } catch (err) {
            console.error('[Security] toggleMfaFactor failed:', err);
        }
    }

    async toggleThreat(id: string): Promise<void> {
        try {
            const config = await firstValueFrom(
                this.http.patch<SecurityConfig>(`/api/security/threats/${id}`, {})
            );
            this._config.set(config);
            this._hasUnsavedChanges.set(true);
        } catch (err) {
            console.error('[Security] toggleThreat failed:', err);
        }
    }

    save(): void {
        this._hasUnsavedChanges.set(false);
    }

    discard(): void {
        this.load();
        this._hasUnsavedChanges.set(false);
    }
}
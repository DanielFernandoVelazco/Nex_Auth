import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    Permission,
    PermissionCriticality,
    PermissionKpi,
    ResourceServerId,
    RiskDistribution,
    ZeroTrustPolicy,
} from '../models/permission.model';

interface BackendPermission {
    id: string;
    resource: string;
    action: string;
    description: string | null;
    _count: { roles: number };
}

export interface RegisterPermissionInput {
    scopeIdentifier: string;
    resourceServerId: ResourceServerId;
    consentDescription: string;
    criticality: PermissionCriticality;
    requiresStepUp: boolean;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private readonly http = inject(HttpClient);

    private readonly _permissions = signal<Permission[]>([]);
    private readonly _loading = signal(false);

    readonly loading = this._loading.asReadonly();
    readonly permissions = this._permissions.asReadonly();

    readonly kpis = computed<PermissionKpi[]>(() => {
        const perms = this._permissions();
        const sensitives = perms.filter(p => p.criticality === 'high').length;
        const totalRoles = perms.reduce((s, p) => s + p.consumers.rolesCount, 0);

        return [
            {
                id: 'total-scopes',
                label: 'Total Scopes RFC',
                value: perms.length.toString(),
                deltaLabel: 'Registrados',
                deltaStyle: 'success',
                icon: 'key',
                iconColor: 'primary',
                footer: `${new Set(perms.map(p => p.resourceServerId)).size} Resource Servers`,
            },
            {
                id: 'sensitive-scopes',
                label: 'Scopes Sensibles',
                value: sensitives.toString(),
                deltaLabel: 'MFA Forzado',
                deltaStyle: 'danger',
                icon: 'gpp_maybe',
                iconColor: 'error',
                footer: 'Requieren Step-Up',
            },
            {
                id: 'delegated-apps',
                label: 'Asignaciones Activas',
                value: totalRoles.toString(),
                deltaLabel: 'Consentimientos',
                deltaStyle: 'neutral',
                icon: 'token',
                iconColor: 'secondary',
                footer: 'Roles con estos scopes',
            },
            {
                id: 'risk-distribution',
                label: 'Distribución de Riesgo',
                value: '',
                deltaLabel: '',
                deltaStyle: 'neutral',
                icon: 'analytics',
                iconColor: 'tertiary',
                footer: '',
            },
        ];
    });

    readonly riskDistribution = computed<RiskDistribution>(() => {
        const perms = this._permissions();
        const total = perms.length || 1;
        const low = perms.filter(p => p.criticality === 'low').length;
        const med = perms.filter(p => p.criticality === 'medium').length;
        const high = perms.filter(p => p.criticality === 'high').length;

        return {
            lowPct: Math.round((low / total) * 100),
            mediumPct: Math.round((med / total) * 100),
            highPct: Math.round((high / total) * 100),
        };
    });

    readonly jwtPreviewJson = signal<string>(`{\n  "iss": "https://auth.nexauth.io/oauth/v2",\n  "sub": "usr_...",\n  "scope": "openid profile"\n}`);
    readonly jwtKid = signal<string>('k-prod-current');
    readonly policies = signal<ZeroTrustPolicy[]>([
        { id: 'network', label: 'Validar Contexto de Red', description: 'Restringir scopes sensibles a VPN/CIDR', enabled: true },
        { id: 'consent', label: 'Consentimiento de Pantalla', description: 'OAuth Prompt = Consent Forzado', enabled: true },
        { id: 'jwks', label: 'Rotación JWKS', description: 'Auto-revocación ante anomalías', enabled: true },
    ]);

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const backend = await firstValueFrom(
                this.http.get<BackendPermission[]>('/api/permissions')
            );
            this._permissions.set(backend.map(p => this.mapBackend(p)));
        } catch (err) {
            console.error('[Permissions] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    async add(input: RegisterPermissionInput): Promise<Permission | null> {
        try {
            const [resource, action] = input.scopeIdentifier.split(':');
            const created = await firstValueFrom(
                this.http.post<BackendPermission>('/api/permissions', {
                    resource: resource ?? input.scopeIdentifier,
                    action: action ?? 'read',
                    description: input.consentDescription,
                })
            );
            const mapped = this.mapBackend(created);
            this._permissions.update(list => [mapped, ...list]);
            return mapped;
        } catch (err) {
            console.error('[Permissions] add failed:', err);
            return null;
        }
    }

    // ─── Mappers ─────────────────────────────────────────
    private mapBackend(bp: BackendPermission): Permission {
        const criticality: PermissionCriticality =
            bp.action === 'delete' || bp.action === 'revoke' ? 'high' :
                bp.action === 'write' ? 'medium' : 'low';

        return {
            id: bp.id,
            scopeIdentifier: `${bp.resource}:${bp.action}`,
            urnIdentifier: `urn:nexauth:${bp.resource}.${bp.action}`,
            resourceServerId: this.resourceIdFor(bp.resource),
            resourceServerLabel: bp.resource.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            resourceServerMeta: 'API Gateway',
            resourceServerIcon: 'security',
            resourceServerIconColor: 'primary',
            consentDescription: bp.description ?? `Acceso a ${bp.resource}`,
            criticality,
            requiresStepUp: criticality === 'high',
            consumers: {
                rolesCount: bp._count.roles,
                appsCount: Math.max(0, bp._count.roles - 1),
            },
        };
    }

    private resourceIdFor(resource: string): ResourceServerId {
        const map: Record<string, ResourceServerId> = {
            users: 'USER_MGMT',
            applications: 'USER_MGMT',
            billing: 'BILLING',
            'audit-logs': 'AUDIT',
        };
        return map[resource] ?? 'AUTH_CORE';
    }
}
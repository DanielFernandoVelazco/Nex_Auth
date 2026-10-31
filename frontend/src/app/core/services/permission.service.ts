import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    PermissionsOverview,
    Permission,
    PermissionCriticality,
    ResourceServerId,
} from '../models/permission.model';

export interface RegisterPermissionInput {
    scopeIdentifier: string;
    resourceServerId: ResourceServerId;
    consentDescription: string;
    criticality: PermissionCriticality;
    requiresStepUp: boolean;
}

interface ResourceMeta {
    label: string;
    meta: string;
    icon: string;
    iconColor: 'primary' | 'secondary' | 'tertiary' | 'outline';
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<PermissionsOverview | null>(null);
    private readonly _loading = signal(false);

    readonly loading = this._loading.asReadonly();
    readonly kpis = computed(() => this._data()?.kpis ?? []);
    readonly riskDistribution = computed(() => this._data()?.riskDistribution ?? null);
    readonly permissions = computed(() => this._data()?.permissions ?? []);
    readonly jwtPreviewJson = computed(() => this._data()?.jwtPreviewJson ?? '');
    readonly jwtKid = computed(() => this._data()?.jwtKid ?? '');
    readonly policies = computed(() => this._data()?.policies ?? []);

    private readonly resourceMetas: Record<ResourceServerId, ResourceMeta> = {
        USER_MGMT: {
            label: 'User Management API',
            meta: 'v2.4 · Cluster US-East',
            icon: 'supervised_user_circle',
            iconColor: 'tertiary',
        },
        BILLING: {
            label: 'Billing Gateway',
            meta: 'Stripe Connect Engine',
            icon: 'receipt_long',
            iconColor: 'outline',
        },
        AUDIT: {
            label: 'Audit Stream API',
            meta: 'Kinesis / SIEM Export',
            icon: 'history_edu',
            iconColor: 'secondary',
        },
        AUTH_CORE: {
            label: 'Auth Engine Core',
            meta: 'RFC 7009 · Core Engine',
            icon: 'security',
            iconColor: 'primary',
        },
    };

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<PermissionsOverview>('/mock/permissions.json')
            );
            this._data.set(data);
        } finally {
            this._loading.set(false);
        }
    }

    add(input: RegisterPermissionInput): Permission {
        const meta = this.resourceMetas[input.resourceServerId];
        const id = `perm-${Date.now()}`;

        const newPermission: Permission = {
            id,
            scopeIdentifier: input.scopeIdentifier,
            urnIdentifier: `urn:nexauth:${input.scopeIdentifier.replace(/:/g, '.')}`,
            resourceServerId: input.resourceServerId,
            resourceServerLabel: meta.label,
            resourceServerMeta: meta.meta,
            resourceServerIcon: meta.icon,
            resourceServerIconColor: meta.iconColor,
            consentDescription: input.consentDescription,
            criticality: input.criticality,
            requiresStepUp: input.requiresStepUp,
            consumers: { rolesCount: 0, appsCount: 0 },
        };

        this._data.update(data => {
            if (!data) return data;
            return { ...data, permissions: [newPermission, ...data.permissions] };
        });

        return newPermission;
    }
}
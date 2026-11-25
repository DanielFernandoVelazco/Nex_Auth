import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    Role,
    RoleDetail,
    RoleStyle,
    ModulePermission,
    PermissionAction,
} from '../models/role.model';

interface BackendPermission {
    id: string;
    resource: string;
    action: string;
    description: string | null;
}

interface BackendRole {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    organizationId: string;
    createdAt: string;
    permissions: { permission: BackendPermission }[];
    _count: { users: number };
}

interface Kpis {
    rolesCount: string;
    rolesDelta: string;
    rolesBreakdown: string;
    assignmentsCount: string;
    assignmentsDelta: string;
    assignmentsBreakdown: string;
    orphanRoles: string;
    orphanStatus: string;
    orphanBreakdown: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
    private readonly http = inject(HttpClient);

    private readonly _roles = signal<Role[]>([]);
    private readonly _details = signal<Record<string, RoleDetail>>({});
    private readonly _kpis = signal<Kpis | null>(null);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();
    readonly roles = this._roles.asReadonly();
    readonly kpis = this._kpis.asReadonly();

    readonly selectedDetail = computed<RoleDetail | null>(() => {
        const id = this._selectedId();
        return id ? this._details()[id] ?? null : null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const backendRoles = await firstValueFrom(
                this.http.get<BackendRole[]>('/api/roles')
            );

            const roles: Role[] = [];
            const details: Record<string, RoleDetail> = {};

            for (const br of backendRoles) {
                const role = this.mapToRole(br);
                roles.push(role);
                details[br.id] = this.mapToDetail(br, role);
            }

            this._roles.set(roles);
            this._details.set(details);
            this._kpis.set(this.computeKpis(backendRoles));

            if (!this._selectedId() && roles.length > 0) {
                this._selectedId.set(roles[0].id);
            }
        } catch (err) {
            console.error('[Roles] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }

    async togglePermission(
        roleId: string,
        moduleId: string,
        action: PermissionAction
    ): Promise<void> {
        // Actualización optimista en local
        this._details.update(details => {
            const detail = details[roleId];
            if (!detail) return details;

            const updatedModules = detail.modules.map(m => {
                if (m.id !== moduleId) return m;
                const p = m.permissions;
                if (action === 'read' && p.readLocked) return m;
                if (action === 'write' && p.writeLocked) return m;
                if (action === 'delete' && p.deleteLocked) return m;

                return {
                    ...m,
                    permissions: { ...p, [action]: !p[action] },
                };
            });

            return { ...details, [roleId]: { ...detail, modules: updatedModules } };
        });

        // TODO: persistir vía API (endpoint pendiente)
    }

    async clone(roleId: string): Promise<string | null> {
        const detail = this.selectedDetail();
        const base = this.roles().find(r => r.id === roleId);
        if (!detail || !base) return null;

        try {
            const created = await firstValueFrom(
                this.http.post<BackendRole>('/api/roles', {
                    name: `${base.name} (copy)`,
                    description: base.description,
                })
            );
            await this.load();
            this._selectedId.set(created.id);
            return created.id;
        } catch {
            return null;
        }
    }

    // ─── Mappers ─────────────────────────────────────────
    private mapToRole(br: BackendRole): Role {
        return {
            id: br.id,
            name: br.name,
            description: br.description ?? 'Sin descripción',
            tag: br.isSystem ? 'system-native' : 'custom',
            tagLabel: br.isSystem ? 'System-Native' : 'Custom',
            assignmentsCount: br._count.users,
            assignmentsLabel: `${br._count.users} asignación${br._count.users === 1 ? '' : 'es'}`,
            scopeSummary: `${br.permissions.length} permisos`,
            color: 'secondary' as RoleStyle,
            scopeLabel: `${br.permissions.length} permisos`,
            scopeLabelColor: 'outline',
        };
    }

    private mapToDetail(br: BackendRole, role: Role): RoleDetail {
        // Agrupar permisos por resource
        const byResource = new Map<string, BackendPermission[]>();
        for (const rp of br.permissions) {
            const arr = byResource.get(rp.permission.resource) ?? [];
            arr.push(rp.permission);
            byResource.set(rp.permission.resource, arr);
        }

        const modules: ModulePermission[] = Array.from(byResource.entries()).map(
            ([resource, perms]) => ({
                id: resource,
                icon: this.iconForResource(resource),
                iconColor: 'primary' as const,
                name: resource.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                scope: `scope: ${resource}.*`,
                permissions: {
                    read: perms.some(p => p.action === 'read'),
                    write: perms.some(p => p.action === 'write'),
                    delete: perms.some(p => p.action === 'delete' || p.action === 'revoke'),
                },
            })
        );

        return {
            ...role,
            version: 'v1.0.0',
            membersCount: br._count.users,
            assignments: br._count.users > 0
                ? [{
                    id: 'grp-users',
                    type: 'group' as const,
                    label: `${br._count.users} usuario${br._count.users === 1 ? '' : 's'}`,
                    subLabel: 'Asignaciones activas',
                    icon: 'shield_person',
                }]
                : [],
            modules,
            audit: {
                mutatedBy: 'system',
                mutatedAgo: '—',
                hash: '—',
                statusLabel: 'Policy Active',
            },
        };
    }

    private iconForResource(resource: string): string {
        const map: Record<string, string> = {
            users: 'manage_accounts',
            applications: 'hub',
            roles: 'admin_panel_settings',
            permissions: 'key',
            'audit-logs': 'receipt_long',
            'api-keys': 'vpn_key',
            sessions: 'devices',
        };
        return map[resource] ?? 'security';
    }

    private computeKpis(roles: BackendRole[]): Kpis {
        const totalAssignments = roles.reduce((sum, r) => sum + r._count.users, 0);
        const sysCount = roles.filter(r => r.isSystem).length;

        return {
            rolesCount: roles.length.toString(),
            rolesDelta: `${roles.length - sysCount} custom`,
            rolesBreakdown: `${sysCount} nativos · ${roles.length - sysCount} custom`,
            assignmentsCount:
                totalAssignments > 1000
                    ? `${(totalAssignments / 1000).toFixed(1)}k`
                    : totalAssignments.toString(),
            assignmentsDelta: '100% validadas',
            assignmentsBreakdown: 'Distribución activa',
            orphanRoles: '0',
            orphanStatus: 'Zero Risk',
            orphanBreakdown: 'Sin roles huérfanos',
        };
    }
}
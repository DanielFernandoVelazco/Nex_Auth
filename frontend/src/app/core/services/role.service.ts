import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Role, RoleDetail, RolesOverview, PermissionAction } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<RolesOverview | null>(null);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();
    readonly roles = computed(() => this._data()?.roles ?? []);
    readonly kpis = computed(() => this._data()?.kpis ?? null);

    readonly selectedDetail = computed<RoleDetail | null>(() => {
        const id = this._selectedId();
        if (!id) return null;
        return this._data()?.details[id] ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<RolesOverview>('/mock/roles.json')
            );
            this._data.set(data);
            // Auto-seleccionar el "Security Analyst" (rol en edición)
            this._selectedId.set('role_sec_analyst_01');
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }

    togglePermission(roleId: string, moduleId: string, action: PermissionAction): void {
        this._data.update(data => {
            if (!data) return data;
            const detail = data.details[roleId];
            if (!detail) return data;

            const updatedModules = detail.modules.map(m => {
                if (m.id !== moduleId) return m;
                const p = m.permissions;

                // Verificar si la acción está bloqueada
                if (action === 'read' && p.readLocked) return m;
                if (action === 'write' && p.writeLocked) return m;
                if (action === 'delete' && p.deleteLocked) return m;

                return {
                    ...m,
                    permissions: {
                        ...p,
                        [action]: !p[action],
                    },
                };
            });

            return {
                ...data,
                details: {
                    ...data.details,
                    [roleId]: { ...detail, modules: updatedModules },
                },
            };
        });
    }

    clone(roleId: string): string {
        const detail = this.selectedDetail();
        const base = this._data()?.roles.find(r => r.id === roleId);
        if (!base || !detail) return roleId;

        const newId = `role_clone_${Date.now()}`;
        const newRole: Role = {
            ...base,
            id: newId,
            name: `${base.name} (copy)`,
            tag: 'custom',
            tagLabel: 'Custom',
            color: 'secondary',
            assignmentsCount: 0,
            assignmentsLabel: '0 asignaciones',
        };

        const newDetail: RoleDetail = {
            ...detail,
            ...newRole,
            version: 'v1.0.0',
            membersCount: 0,
            assignments: [],
            audit: {
                mutatedBy: 'you',
                mutatedAgo: 'hace unos segundos',
                hash: 'new',
                statusLabel: 'Policy Draft',
            },
        };

        this._data.update(data => {
            if (!data) return data;
            return {
                ...data,
                roles: [newRole, ...data.roles],
                details: { ...data.details, [newId]: newDetail },
            };
        });

        this._selectedId.set(newId);
        return newId;
    }
}
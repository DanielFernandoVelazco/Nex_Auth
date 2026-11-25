import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    User,
    UserStatus,
    UserConnection,
    UserMfa,
    UserLastLogin,
    UserStats,
} from '../models/user.model';
import { Kpi } from '../models/kpi.model';
import { relativeTime } from '../utils/format.util';

interface BackendUser {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    status: string;
    role: { id: string; name: string } | null;
    createdAt: string;
}

interface UsersResponse {
    data: BackendUser[];
    total: number;
    page: number;
    limit: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);

    private readonly _users = signal<User[]>([]);
    private readonly _kpis = signal<Kpi[]>([]);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);
    private readonly _total = signal(0);

    readonly users = this._users.asReadonly();
    readonly kpis = this._kpis.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();
    readonly total = this._total.asReadonly();

    readonly selectedUser = computed<User | null>(() => {
        const id = this._selectedId();
        return id ? this._users().find(u => u.id === id) ?? null : null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const res = await firstValueFrom(
                this.http.get<UsersResponse>('/api/users?page=1&limit=100')
            );
            const mapped = res.data.map(u => this.mapBackendUser(u));
            this._users.set(mapped);
            this._total.set(res.total);
            this._kpis.set(this.computeKpis(mapped, res.total));
        } catch (err) {
            console.error('[Users] load failed:', err);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string | null): void {
        this._selectedId.set(id);
    }

    async blockUser(id: string): Promise<boolean> {
        try {
            await firstValueFrom(this.http.patch(`/api/users/${id}/block`, {}));
            this._users.update(list =>
                list.map(u =>
                    u.id === id
                        ? { ...u, status: 'blocked', statusLabel: 'Bloqueado', isAnomaly: true }
                        : u
                )
            );
            return true;
        } catch {
            return false;
        }
    }

    // ─── Helpers ─────────────────────────────────────────
    private mapBackendUser(u: BackendUser): User {
        const initials = u.name
            ?.split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() ?? '?';

        return {
            id: u.id,
            name: u.name ?? u.email.split('@')[0],
            email: u.email,
            roleLabel: u.role?.name?.toUpperCase().replace(/\s+/g, '-') ?? 'USER',
            roleStyle: u.role?.name?.toLowerCase().includes('admin') ? 'admin' : 'devops',
            initials,
            avatarBg: u.isActive ? 'primary' : 'error',
            online: u.isActive,
            connection: {
                type: 'database',
                label: 'AuthShield DB',
                identifier: 'Username-Password-Store',
                icon: 'database',
                iconColor: 'secondary',
            } as UserConnection,
            status: u.status as UserStatus,
            statusLabel: u.isActive ? 'Activo' : 'Bloqueado',
            isAnomaly: !u.isActive,
            mfa: {
                factor: 'totp',
                label: 'TOTP App',
                icon: 'security_update_good',
            } as UserMfa,
            lastLogin: {
                relative: relativeTime(u.createdAt),
                ip: '—',
                country: '—',
            } as UserLastLogin,
            stats: {
                sessions: '—',
                sessionsSub: '—',
                logins: '—',
                loginsSub: '—',
                created: new Date(u.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
                createdSub: new Date(u.createdAt).getFullYear().toString(),
            } as UserStats,
        };
    }

    private computeKpis(users: User[], total: number): Kpi[] {
        const active = users.filter(u => u.status === 'active').length;
        const blocked = users.filter(u => u.status === 'blocked').length;

        return [
            {
                id: 'total-identities',
                label: 'Identidades Totales',
                value: total.toLocaleString(),
                delta: `${users.length} cargadas`,
                trend: 'up',
                icon: 'groups',
                color: 'primary',
                progress: 84,
            },
            {
                id: 'active-users',
                label: 'Usuarios Activos',
                value: active.toString(),
                delta: 'Con login reciente',
                trend: 'up',
                icon: 'sensors',
                color: 'tertiary',
                footer: `${blocked} bloqueados`,
            },
            {
                id: 'roles-assigned',
                label: 'Roles Asignados',
                value: new Set(users.map(u => u.roleLabel)).size.toString(),
                delta: 'Diferentes',
                trend: 'neutral',
                icon: 'verified_user',
                color: 'secondary',
                footer: 'Distribución completa',
            },
            {
                id: 'anomalies',
                label: 'Usuarios en Riesgo',
                value: blocked.toString(),
                delta: 'Bloqueados',
                trend: 'down',
                icon: 'gpp_maybe',
                color: 'error',
                footer: 'Requieren revisión',
            },
        ];
    }
}
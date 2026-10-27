import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user.model';
import { Kpi } from '../models/kpi.model';

interface UsersMockResponse {
    kpis: Kpi[];
    users: User[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private readonly http = inject(HttpClient);

    private readonly _users = signal<User[]>([]);
    private readonly _kpis = signal<Kpi[]>([]);
    private readonly _loading = signal(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly users = this._users.asReadonly();
    readonly kpis = this._kpis.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();

    readonly selectedUser = computed<User | null>(() => {
        const id = this._selectedId();
        if (!id) return null;
        return this._users().find(u => u.id === id) ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<UsersMockResponse>('/mock/users.json')
            );
            this._users.set(data.users);
            this._kpis.set(data.kpis);
            const preselected = data.users.find(u => u.isSelected);
            if (preselected) this._selectedId.set(preselected.id);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string | null): void {
        this._selectedId.set(id);
    }

    blockUser(id: string): void {
        this._users.update(list =>
            list.map(u =>
                u.id === id
                    ? { ...u, status: 'blocked', statusLabel: 'Bloqueado', isAnomaly: true }
                    : u
            )
        );
    }
}
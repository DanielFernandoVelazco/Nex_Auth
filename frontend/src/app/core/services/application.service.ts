import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Application } from '../models/application.model';
import { Kpi } from '../models/kpi.model';

interface ApplicationsMockResponse {
    kpis: Kpi[];
    applications: Application[];
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
    private readonly http = inject(HttpClient);

    // Estado privado (solo este servicio puede escribirlo)
    private readonly _applications = signal<Application[]>([]);
    private readonly _kpis = signal<Kpi[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _selectedId = signal<string | null>(null);

    // Lectura pública (read-only para componentes)
    readonly applications = this._applications.asReadonly();
    readonly kpis = this._kpis.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<ApplicationsMockResponse>('/mock/applications.json')
            );
            this._applications.set(data.applications);
            this._kpis.set(data.kpis);

            // Auto-seleccionar la app marcada como isSelected (si existe)
            const preselected = data.applications.find(a => a.isSelected);
            if (preselected) this._selectedId.set(preselected.id);
        } finally {
            this._loading.set(false);
        }
    }

    select(id: string): void {
        this._selectedId.set(id);
    }
}
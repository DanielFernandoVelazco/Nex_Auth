import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Application } from '../models/application.model';
import { ApplicationDetail } from '../models/application-detail.model';
import { Kpi } from '../models/kpi.model';

interface ApplicationsMockResponse {
    kpis: Kpi[];
    applications: Application[];
    details: Record<string, ApplicationDetail>;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
    private readonly http = inject(HttpClient);

    private readonly _applications = signal<Application[]>([]);
    private readonly _details = signal<Record<string, ApplicationDetail>>({});
    private readonly _kpis = signal<Kpi[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _selectedId = signal<string | null>(null);

    readonly applications = this._applications.asReadonly();
    readonly kpis = this._kpis.asReadonly();
    readonly loading = this._loading.asReadonly();
    readonly selectedId = this._selectedId.asReadonly();

    /** Detalle de la app actualmente seleccionada (o null) */
    readonly selectedDetail = computed<ApplicationDetail | null>(() => {
        const id = this._selectedId();
        if (!id) return null;
        return this._details()[id] ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<ApplicationsMockResponse>('/mock/applications.json')
            );
            this._applications.set(data.applications);
            this._kpis.set(data.kpis);
            this._details.set(data.details);

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
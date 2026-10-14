import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ApplicationService } from '../../../core/services/application.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { KpiCard } from '../../../shared/components/kpi-card/kpi-card';
import { ApplicationCard } from '../components/application-card/application-card';
import { AppType } from '../../../core/models/application.model';

type FilterType = 'all' | AppType;

interface FilterOption {
  id: FilterType;
  label: string;
  count: number;
}

@Component({
  selector: 'app-applications-list',
  imports: [PageHeader, KpiCard, ApplicationCard],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.scss',
})
export class ApplicationsList implements OnInit {
  private readonly appService = inject(ApplicationService);

  // Exponer estado del servicio
  protected readonly kpis = this.appService.kpis;
  protected readonly applications = this.appService.applications;
  protected readonly loading = this.appService.loading;
  protected readonly selectedId = this.appService.selectedId;

  // Filtro local
  protected readonly activeFilter = signal<FilterType>('all');
  protected readonly searchQuery = signal<string>('');

  // Opciones de filtro con conteo dinámico
  protected readonly filters = computed<FilterOption[]>(() => {
    const apps = this.applications();
    return [
      { id: 'all', label: 'Todas', count: apps.length },
      { id: 'spa', label: 'SPA', count: apps.filter(a => a.type === 'spa').length },
      { id: 'web', label: 'Regular Web', count: apps.filter(a => a.type === 'web').length },
      { id: 'm2m', label: 'Machine-to-Machine', count: apps.filter(a => a.type === 'm2m').length },
      { id: 'native', label: 'Native Mobile', count: apps.filter(a => a.type === 'native').length },
    ];
  });

  // Lista filtrada
  protected readonly filteredApps = computed(() => {
    const filter = this.activeFilter();
    const q = this.searchQuery().trim().toLowerCase();
    return this.applications().filter(app => {
      const matchesFilter = filter === 'all' || app.type === filter;
      const matchesSearch = !q
        || app.name.toLowerCase().includes(q)
        || app.clientId.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  });

  ngOnInit(): void {
    this.appService.load();
  }

  protected setFilter(id: FilterType): void {
    this.activeFilter.set(id);
  }

  protected onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  protected onCardClick(id: string): void {
    this.appService.select(id);
  }
}
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApplicationService } from '../../../core/services/application.service';
import { ToastService } from '../../../core/services/toast.service';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { KpiCard } from '../../../shared/components/kpi-card/kpi-card';
import { ApplicationCard } from '../components/application-card/application-card';
import { ApplicationDetailPanel } from '../components/application-detail-panel/application-detail-panel';
import {
  RegisterApplicationDialog,
  RegisterApplicationResult,
} from '../components/register-application-dialog/register-application-dialog';
import { AppType } from '../../../core/models/application.model';

type FilterType = 'all' | AppType;

interface FilterOption {
  id: FilterType;
  label: string;
  count: number;
}

@Component({
  selector: 'app-applications-list',
  imports: [PageHeader, KpiCard, ApplicationCard, ApplicationDetailPanel],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.scss',
})
export class ApplicationsList implements OnInit {
  private readonly appService = inject(ApplicationService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  protected readonly kpis = this.appService.kpis;
  protected readonly applications = this.appService.applications;
  protected readonly loading = this.appService.loading;
  protected readonly selectedId = this.appService.selectedId;
  protected readonly selectedDetail = this.appService.selectedDetail;

  protected readonly activeFilter = signal<FilterType>('all');
  protected readonly searchQuery = signal<string>('');

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

  protected openRegisterDialog(): void {
    const ref = this.dialog.open(RegisterApplicationDialog, {
      width: '680px',
      maxWidth: '95vw',
      panelClass: 'nexauth-dialog',
      autoFocus: 'first-tabbable',
    });

    ref.afterClosed().subscribe((result: RegisterApplicationResult | undefined) => {
      if (!result) return;
      const app = this.appService.add(result);
      this.toast.success('Aplicación creada', `${app.name} fue registrada exitosamente.`);
    });
  }
}
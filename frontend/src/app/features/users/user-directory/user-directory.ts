import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { KpiCard } from '../../../shared/components/kpi-card/kpi-card';
import { UserRow } from '../components/user-row/user-row';
import { UserInspector } from '../components/user-inspector/user-inspector';

type StatusFilter = 'all' | 'active' | 'blocked' | 'pending';

@Component({
  selector: 'app-user-directory',
  imports: [KpiCard, UserRow, UserInspector],
  templateUrl: './user-directory.html',
  styleUrl: './user-directory.scss',
})
export class UserDirectory implements OnInit {
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  protected readonly users = this.userService.users;
  protected readonly kpis = this.userService.kpis;
  protected readonly loading = this.userService.loading;
  protected readonly selectedUser = this.userService.selectedUser;

  protected readonly searchQuery = signal('');
  protected readonly connectionFilter = signal('all');
  protected readonly roleFilter = signal('all');
  protected readonly statusFilter = signal<StatusFilter>('all');

  protected readonly filteredUsers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const conn = this.connectionFilter();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.users().filter(u => {
      const matchesSearch = !q
        || u.name.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || u.lastLogin.ip.includes(q);
      const matchesConnection = conn === 'all' || u.connection.type === conn;
      const matchesRole = role === 'all' || u.roleLabel.toLowerCase() === role;
      const matchesStatus = status === 'all' || u.status === status;
      return matchesSearch && matchesConnection && matchesRole && matchesStatus;
    });
  });

  protected readonly hasActiveFilters = computed(() =>
    this.connectionFilter() !== 'all'
    || this.roleFilter() !== 'all'
    || this.statusFilter() !== 'all'
  );

  ngOnInit(): void {
    this.userService.load();
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onConnectionFilter(event: Event): void {
    this.connectionFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onRoleFilter(event: Event): void {
    this.roleFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as StatusFilter);
  }

  protected resetFilters(): void {
    this.connectionFilter.set('all');
    this.roleFilter.set('all');
    this.statusFilter.set('all');
    this.searchQuery.set('');
    this.toast.info('Filtros restablecidos');
  }

  protected onRowClick(id: string): void {
    this.userService.select(id);
  }

  protected closeInspector(): void {
    this.userService.select(null);
  }

  protected createUser(): void {
    this.toast.info('Crear usuario', 'Formulario próximamente disponible.');
  }

  protected importUsers(): void {
    this.toast.info('Importar CSV/JSON', 'Sube un archivo para importar identidades.');
  }

  protected exportUsers(): void {
    this.toast.success('Exportación iniciada', 'Recibirás el CSV por email.');
  }
}
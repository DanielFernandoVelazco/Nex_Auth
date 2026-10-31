import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PermissionService, RegisterPermissionInput } from '../../../core/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';
import { PermissionRow } from '../components/permission-row/permission-row';
import {
  RegisterPermissionDialog,
} from '../components/register-permission-dialog/register-permission-dialog';
import { ResourceServerId } from '../../../core/models/permission.model';

type FilterId = 'ALL' | ResourceServerId;

@Component({
  selector: 'app-permissions-list',
  imports: [PermissionRow],
  templateUrl: './permissions-list.html',
  styleUrl: './permissions-list.scss',
})
export class PermissionsList implements OnInit {
  private readonly permService = inject(PermissionService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  protected readonly kpis = this.permService.kpis;
  protected readonly risk = this.permService.riskDistribution;
  protected readonly permissions = this.permService.permissions;
  protected readonly jwtPreviewJson = this.permService.jwtPreviewJson;
  protected readonly jwtKid = this.permService.jwtKid;
  protected readonly policies = this.permService.policies;
  protected readonly loading = this.permService.loading;

  protected readonly activeFilter = signal<FilterId>('ALL');
  protected readonly searchQuery = signal('');
  protected readonly onlyCritical = signal(false);

  protected readonly filters = computed(() => {
    const apps = this.permissions();
    return [
      { id: 'ALL' as FilterId, label: 'Todos', count: apps.length },
      { id: 'USER_MGMT' as FilterId, label: 'User Management API', count: apps.filter(p => p.resourceServerId === 'USER_MGMT').length },
      { id: 'BILLING' as FilterId, label: 'Billing Gateway', count: apps.filter(p => p.resourceServerId === 'BILLING').length },
      { id: 'AUDIT' as FilterId, label: 'Audit Stream API', count: apps.filter(p => p.resourceServerId === 'AUDIT').length },
      { id: 'AUTH_CORE' as FilterId, label: 'Auth Engine Core', count: apps.filter(p => p.resourceServerId === 'AUTH_CORE').length },
    ];
  });

  protected readonly filteredPermissions = computed(() => {
    const filter = this.activeFilter();
    const q = this.searchQuery().trim().toLowerCase();
    const criticalOnly = this.onlyCritical();

    return this.permissions().filter(p => {
      const matchesFilter = filter === 'ALL' || p.resourceServerId === filter;
      const matchesSearch = !q
        || p.scopeIdentifier.toLowerCase().includes(q)
        || p.urnIdentifier.toLowerCase().includes(q)
        || p.resourceServerLabel.toLowerCase().includes(q);
      const matchesCritical = !criticalOnly || p.criticality === 'high';
      return matchesFilter && matchesSearch && matchesCritical;
    });
  });

  ngOnInit(): void {
    this.permService.load();
  }

  protected setFilter(id: FilterId): void {
    this.activeFilter.set(id);
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected toggleCriticalOnly(): void {
    this.onlyCritical.update(v => !v);
  }

  protected exportSpec(): void {
    this.toast.success('Spec exportado', 'Se descargó el archivo openid-configuration.json');
  }

  protected openRegisterDialog(): void {
    const ref = this.dialog.open(RegisterPermissionDialog, {
      width: '720px',
      maxWidth: '95vw',
      panelClass: 'nexauth-dialog',
      autoFocus: 'first-tabbable',
    });

    ref.afterClosed().subscribe((result: RegisterPermissionInput | undefined) => {
      if (!result) return;
      const created = this.permService.add(result);
      this.toast.success('Permiso registrado', `Scope "${created.scopeIdentifier}" fue indexado.`);
    });
  }

  protected openPolicyManager(): void {
    this.toast.info('Matriz de seguridad', 'Configuración próximamente disponible.');
  }

  protected copyJwt(): void {
    navigator.clipboard.writeText(this.jwtPreviewJson()).then(() => {
      this.toast.success('JWT copiado al portapapeles');
    });
  }
}
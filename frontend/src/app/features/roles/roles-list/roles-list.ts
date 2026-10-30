import { Component, inject, OnInit } from '@angular/core';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { RoleListItem } from '../components/role-list-item/role-list-item';
import { PermissionToggle } from '../components/permission-toggle/permission-toggle';
import { PermissionAction } from '../../../core/models/role.model';

@Component({
  selector: 'app-roles-list',
  imports: [RoleListItem, PermissionToggle],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss',
})
export class RolesList implements OnInit {
  private readonly roleService = inject(RoleService);
  private readonly toast = inject(ToastService);

  protected readonly roles = this.roleService.roles;
  protected readonly kpis = this.roleService.kpis;
  protected readonly selectedId = this.roleService.selectedId;
  protected readonly selectedDetail = this.roleService.selectedDetail;
  protected readonly loading = this.roleService.loading;

  ngOnInit(): void {
    this.roleService.load();
  }

  protected selectRole(id: string): void {
    this.roleService.select(id);
  }

  protected togglePermission(moduleId: string, action: PermissionAction): void {
    const role = this.selectedDetail();
    if (!role) return;
    this.roleService.togglePermission(role.id, moduleId, action);
  }

  protected cloneRole(): void {
    const current = this.selectedDetail();
    if (!current) return;
    const newId = this.roleService.clone(current.id);
    this.toast.success('Rol clonado', `Se creó "${current.name} (copy)" como borrador.`);
  }

  protected saveChanges(): void {
    const role = this.selectedDetail();
    if (!role) return;
    this.toast.success('Cambios guardados', `El rol "${role.name}" fue actualizado.`);
  }

  protected exportMatrix(): void {
    this.toast.success('Matriz exportada', 'Recibirás el archivo Excel por email.');
  }

  protected createRole(): void {
    this.toast.info('Crear rol', 'Formulario próximamente disponible.');
  }

  protected copyRoleId(): void {
    const role = this.selectedDetail();
    if (!role) return;
    navigator.clipboard.writeText(role.id).then(() => {
      this.toast.success('ID copiado', role.id);
    });
  }

  protected assignEntity(): void {
    this.toast.info('Asignar entidad', 'Selecciona usuarios o grupos.');
  }
}
import { Component, input, output, computed } from '@angular/core';
import { Role, RoleStyle } from '../../../../core/models/role.model';

@Component({
  selector: 'app-role-list-item',
  imports: [],
  templateUrl: './role-list-item.html',
  styleUrl: './role-list-item.scss',
})
export class RoleListItem {
  readonly role = input.required<Role>();
  readonly selected = input<boolean>(false);
  readonly clicked = output<string>();

  protected readonly dotClass = computed(() => {
    const map: Record<RoleStyle, string> = {
      error: 'bg-error',
      secondary: 'bg-secondary-container',
      tertiary: 'bg-tertiary-fixed-dim',
      outline: 'bg-outline',
    };
    return map[this.role().color];
  });

  protected readonly tagClass = computed(() => {
    if (this.selected()) {
      return 'bg-primary-fixed text-on-primary-fixed font-medium';
    }
    return 'bg-surface-container-high text-on-surface-variant';
  });

  protected readonly scopeClass = computed(() => {
    const map = {
      tertiary: 'text-tertiary-container',
      error: 'text-error',
      outline: 'text-outline',
    };
    return map[this.role().scopeLabelColor];
  });

  protected onClick(): void {
    this.clicked.emit(this.role().id);
  }
}
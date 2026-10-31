import { Component, input, computed } from '@angular/core';
import { Permission } from '../../../../core/models/permission.model';
import { CopyButton } from '../../../../shared/components/copy-button/copy-button';

@Component({
  selector: 'app-permission-row',
  imports: [CopyButton],
  templateUrl: './permission-row.html',
  styleUrl: './permission-row.scss',
})
export class PermissionRow {
  readonly permission = input.required<Permission>();

  protected readonly isHigh = computed(() => this.permission().criticality === 'high');

  protected readonly rowClass = computed(() =>
    this.isHigh()
      ? 'bg-error-container/5 hover:bg-error-container/20'
      : 'hover:bg-surface-container-low/70'
  );

  protected readonly scopeCodeClass = computed(() =>
    this.isHigh()
      ? 'text-error font-bold bg-error-container'
      : 'text-primary font-semibold bg-surface-container'
  );

  protected readonly urnClass = computed(() =>
    this.isHigh() ? 'text-error/80' : 'text-outline'
  );

  protected readonly criticalityBadgeClass = computed(() => {
    switch (this.permission().criticality) {
      case 'high':
        return 'bg-error-container text-on-error-container font-bold shadow-sm';
      case 'medium':
        return 'bg-surface-container text-on-surface font-semibold';
      case 'low':
        return 'bg-surface-container text-tertiary font-semibold';
    }
  });

  protected readonly criticalityDotClass = computed(() => {
    switch (this.permission().criticality) {
      case 'high':
        return 'bg-error animate-pulse';
      case 'medium':
        return 'bg-secondary-container';
      case 'low':
        return 'bg-tertiary';
    }
  });

  protected readonly criticalityLabel = computed(() => {
    switch (this.permission().criticality) {
      case 'high': return 'Sensible / Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
    }
  });

  protected readonly resourceIconColorClass = computed(() => {
    const map = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      tertiary: 'text-tertiary',
      outline: 'text-outline',
    };
    return map[this.permission().resourceServerIconColor];
  });
}
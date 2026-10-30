import { Component, input, output, computed } from '@angular/core';
import { MfaFactor, MfaFactorIconColor } from '../../../../core/models/security.model';

@Component({
  selector: 'app-mfa-factor-card',
  imports: [],
  templateUrl: './mfa-factor-card.html',
  styleUrl: './mfa-factor-card.scss',
})
export class MfaFactorCard {
  readonly factor = input.required<MfaFactor>();
  readonly toggled = output<string>();
  readonly downloadRequested = output<string>();

  protected readonly iconBgClass = computed(() => {
    const map: Record<MfaFactorIconColor, string> = {
      primary: 'bg-surface-container text-primary',
      secondary: 'bg-surface-container text-secondary',
      tertiary: 'bg-surface-container text-tertiary',
      error: 'bg-surface-container text-error',
    };
    return map[this.factor().iconColor];
  });

  protected readonly badgeClass = computed(() => {
    const map = {
      success: 'bg-tertiary-fixed text-on-tertiary-fixed',
      danger: 'bg-error-container text-on-error-container',
      neutral: 'bg-surface-container text-on-surface-variant',
    };
    return map[this.factor().badgeStyle];
  });

  protected readonly enabledLabelClass = computed(() => {
    const map = {
      success: 'text-tertiary',
      neutral: 'text-outline',
      primary: 'text-primary',
    };
    return map[this.factor().enabledLabelColor];
  });

  protected toggle(): void {
    this.toggled.emit(this.factor().id);
  }

  protected download(): void {
    this.downloadRequested.emit(this.factor().id);
  }
}
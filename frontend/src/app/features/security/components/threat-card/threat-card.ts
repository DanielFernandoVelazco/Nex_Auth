import { Component, input, output, computed } from '@angular/core';
import { ThreatCard as ThreatCardModel } from '../../../../core/models/security.model';

@Component({
  selector: 'app-threat-card',
  imports: [],
  templateUrl: './threat-card.html',
  styleUrl: './threat-card.scss',
})
export class ThreatCard {
  readonly threat = input.required<ThreatCardModel>();
  readonly toggled = output<string>();

  protected readonly iconColorClass = computed(() => {
    const map = {
      error: 'text-error',
      primary: 'text-primary',
      secondary: 'text-secondary-container',
    };
    return map[this.threat().iconColor];
  });

  protected readonly footerValueClass = computed(() => {
    const map = {
      success: 'text-tertiary',
      neutral: 'text-outline',
      error: 'text-error',
    };
    return map[this.threat().footerValueColor];
  });

  protected toggle(): void {
    this.toggled.emit(this.threat().id);
  }
}
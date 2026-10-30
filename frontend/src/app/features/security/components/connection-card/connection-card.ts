import { Component, input, output, computed } from '@angular/core';
import { SocialConnection } from '../../../../core/models/security.model';

@Component({
  selector: 'app-connection-card',
  imports: [],
  templateUrl: './connection-card.html',
  styleUrl: './connection-card.scss',
})
export class ConnectionCard {
  readonly connection = input.required<SocialConnection>();
  readonly toggled = output<string>();

  protected readonly containerClass = computed(() =>
    this.connection().isDisabledStyle
      ? 'opacity-80 hover:opacity-100 transition-opacity'
      : ''
  );

  protected toggle(): void {
    this.toggled.emit(this.connection().id);
  }
}
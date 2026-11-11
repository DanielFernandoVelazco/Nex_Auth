import { Component, input, output, computed } from '@angular/core';
import { SessionRow as SessionModel } from '../../../../core/models/session.model';

@Component({
  selector: 'app-session-row',
  imports: [],
  templateUrl: './session-row.html',
  styleUrl: './session-row.scss',
})
export class SessionRow {
  readonly session = input.required<SessionModel>();
  readonly selected = input<boolean>(false);
  readonly clicked = output<string>();

  protected readonly avatarClass = computed(() => {
    const map = {
      primary: 'bg-primary-container text-on-primary',
      secondary: 'bg-secondary-fixed text-on-secondary-fixed',
      error: 'bg-error-container text-on-error-container',
    };
    return map[this.session().avatarBg];
  });

  protected readonly rowClass = computed(() => {
    if (this.session().geo.isAnomaly) return 'bg-error-container/10 hover:bg-error-container/20';
    if (this.selected()) return 'bg-surface-container-high/40';
    return 'hover:bg-surface-container-low';
  });

  protected readonly authIconClass = computed(() => {
    const map = {
      primary: 'text-primary',
      secondary: 'text-secondary',
      tertiary: 'text-tertiary',
    };
    return map[this.session().authMethod.iconColor];
  });

  protected onClick(): void {
    this.clicked.emit(this.session().id);
  }
}
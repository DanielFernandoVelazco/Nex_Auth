import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-permission-toggle',
  imports: [],
  templateUrl: './permission-toggle.html',
  styleUrl: './permission-toggle.scss',
})
export class PermissionToggle {
  readonly label = input.required<string>();
  readonly enabled = input<boolean>(false);
  readonly locked = input<boolean>(false);
  readonly lockedReason = input<string>('');
  readonly danger = input<boolean>(false);    // color rojo para "Revocación"
  readonly toggled = output<void>();

  protected onClick(): void {
    if (this.locked()) return;
    this.toggled.emit();
  }
}
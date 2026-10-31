import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GenerateKeyInput } from '../../../../core/services/api-key.service';
import { ApiKeyEnv } from '../../../../core/models/api-key.model';

@Component({
  selector: 'app-generate-key-dialog',
  imports: [],
  templateUrl: './generate-key-dialog.html',
  styleUrl: './generate-key-dialog.scss',
})
export class GenerateKeyDialog {
  private readonly dialogRef = inject(MatDialogRef<GenerateKeyDialog>);

  protected readonly serviceName = signal('');
  protected readonly environment = signal<ApiKeyEnv>('production');
  protected readonly expiryDays = signal(90);
  protected readonly scopes = signal<string[]>(['users:read', 'auth:validate_token']);

  protected readonly availableScopes = [
    'users:read',
    'users:write',
    'auth:validate_token',
    'keys:rotate',
    'telemetry:write',
    'deploy:write',
  ];

  protected readonly isValid = computed(() => this.serviceName().trim().length > 0);

  protected onNameInput(event: Event): void {
    this.serviceName.set((event.target as HTMLInputElement).value);
  }

  protected setEnv(env: ApiKeyEnv): void {
    this.environment.set(env);
  }

  protected onExpiryChange(event: Event): void {
    this.expiryDays.set(Number((event.target as HTMLSelectElement).value));
  }

  protected toggleScope(scope: string): void {
    this.scopes.update(list =>
      list.includes(scope) ? list.filter(s => s !== scope) : [...list, scope]
    );
  }

  protected isScopeChecked(scope: string): boolean {
    return this.scopes().includes(scope);
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected submit(): void {
    if (!this.isValid()) return;
    const result: GenerateKeyInput = {
      serviceName: this.serviceName().trim(),
      environment: this.environment(),
      expiryDays: this.expiryDays(),
      scopes: this.scopes(),
    };
    this.dialogRef.close(result);
  }
}
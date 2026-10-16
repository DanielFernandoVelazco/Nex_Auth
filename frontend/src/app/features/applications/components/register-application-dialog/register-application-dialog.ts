import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AppType } from '../../../../core/models/application.model';

export interface RegisterApplicationResult {
  name: string;
  type: AppType;
  domain: string;
  scopes: string[];
}

interface TypeOption {
  id: AppType;
  label: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-register-application-dialog',
  imports: [],
  templateUrl: './register-application-dialog.html',
  styleUrl: './register-application-dialog.scss',
})
export class RegisterApplicationDialog {
  private readonly dialogRef = inject(MatDialogRef<RegisterApplicationDialog>);

  protected readonly name = signal('');
  protected readonly type = signal<AppType>('spa');
  protected readonly domain = signal('');
  protected readonly selectedScopes = signal<string[]>(['openid', 'profile', 'email']);

  protected readonly typeOptions: TypeOption[] = [
    { id: 'spa', label: 'SPA', description: 'React / Vue / Angular', icon: 'web' },
    { id: 'web', label: 'Regular Web', description: 'Server-rendered app', icon: 'language' },
    { id: 'm2m', label: 'M2M', description: 'Service / backend', icon: 'dns' },
    { id: 'native', label: 'Native', description: 'iOS / Android', icon: 'smartphone' },
  ];

  protected readonly availableScopes = signal([
    'openid', 'profile', 'email', 'offline_access',
    'read:users', 'write:users', 'read:audit', 'write:config',
  ]);

  protected readonly isValid = computed(() => this.name().trim().length > 0);

  protected isScopeSelected(scope: string): boolean {
    return this.selectedScopes().includes(scope);
  }

  protected toggleScope(scope: string): void {
    this.selectedScopes.update(list =>
      list.includes(scope)
        ? list.filter(s => s !== scope)
        : [...list, scope]
    );
  }

  protected onNameInput(event: Event): void {
    this.name.set((event.target as HTMLInputElement).value);
  }

  protected onDomainInput(event: Event): void {
    this.domain.set((event.target as HTMLInputElement).value);
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected submit(): void {
    if (!this.isValid()) return;
    const result: RegisterApplicationResult = {
      name: this.name().trim(),
      type: this.type(),
      domain: this.domain().trim(),
      scopes: this.selectedScopes(),
    };
    this.dialogRef.close(result);
  }
}
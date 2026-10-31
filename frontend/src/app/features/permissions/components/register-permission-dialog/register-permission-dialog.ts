import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { RegisterPermissionInput } from '../../../../core/services/permission.service';
import { PermissionCriticality, ResourceServerId } from '../../../../core/models/permission.model';

interface ResourceOption {
  id: ResourceServerId;
  label: string;
  url: string;
}

@Component({
  selector: 'app-register-permission-dialog',
  imports: [],
  templateUrl: './register-permission-dialog.html',
  styleUrl: './register-permission-dialog.scss',
})
export class RegisterPermissionDialog {
  private readonly dialogRef = inject(MatDialogRef<RegisterPermissionDialog>);

  protected readonly scopeIdentifier = signal('');
  protected readonly resourceServerId = signal<ResourceServerId>('USER_MGMT');
  protected readonly consentDescription = signal('');
  protected readonly criticality = signal<PermissionCriticality>('low');
  protected readonly requiresStepUp = signal(false);

  protected readonly resources: ResourceOption[] = [
    { id: 'USER_MGMT', label: 'User Management API', url: 'https://api.nexauth.corp/v2/users' },
    { id: 'BILLING', label: 'Billing Gateway', url: 'https://billing.nexauth.corp/gateway' },
    { id: 'AUDIT', label: 'Audit Stream API', url: 'https://audit.nexauth.corp/stream' },
    { id: 'AUTH_CORE', label: 'Auth Engine Core', url: 'https://auth.corp.nexauth.io/core' },
  ];

  protected readonly isValid = computed(() =>
    this.scopeIdentifier().trim().length > 0 && this.consentDescription().trim().length > 0
  );

  protected onScopeInput(event: Event): void {
    this.scopeIdentifier.set((event.target as HTMLInputElement).value);
  }

  protected onResourceChange(event: Event): void {
    this.resourceServerId.set((event.target as HTMLSelectElement).value as ResourceServerId);
  }

  protected onConsentInput(event: Event): void {
    this.consentDescription.set((event.target as HTMLTextAreaElement).value);
  }

  protected setCriticality(value: PermissionCriticality): void {
    this.criticality.set(value);
  }

  protected toggleStepUp(): void {
    this.requiresStepUp.update(v => !v);
  }

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected submit(): void {
    if (!this.isValid()) return;
    const result: RegisterPermissionInput = {
      scopeIdentifier: this.scopeIdentifier().trim(),
      resourceServerId: this.resourceServerId(),
      consentDescription: this.consentDescription().trim(),
      criticality: this.criticality(),
      requiresStepUp: this.requiresStepUp(),
    };
    this.dialogRef.close(result);
  }
}
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiKeyService, GenerateKeyInput } from '../../../core/services/api-key.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiKeyEnv } from '../../../core/models/api-key.model';
import { GenerateKeyDialog } from '../components/generate-key-dialog/generate-key-dialog';

type EnvFilter = 'all' | ApiKeyEnv;

@Component({
  selector: 'app-api-keys-list',
  imports: [],
  templateUrl: './api-keys-list.html',
  styleUrl: './api-keys-list.scss',
})
export class ApiKeysList implements OnInit {
  private readonly apiKeyService = inject(ApiKeyService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  protected readonly kpis = this.apiKeyService.kpis;
  protected readonly keys = this.apiKeyService.keys;
  protected readonly liveLogs = this.apiKeyService.liveLogs;
  protected readonly loading = this.apiKeyService.loading;

  protected readonly searchQuery = signal('');
  protected readonly envFilter = signal<EnvFilter>('all');
  protected readonly liveStreamOpen = signal(false);

  protected readonly filteredKeys = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const env = this.envFilter();
    return this.keys().filter(k => {
      const matchesSearch = !q
        || k.serviceName.toLowerCase().includes(q)
        || k.serviceId.toLowerCase().includes(q)
        || k.keyPrefix.toLowerCase().includes(q);
      const matchesEnv = env === 'all' || k.environment === env;
      return matchesSearch && matchesEnv;
    });
  });

  protected readonly envCounts = computed(() => {
    const all = this.keys();
    return {
      all: all.length,
      production: all.filter(k => k.environment === 'production').length,
      staging: all.filter(k => k.environment === 'staging').length,
    };
  });

  ngOnInit(): void {
    this.apiKeyService.load();
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected setEnvFilter(env: EnvFilter): void {
    this.envFilter.set(env);
  }

  protected toggleLiveStream(): void {
    this.liveStreamOpen.update(v => !v);
  }

  protected copyValue(value: string, label: string): void {
    navigator.clipboard.writeText(value).then(() => {
      this.toast.success(`${label} copiado`, value);
    });
  }

  protected generateKey(): void {
    const ref = this.dialog.open(GenerateKeyDialog, {
      width: '640px',
      maxWidth: '95vw',
      panelClass: 'nexauth-dialog',
      autoFocus: 'first-tabbable',
    });

    ref.afterClosed().subscribe((result: GenerateKeyInput | undefined) => {
      if (!result) return;
      const key = this.apiKeyService.generate(result);
      this.toast.success(
        'API Key generada',
        `${key.serviceName} · ${key.keyPrefix}`
      );
    });
  }

  protected rotateKey(keyId: string, serviceName: string): void {
    this.toast.info('Rotando secreto...', serviceName);
    setTimeout(() => {
      this.toast.success('Secreto rotado', `${serviceName} fue actualizado.`);
    }, 1200);
  }

  protected editPermissions(serviceName: string): void {
    this.toast.info('Editar permisos', serviceName);
  }

  protected revokeKey(id: string, serviceName: string): void {
    const confirmed = confirm(`¿Revocar inmediatamente "${serviceName}"? Esta acción invalida el token al instante.`);
    if (!confirmed) return;
    this.apiKeyService.revoke(id);
    this.toast.success('Clave revocada', serviceName);
  }

  protected triggerAction(action: string, serviceName: string): void {
    this.toast.info(action, serviceName);
  }
}
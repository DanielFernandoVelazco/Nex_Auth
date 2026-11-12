import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
    TenantSettings,
    EmailTemplateId,
    EmailProvider,
} from '../models/tenant.model';

@Injectable({ providedIn: 'root' })
export class TenantService {
    private readonly http = inject(HttpClient);

    private readonly _data = signal<TenantSettings | null>(null);
    private readonly _loading = signal(false);
    private readonly _activeTemplate = signal<EmailTemplateId>('otp');
    private readonly _hasChanges = signal(false);

    readonly loading = this._loading.asReadonly();
    readonly identity = computed(() => this._data()?.identity ?? null);
    readonly session = computed(() => this._data()?.session ?? null);
    readonly email = computed(() => this._data()?.email ?? null);
    readonly health = computed(() => this._data()?.systemHealth ?? null);
    readonly activeTemplate = this._activeTemplate.asReadonly();
    readonly hasChanges = this._hasChanges.asReadonly();

    readonly activeTemplateObj = computed(() => {
        const email = this.email();
        if (!email) return null;
        return email.templates.find(t => t.id === this._activeTemplate()) ?? null;
    });

    async load(): Promise<void> {
        this._loading.set(true);
        try {
            const data = await firstValueFrom(
                this.http.get<TenantSettings>('/mock/tenant-settings.json')
            );
            this._data.set(data);
            this._activeTemplate.set(data.email.templates[0]?.id ?? 'otp');
        } finally {
            this._loading.set(false);
        }
    }

    setTemplate(id: EmailTemplateId): void {
        this._activeTemplate.set(id);
    }

    updateOrganizationName(name: string): void {
        this._data.update(d => {
            if (!d) return d;
            return { ...d, identity: { ...d.identity, organizationName: name } };
        });
        this._hasChanges.set(true);
    }

    updateEmailProvider(provider: EmailProvider): void {
        this._data.update(d => {
            if (!d) return d;
            return { ...d, email: { ...d.email, provider } };
        });
        this._hasChanges.set(true);
    }

    toggleBackchannelLogout(): void {
        this._data.update(d => {
            if (!d) return d;
            return {
                ...d,
                session: { ...d.session, backchannelLogout: !d.session.backchannelLogout },
            };
        });
        this._hasChanges.set(true);
    }

    save(): void {
        this._hasChanges.set(false);
    }

    discard(): void {
        this.load();
        this._hasChanges.set(false);
    }
}
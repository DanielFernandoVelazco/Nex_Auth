import { Component, input, signal, computed, inject, output } from '@angular/core';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../core/services/user.service';
import { ToastService } from '../../../../core/services/toast.service';

type TabId = 'identities' | 'metadata' | 'audit';

interface Tab {
    id: TabId;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-user-inspector',
    imports: [],
    templateUrl: './user-inspector.html',
    styleUrl: './user-inspector.scss',
})
export class UserInspector {
    private readonly userService = inject(UserService);
    private readonly toast = inject(ToastService);

    readonly user = input.required<User>();
    readonly close = output<void>();

    protected readonly activeTab = signal<TabId>('identities');
    protected readonly quickActionsOpen = signal(false);

    protected readonly tabs: Tab[] = [
        { id: 'identities', label: 'Identidades', icon: 'fingerprint' },
        { id: 'metadata', label: 'Metadata', icon: 'data_object' },
        { id: 'audit', label: 'Auditoría', icon: 'receipt_long' },
    ];

    /** Metadata JSON como string — evita conflicto con interpolación Angular */
    protected readonly metadataJson = `{
  "app_metadata": {
    "tenant_id": "acme-prod-01",
    "roles": [
      "iam:superadmin",
      "sec:auditor"
    ],
    "enforce_mfa": true
  },
  "user_metadata": {
    "preferred_language": "es-ES",
    "department": "Information Security"
  }
}`;

    protected readonly roleClass = computed(() => {
        const map: Record<User['roleStyle'], string> = {
            admin: 'bg-primary-container text-on-primary',
            devops: 'bg-surface-container text-on-surface-variant',
            product: 'bg-surface-container text-on-surface-variant',
            external: 'bg-surface-container text-on-surface-variant',
            quarantine: 'bg-error-container text-on-error-container font-bold',
        };
        return map[this.user().roleStyle];
    });

    protected setTab(id: TabId): void {
        this.activeTab.set(id);
    }

    protected toggleQuickActions(): void {
        this.quickActionsOpen.update(v => !v);
    }

    protected closeDrawer(): void {
        this.close.emit();
    }

    protected copyUserId(): void {
        navigator.clipboard.writeText(this.user().email).then(() => {
            this.toast.success('Email copiado', this.user().email);
        });
    }

    protected sendPasswordReset(): void {
        this.toast.success('Restablecimiento enviado', `Email enviado a ${this.user().email}`);
        this.quickActionsOpen.set(false);
    }

    protected unlinkMfa(): void {
        this.toast.info('Factores MFA desvinculados', 'El usuario deberá re-enrolarse.');
        this.quickActionsOpen.set(false);
    }

    protected revokeSessions(): void {
        this.toast.success('Sesiones revocadas', 'Todas las sesiones activas fueron cerradas.');
        this.quickActionsOpen.set(false);
    }

    protected blockAccount(): void {
        const confirmed = confirm(`¿Bloquear la cuenta de ${this.user().name}?`);
        if (!confirmed) return;
        this.userService.blockUser(this.user().id);
        this.toast.success('Cuenta bloqueada', `${this.user().name} ya no puede iniciar sesión.`);
        this.quickActionsOpen.set(false);
    }
}
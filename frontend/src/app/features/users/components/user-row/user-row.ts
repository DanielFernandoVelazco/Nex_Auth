import { Component, input, output, computed } from '@angular/core';
import { User, UserStatus, MfaFactor } from '../../../../core/models/user.model';
import { StatusBadge, BadgeVariant } from '../../../../shared/components/status-badge/status-badge';

@Component({
    selector: 'app-user-row',
    imports: [StatusBadge],
    templateUrl: './user-row.html',
    styleUrl: './user-row.scss',
})
export class UserRow {
    readonly user = input.required<User>();
    readonly selected = input<boolean>(false);
    readonly rowClick = output<string>();

    protected readonly badgeVariant = computed<BadgeVariant>(() => {
        const s = this.user().status;
        if (s === 'active') return 'success';
        if (s === 'blocked' || s === 'quarantine') return 'danger';
        return 'warning';
    });

    protected readonly roleClass = computed(() => {
        const map: Record<User['roleStyle'], string> = {
            admin: 'bg-primary-fixed text-on-primary-fixed',
            devops: 'bg-surface-container-high text-on-surface-variant',
            product: 'bg-surface-container-high text-on-surface-variant',
            external: 'bg-surface-container-high text-on-surface-variant',
            quarantine: 'bg-error-container text-on-error-container font-bold',
        };
        return map[this.user().roleStyle];
    });

    protected readonly connectionIconClass = computed(() => {
        const map: Record<string, string> = {
            primary: 'text-primary',
            secondary: 'text-secondary',
            outline: 'text-outline',
            error: 'text-error',
            neutral: 'text-on-surface',
        };
        return map[this.user().connection.iconColor];
    });

    protected readonly avatarBgClass = computed(() => {
        const bg = this.user().avatarBg ?? 'secondary';
        const map: Record<'primary' | 'secondary' | 'error', string> = {
            primary: 'bg-primary-container text-on-primary',
            secondary: 'bg-secondary-fixed text-on-secondary-fixed',
            error: 'bg-error-container text-on-error-container',
        };
        return map[bg];
    });

    protected readonly mfaIconClass = computed(() => {
        const map: Record<MfaFactor, string> = {
            passkey: 'text-primary',
            totp: 'text-tertiary-container',
            sms: 'text-outline',
            yubikey: 'text-primary',
            revoked: 'text-error',
            null: 'text-outline',
        };
        return map[this.user().mfa.factor];
    });

    protected onClick(): void {
        this.rowClick.emit(this.user().id);
    }
}


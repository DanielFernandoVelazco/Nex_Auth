import { Component, computed, input } from '@angular/core';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
    selector: 'app-status-badge',
    imports: [],
    templateUrl: './status-badge.html',
    styleUrl: './status-badge.scss',
})
export class StatusBadge {
    readonly label = input.required<string>();
    readonly variant = input<BadgeVariant>('neutral');
    readonly withDot = input<boolean>(true);

    protected readonly containerClass = computed(() => {
        const map: Record<BadgeVariant, string> = {
            success: 'bg-tertiary-container/10 text-tertiary',
            warning: 'bg-surface-container-highest text-secondary-container',
            danger: 'bg-error-container text-on-error-container',
            info: 'bg-primary-fixed text-on-primary-fixed',
            neutral: 'bg-surface-container text-on-surface-variant',
        };
        return map[this.variant()];
    });

    protected readonly dotClass = computed(() => {
        const map: Record<BadgeVariant, string> = {
            success: 'bg-tertiary-container',
            warning: 'bg-secondary-container',
            danger: 'bg-error',
            info: 'bg-primary',
            neutral: 'bg-outline',
        };
        return map[this.variant()];
    });
}
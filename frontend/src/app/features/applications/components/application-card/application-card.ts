import { Component, computed, input, output } from '@angular/core';
import { Application, AppIconColor } from '../../../../core/models/application.model';
import { CopyButton } from '../../../../shared/components/copy-button/copy-button';
import { StatusBadge } from '../../../../shared/components/status-badge/status-badge';

@Component({
    selector: 'app-application-card',
    imports: [CopyButton, StatusBadge],
    templateUrl: './application-card.html',
    styleUrl: './application-card.scss',
})
export class ApplicationCard {
    readonly app = input.required<Application>();
    readonly selected = input<boolean>(false);
    readonly cardClick = output<string>();

    protected readonly iconColorClass = computed(() => {
        const map: Record<AppIconColor, string> = {
            'primary': 'text-primary',
            'secondary': 'text-secondary',
            'tertiary': 'text-tertiary',
            'outline': 'text-outline',
            'primary-container': 'text-primary-container',
        };
        return map[this.app().iconColor];
    });

    protected readonly isActive = computed(() => this.app().status === 'active');
    protected readonly isStaging = computed(() => this.app().status === 'staging');

    protected onClick(): void {
        this.cardClick.emit(this.app().id);
    }
}
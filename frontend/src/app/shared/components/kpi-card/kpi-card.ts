import { Component, computed, input } from '@angular/core';
import { Kpi, KpiColor } from '../../../core/models/kpi.model';

@Component({
    selector: 'app-kpi-card',
    imports: [],
    templateUrl: './kpi-card.html',
    styleUrl: './kpi-card.scss',
})
export class KpiCard {
    readonly kpi = input.required<Kpi>();

    /** Mapeo color → clases Tailwind para el icon container */
    protected readonly iconColorClass = computed(() => {
        const map: Record<KpiColor, string> = {
            primary: 'bg-surface-container-low text-primary',
            secondary: 'bg-surface-container-low text-secondary',
            tertiary: 'bg-surface-container-low text-tertiary-container',
            error: 'bg-error-container text-error',
        };
        return map[this.kpi().color ?? 'primary'];
    });

    /** Mapeo trend → clases para el delta */
    protected readonly deltaClass = computed(() => {
        const kpi = this.kpi();
        if (kpi.trend === 'up') {
            return 'text-tertiary-container';
        }
        if (kpi.trend === 'down') {
            return 'text-error';
        }
        return 'text-on-surface-variant';
    });

    protected readonly progressWidth = computed(() =>
        `${this.kpi().progress ?? 0}%`
    );
}
import { Component, computed, input } from '@angular/core';

@Component({
    selector: 'app-live-metrics',
    imports: [],
    templateUrl: './live-metrics.html',
    styleUrl: './live-metrics.scss',
})
export class LiveMetrics {
    /** Porcentaje de éxito (0-100) */
    readonly successRate = input.required<number>();

    /** Total de PKCE code exchanges */
    readonly pkceExchanges = input.required<number>();

    /** Total de refresh token grants */
    readonly refreshGrants = input.required<number>();

    /** % PKCE sobre el total (calculado) */
    protected readonly pkcePct = computed(() => {
        const total = this.pkceExchanges() + this.refreshGrants();
        if (total === 0) return 0;
        return Math.round((this.pkceExchanges() / total) * 100);
    });

    /** % Refresh sobre el total (calculado) */
    protected readonly refreshPct = computed(() => 100 - this.pkcePct());

    /** Formato compacto: 108200 → 108.2k */
    protected readonly pkceFormatted = computed(() => this.formatK(this.pkceExchanges()));
    protected readonly refreshFormatted = computed(() => this.formatK(this.refreshGrants()));

    private formatK(n: number): string {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
        return n.toString();
    }
}
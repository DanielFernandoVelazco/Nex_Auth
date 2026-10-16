import { Component, input, signal, computed } from '@angular/core';
import { ApplicationDetail } from '../../../../core/models/application-detail.model';
import { SdkQuickstart } from '../sdk-quickstart/sdk-quickstart';
import { LiveMetrics } from '../live-metrics/live-metrics';
import { CopyButton } from '../../../../shared/components/copy-button/copy-button';

type TabId = 'config' | 'credentials' | 'urls' | 'tokens';

interface Tab {
    id: TabId;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-application-detail-panel',
    imports: [SdkQuickstart, LiveMetrics, CopyButton],
    templateUrl: './application-detail-panel.html',
    styleUrl: './application-detail-panel.scss',
})
export class ApplicationDetailPanel {
    readonly detail = input.required<ApplicationDetail>();

    protected readonly tabs: Tab[] = [
        { id: 'config', label: 'Configuración Rápida', icon: 'tune' },
        { id: 'credentials', label: 'Credenciales', icon: 'key' },
        { id: 'urls', label: 'URLs & Dominios', icon: 'link' },
        { id: 'tokens', label: 'Grant Types & Tokens', icon: 'token' },
    ];

    protected readonly activeTab = signal<TabId>('config');
    protected readonly secretVisible = signal(false);
    protected readonly refreshRotation = signal(true);

    protected readonly maskedSecret = computed(() =>
        this.secretVisible() ? this.detail().clientSecret : '•'.repeat(38)
    );

    protected setTab(id: TabId): void {
        this.activeTab.set(id);
    }

    protected toggleSecret(): void {
        this.secretVisible.update(v => !v);
    }

    protected toggleRotation(): void {
        this.refreshRotation.update(v => !v);
    }
}
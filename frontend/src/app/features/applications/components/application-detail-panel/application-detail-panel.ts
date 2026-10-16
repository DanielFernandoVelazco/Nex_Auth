import { Component, input, signal, computed, inject } from '@angular/core';
import { ApplicationDetail } from '../../../../core/models/application-detail.model';
import { SdkQuickstart } from '../sdk-quickstart/sdk-quickstart';
import { LiveMetrics } from '../live-metrics/live-metrics';
import { ApplicationService } from '../../../../core/services/application.service';
import { ToastService } from '../../../../core/services/toast.service';

type TabId = 'config' | 'credentials' | 'urls' | 'tokens';

interface Tab {
    id: TabId;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-application-detail-panel',
    imports: [SdkQuickstart, LiveMetrics],
    templateUrl: './application-detail-panel.html',
    styleUrl: './application-detail-panel.scss',
})
export class ApplicationDetailPanel {
    private readonly appService = inject(ApplicationService);
    private readonly toast = inject(ToastService);

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
        this.toast.info(
            this.secretVisible() ? 'Secreto visible' : 'Secreto oculto',
            this.secretVisible() ? 'No compartas este valor en canales públicos.' : undefined
        );
    }

    protected toggleRotation(): void {
        this.refreshRotation.update(v => !v);
        this.toast.info(
            'Rotación actualizada',
            this.refreshRotation() ? 'Rotación automática habilitada.' : 'Rotación deshabilitada.'
        );
    }

    protected copyClientId(): void {
        navigator.clipboard.writeText(this.detail().clientId).then(() => {
            this.toast.success('Client ID copiado', this.detail().clientId);
        });
    }

    protected rotateSecret(): void {
        this.toast.info('Rotando secreto...', 'Se generará un nuevo secreto en unos segundos.');
        setTimeout(() => {
            this.toast.success('Secreto rotado', 'El nuevo secreto fue generado y aplicado.');
        }, 1200);
    }

    protected saveChanges(): void {
        this.toast.success('Cambios guardados', 'La configuración fue actualizada exitosamente.');
    }

    protected discardChanges(): void {
        this.toast.info('Cambios descartados', 'Los cambios locales fueron revertidos.');
    }

    protected deleteApplication(): void {
        const app = this.detail();
        const confirmed = confirm(`¿Eliminar "${app.name}"? Esta acción no se puede deshacer.`);
        if (!confirmed) return;
        this.appService.remove(app.id);
        this.toast.success('Aplicación eliminada', `${app.name} fue eliminada permanentemente.`);
    }
}
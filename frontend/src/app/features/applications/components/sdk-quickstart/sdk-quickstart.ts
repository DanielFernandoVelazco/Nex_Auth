import { Component, input, signal } from '@angular/core';

type SdkLanguage = 'nodejs' | 'python' | 'curl';

interface SdkTab {
    id: SdkLanguage;
    label: string;
}

@Component({
    selector: 'app-sdk-quickstart',
    imports: [],
    templateUrl: './sdk-quickstart.html',
    styleUrl: './sdk-quickstart.scss',
})
export class SdkQuickstart {
    readonly snippets = input.required<Record<SdkLanguage, string>>();

    protected readonly tabs: SdkTab[] = [
        { id: 'nodejs', label: 'Node.js' },
        { id: 'python', label: 'Python' },
        { id: 'curl', label: 'cURL' },
    ];

    protected readonly activeTab = signal<SdkLanguage>('nodejs');
    protected readonly copied = signal(false);

    protected setTab(id: SdkLanguage): void {
        this.activeTab.set(id);
    }

    protected currentSnippet(): string {
        return this.snippets()[this.activeTab()];
    }

    protected async copySnippet(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.currentSnippet());
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 1500);
        } catch {
            // Silent
        }
    }
}
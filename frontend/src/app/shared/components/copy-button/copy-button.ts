import { Component, signal, input } from '@angular/core';

@Component({
    selector: 'app-copy-button',
    imports: [],
    templateUrl: './copy-button.html',
    styleUrl: './copy-button.scss',
})
export class CopyButton {
    /** Texto que se copia al portapapeles */
    readonly value = input.required<string>();

    /** Tooltip opcional */
    readonly title = input<string>('Copiar');

    /** Tamaño del ícono en px */
    readonly iconSize = input<number>(16);

    protected readonly copied = signal<boolean>(false);

    protected async copy(event: MouseEvent): Promise<void> {
        event.stopPropagation();
        try {
            await navigator.clipboard.writeText(this.value());
            this.copied.set(true);
            setTimeout(() => this.copied.set(false), 1500);
        } catch {
            // Silencioso si el navegador lo bloquea
        }
    }
}
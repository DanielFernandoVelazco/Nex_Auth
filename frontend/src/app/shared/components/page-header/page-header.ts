import { Component, input } from '@angular/core';

@Component({
    selector: 'app-page-header',
    imports: [],
    templateUrl: './page-header.html',
    styleUrl: './page-header.scss',
})
export class PageHeader {
    /** Breadcrumb principal, ej: 'IAM Management' */
    readonly breadcrumb = input<string>('');

    /** Breadcrumb secundario (último, resaltado), ej: 'Applications' */
    readonly breadcrumbActive = input<string>('');

    /** Título de la página */
    readonly title = input.required<string>();

    /** Descripción larga debajo del título */
    readonly description = input<string>('');
}
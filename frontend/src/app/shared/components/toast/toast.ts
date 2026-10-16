import { Component, Inject, computed, inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastData {
    title: string;
    message?: string;
    icon: string;
    variant: ToastVariant;
}

@Component({
    selector: 'app-toast',
    imports: [],
    templateUrl: './toast.html',
    styleUrl: './toast.scss',
})
export class Toast {
    protected readonly snackBarRef = inject(MatSnackBarRef<Toast>);

    constructor(@Inject(MAT_SNACK_BAR_DATA) protected readonly data: ToastData) { }

    protected readonly iconClass = computed(() => {
        const map: Record<ToastVariant, string> = {
            success: 'text-tertiary-fixed',
            error: 'text-error-container',
            info: 'text-primary-fixed',
        };
        return map[this.data.variant];
    });

    protected close(): void {
        this.snackBarRef.dismiss();
    }
}
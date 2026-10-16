import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Toast, ToastData } from '../../shared/components/toast/toast';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly snackBar = inject(MatSnackBar);

    success(title: string, message?: string): void {
        this.open({ title, message, icon: 'check_circle', variant: 'success' });
    }

    error(title: string, message?: string): void {
        this.open({ title, message, icon: 'error', variant: 'error' });
    }

    info(title: string, message?: string): void {
        this.open({ title, message, icon: 'info', variant: 'info' });
    }

    private open(data: ToastData): void {
        this.snackBar.openFromComponent(Toast, {
            data,
            duration: 3500,
            horizontalPosition: 'end',
            verticalPosition: 'bottom',
            panelClass: ['nexauth-toast', `nexauth-toast--${data.variant}`],
        });
    }
}
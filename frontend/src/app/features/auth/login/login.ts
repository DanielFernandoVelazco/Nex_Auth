import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-login',
    imports: [RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    protected readonly email = signal('');
    protected readonly password = signal('');
    protected readonly rememberDevice = signal(true);
    protected readonly passwordVisible = signal(false);

    protected onEmailInput(event: Event): void {
        this.email.set((event.target as HTMLInputElement).value);
    }

    protected onPasswordInput(event: Event): void {
        this.password.set((event.target as HTMLInputElement).value);
    }

    protected togglePassword(): void {
        this.passwordVisible.update(v => !v);
    }

    protected toggleRemember(): void {
        this.rememberDevice.update(v => !v);
    }

    protected loginWithPasskey(): void {
        this.toast.info('Passkey', 'Abre el sensor biométrico para autenticarte...');
        setTimeout(() => {
            this.toast.success('Autenticado', 'Bienvenido de nuevo.');
            this.router.navigate(['/app/applications']);
        }, 800);
    }

    protected loginWithSso(provider: string): void {
        this.toast.info(provider, 'Redirigiendo al proveedor...');
        setTimeout(() => {
            this.toast.success('Autenticado', `Login con ${provider} exitoso.`);
            this.router.navigate(['/app/applications']);
        }, 900);
    }

    protected onSubmit(event: Event): void {
        event.preventDefault();
        if (!this.email() || !this.password()) {
            this.toast.error('Campos requeridos', 'Completa email y contraseña.');
            return;
        }
        this.toast.success('Login exitoso', 'Bienvenido a NexAuth.');
        this.router.navigate(['/app/applications']);
    }

    protected ssoEnterprise(): void {
        this.toast.info('SSO Empresarial', 'Introduce tu dominio corporativo para continuar.');
    }
}
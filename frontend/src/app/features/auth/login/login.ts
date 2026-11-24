import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);
    private readonly auth = inject(AuthService);

    protected readonly email = signal('sofia.alarcon@acme.com');
    protected readonly password = signal('admin123');
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

    protected async loginWithPasskey(): Promise<void> {
        this.toast.info('Passkey', 'Función próximamente — usa email/password por ahora.');
    }

    protected loginWithSso(provider: string): void {
        this.toast.info(provider, 'SSO próximamente disponible.');
    }

    protected async onSubmit(event: Event): Promise<void> {
        event.preventDefault();
        if (!this.email() || !this.password()) {
            this.toast.error('Campos requeridos', 'Completa email y contraseña.');
            return;
        }

        const success = await this.auth.login(this.email(), this.password());
        if (success) {
            this.toast.success('Login exitoso', 'Bienvenido a NexAuth.');
            this.router.navigate(['/app/applications']);
        } else {
            this.toast.error('Credenciales inválidas', 'Verifica tu email y contraseña.');
        }
    }

    protected ssoEnterprise(): void {
        this.toast.info('SSO Empresarial', 'Próximamente disponible.');
    }
}
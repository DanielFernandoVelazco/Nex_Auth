import { Component, signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-register',
    imports: [RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})
export class Register {
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    protected readonly fullName = signal('Sofia Alarcón');
    protected readonly email = signal('sofia@acme-corp.com');
    protected readonly tenantSlug = signal('acme-corp');
    protected readonly password = signal('N3xAuth#2025');
    protected readonly acceptedTerms = signal(true);
    protected readonly passwordVisible = signal(false);

    // Password strength
    protected readonly passwordChecks = computed(() => {
        const p = this.password();
        return {
            length: p.length >= 8,
            upper: /[A-Z]/.test(p),
            number: /[0-9]/.test(p),
            symbol: /[^A-Za-z0-9]/.test(p),
        };
    });

    protected readonly passwordStrength = computed(() => {
        const c = this.passwordChecks();
        const score = [c.length, c.upper, c.number, c.symbol].filter(Boolean).length;
        if (score === 0) return { score: 0, label: 'Muy Débil', color: 'text-outline' };
        if (score === 1) return { score: 1, label: 'Débil (25%)', color: 'text-error' };
        if (score === 2) return { score: 2, label: 'Aceptable (50%)', color: 'text-secondary' };
        if (score === 3) return { score: 3, label: 'Fuerte (75%)', color: 'text-secondary' };
        return { score: 4, label: 'Óptima (100%)', color: 'text-tertiary' };
    });

    protected readonly tenantUrlPreview = computed(() => {
        const slug = this.tenantSlug().trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || 'tu-organizacion';
        return `${slug}.auth.nexauth.io`;
    });

    protected readonly isValid = computed(() =>
        this.fullName().trim().length > 0 &&
        this.email().trim().length > 0 &&
        this.tenantSlug().trim().length > 0 &&
        this.passwordStrength().score === 4 &&
        this.acceptedTerms()
    );

    protected onNameInput(e: Event): void { this.fullName.set((e.target as HTMLInputElement).value); }
    protected onEmailInput(e: Event): void { this.email.set((e.target as HTMLInputElement).value); }
    protected onTenantInput(e: Event): void { this.tenantSlug.set((e.target as HTMLInputElement).value); }
    protected onPasswordInput(e: Event): void { this.password.set((e.target as HTMLInputElement).value); }
    protected togglePasswordVisible(): void { this.passwordVisible.update(v => !v); }
    protected toggleTerms(): void { this.acceptedTerms.update(v => !v); }

    protected loginWithSso(provider: string): void {
        this.toast.info(provider, `Conectando con ${provider}...`);
        setTimeout(() => {
            this.toast.success('Cuenta vinculada', `Registro con ${provider} completado.`);
            this.router.navigate(['/app/applications']);
        }, 900);
    }

    protected onSubmit(event: Event): void {
        event.preventDefault();
        if (!this.isValid()) {
            this.toast.error('Revisa los campos', 'Completa el formulario y acepta los términos.');
            return;
        }
        this.toast.success('¡Cuenta creada!', `Bienvenido a ${this.tenantUrlPreview()}`);
        setTimeout(() => this.router.navigate(['/app/applications']), 800);
    }
}
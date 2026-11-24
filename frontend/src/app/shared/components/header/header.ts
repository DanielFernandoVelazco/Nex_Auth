import { Component, signal, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly auth = inject(AuthService);

  protected readonly tenantName = signal('nexauth-corp-prod');
  protected readonly region = signal('AWS us-east-1');
  protected readonly hasNotifications = signal(true);

  // Derivar datos del usuario desde el AuthService
  protected readonly userName = () => this.auth.user()?.name ?? 'Usuario';
  protected readonly userRole = signal('Security Admin');
  protected readonly userInitials = () => {
    const name = this.auth.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  };

  protected logout(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.auth.logout();
    }
  }
}
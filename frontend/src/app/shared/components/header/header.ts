import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);

  protected readonly tenantName = signal('nexauth-corp-prod');
  protected readonly region = signal('AWS us-east-1');
  protected readonly userName = signal('Sofia Alarcón');
  protected readonly userRole = signal('Security Admin');
  protected readonly userInitials = signal('SA');
  protected readonly hasNotifications = signal(true);

  protected logout(): void {
    if (confirm('¿Cerrar sesión?')) {
      this.router.navigate(['/']);
    }
  }
}
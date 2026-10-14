import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly tenantName = signal('nexauth-corp-prod');
  protected readonly region = signal('AWS us-east-1');
  protected readonly userName = signal('Sofia Alarcón');
  protected readonly userRole = signal('Security Admin');
  protected readonly userInitials = signal('SA');
  protected readonly hasNotifications = signal(true);
}
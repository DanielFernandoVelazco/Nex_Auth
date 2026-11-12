import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  protected readonly navItems = signal<NavItem[]>([
    { label: 'Dashboard', path: '/app/dashboard', icon: 'grid_view' },
    { label: 'Users', path: '/app/users', icon: 'group' },
    { label: 'Roles', path: '/app/roles', icon: 'admin_panel_settings' },
    { label: 'Permissions', path: '/app/permissions', icon: 'key' },
    { label: 'Applications', path: '/app/applications', icon: 'apps' },
    { label: 'API Keys', path: '/app/api-keys', icon: 'vpn_key' },
    { label: 'Sessions', path: '/app/sessions', icon: 'devices' },
    { label: 'Audit Logs', path: '/app/audit-logs', icon: 'receipt_long' },
    { label: 'Security', path: '/app/security', icon: 'security' },
    { label: 'Settings', path: '/app/settings', icon: 'settings' },
  ]);
}
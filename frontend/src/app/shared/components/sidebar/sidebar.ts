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
    { label: 'Dashboard', path: '/dashboard', icon: 'grid_view' },
    { label: 'Users', path: '/users', icon: 'group' },
    { label: 'Roles', path: '/roles', icon: 'admin_panel_settings' },
    { label: 'Permissions', path: '/permissions', icon: 'key' },
    { label: 'Applications', path: '/applications', icon: 'apps' },
    { label: 'API Keys', path: '/api-keys', icon: 'vpn_key' },
    { label: 'Sessions', path: '/sessions', icon: 'devices' },
    { label: 'Audit Logs', path: '/audit-logs', icon: 'receipt_long' },
    { label: 'Security', path: '/security', icon: 'security' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ]);
}
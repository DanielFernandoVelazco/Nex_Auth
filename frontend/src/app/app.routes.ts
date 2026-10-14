import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./layout/main-layout/main-layout').then(m => m.MainLayout),
        children: [
            { path: '', redirectTo: 'applications', pathMatch: 'full' },
            {
                path: 'applications',
                loadComponent: () =>
                    import('./features/applications/applications-list/applications-list')
                        .then(m => m.ApplicationsList),
            },
            {
                path: 'users',
                loadComponent: () =>
                    import('./features/users/user-directory/user-directory')
                        .then(m => m.UserDirectory),
            },
            {
                path: 'roles',
                loadComponent: () =>
                    import('./features/roles/roles-list/roles-list')
                        .then(m => m.RolesList),
            },
            {
                path: 'permissions',
                loadComponent: () =>
                    import('./features/permissions/permissions-list/permissions-list')
                        .then(m => m.PermissionsList),
            },
            {
                path: 'api-keys',
                loadComponent: () =>
                    import('./features/api-keys/api-keys-list/api-keys-list')
                        .then(m => m.ApiKeysList),
            },
            {
                path: 'sessions',
                loadComponent: () =>
                    import('./features/sessions/sessions-monitor/sessions-monitor')
                        .then(m => m.SessionsMonitor),
            },
            {
                path: 'audit-logs',
                loadComponent: () =>
                    import('./features/audit-logs/audit-logs-list/audit-logs-list')
                        .then(m => m.AuditLogsList),
            },
            {
                path: 'security',
                loadComponent: () =>
                    import('./features/security/security-settings/security-settings')
                        .then(m => m.SecuritySettings),
            },
            {
                path: 'settings',
                loadComponent: () =>
                    import('./features/settings/tenant-settings/tenant-settings')
                        .then(m => m.TenantSettings),
            },
        ],
    },

    { path: '**', redirectTo: '' },
];
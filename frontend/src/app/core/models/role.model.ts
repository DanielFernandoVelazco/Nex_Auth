export type RoleStyle = 'error' | 'secondary' | 'outline' | 'tertiary';
export type RoleTag = 'system-native' | 'custom' | 'read-only';
export type PermissionAction = 'read' | 'write' | 'delete';
export type PermissionColor = 'primary' | 'secondary' | 'on-surface-variant' | 'error';

export interface Role {
    id: string;
    name: string;
    description: string;
    tag: RoleTag;
    tagLabel: string;
    assignmentsCount: number;
    assignmentsLabel: string;
    scopeSummary: string;
    color: RoleStyle;
    scopeLabel: string;
    scopeLabelColor: 'tertiary' | 'error' | 'outline';
}

export interface RoleAssignment {
    id: string;
    type: 'group' | 'users';
    label: string;
    subLabel: string;
    icon: string;
    avatars?: { initials: string; bg: 'primary' | 'secondary' | 'tertiary' }[];
    moreCount?: number;
}

export interface ModulePermission {
    id: string;
    icon: string;
    iconColor: PermissionColor;
    name: string;
    scope: string;
    permissions: {
        read: boolean;
        readLocked?: boolean;
        readLockedReason?: string;
        write: boolean;
        writeLocked?: boolean;
        writeLockedReason?: string;
        delete: boolean;
        deleteLabel?: string;
        deleteLocked?: boolean;
        deleteLockedReason?: string;
    };
}

export interface RoleAudit {
    mutatedBy: string;
    mutatedAgo: string;
    hash: string;
    statusLabel: string;
}

export interface RoleDetail extends Role {
    version: string;
    membersCount: number;
    assignments: RoleAssignment[];
    modules: ModulePermission[];
    audit: RoleAudit;
}

export interface RolesOverview {
    kpis: {
        rolesCount: string;
        rolesDelta: string;
        rolesBreakdown: string;
        assignmentsCount: string;
        assignmentsDelta: string;
        assignmentsBreakdown: string;
        orphanRoles: string;
        orphanStatus: string;
        orphanBreakdown: string;
    };
    roles: Role[];
    details: Record<string, RoleDetail>;
}
export type UserStatus = 'active' | 'blocked' | 'quarantine' | 'pending';
export type MfaFactor = 'passkey' | 'totp' | 'sms' | 'yubikey' | 'revoked' | 'null';
export type ConnectionType = 'google' | 'github' | 'database' | 'saml' | 'azure' | 'okta';

export interface UserConnection {
    type: ConnectionType;
    label: string;
    identifier: string;
    icon: string;
    iconColor: 'primary' | 'secondary' | 'outline' | 'error' | 'neutral';
}

export interface UserMfa {
    factor: MfaFactor;
    label: string;
    icon: string;
}

export interface UserLastLogin {
    relative: string;
    ip: string;
    country: string;
    isCritical?: boolean;
}

export interface UserStats {
    sessions: string;
    sessionsSub: string;
    logins: string;
    loginsSub: string;
    created: string;
    createdSub: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    roleLabel: string;
    roleStyle: 'admin' | 'devops' | 'product' | 'external' | 'quarantine';
    avatarUrl?: string;
    initials?: string;
    avatarBg?: 'primary' | 'secondary' | 'error';
    online: boolean;

    connection: UserConnection;
    status: UserStatus;
    statusLabel: string;
    isAnomaly: boolean;

    mfa: UserMfa;
    lastLogin: UserLastLogin;
    stats: UserStats;

    isSelected?: boolean;
}
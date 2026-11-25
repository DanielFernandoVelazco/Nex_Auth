import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SecurityService {
    constructor(private prisma: PrismaService) { }

    async getConfig(userId: string) {
        const orgId = await this.resolveOrgId(userId);
        let config = await this.prisma.securityConfig.findUnique({
            where: { organizationId: orgId },
        });

        if (!config) {
            config = await this.prisma.securityConfig.create({
                data: {
                    organizationId: orgId,
                    ...this.defaults(),
                },
            });
        }

        return config;
    }

    async updateMfaPolicy(userId: string, mfaPolicy: string) {
        const config = await this.getConfig(userId);
        return this.prisma.securityConfig.update({
            where: { organizationId: config.organizationId },
            data: { mfaPolicy },
        });
    }

    async toggleSocialConnection(userId: string, id: string) {
        const config = await this.getConfig(userId);
        const conns = (config.socialConnections as any[]) ?? [];
        const updated = conns.map(c =>
            c.id === id ? { ...c, enabled: !c.enabled } : c,
        );
        return this.prisma.securityConfig.update({
            where: { organizationId: config.organizationId },
            data: { socialConnections: updated },
        });
    }

    async toggleMfaFactor(userId: string, id: string) {
        const config = await this.getConfig(userId);
        const factors = (config.mfaFactors as any[]) ?? [];
        const updated = factors.map(f =>
            f.id === id ? { ...f, enabled: !f.enabled } : f,
        );
        return this.prisma.securityConfig.update({
            where: { organizationId: config.organizationId },
            data: { mfaFactors: updated },
        });
    }

    async toggleThreat(userId: string, id: string) {
        const config = await this.getConfig(userId);
        const threats = (config.threats as any[]) ?? [];
        const updated = threats.map(t =>
            t.id === id ? { ...t, enabled: !t.enabled } : t,
        );
        return this.prisma.securityConfig.update({
            where: { organizationId: config.organizationId },
            data: { threats: updated },
        });
    }

    private async resolveOrgId(userId: string): Promise<string> {
        const m = await this.prisma.userOrganization.findFirst({
            where: { userId },
            select: { organizationId: true },
        });
        if (!m) throw new ForbiddenException('Sin organización');
        return m.organizationId;
    }

    private defaults() {
        return {
            mfaPolicy: 'required',
            backchannelLogout: true,
            socialConnections: [
                { id: 'google', name: 'Google OAuth2', identifier: 'oauth2:google-v2', icon: 'google', enabled: true, enabledLabel: 'Habilitado', infoLabel: 'Client ID', infoValue: '89104••••.apps.googleusercontent.com', footerLabel: 'Apps conectadas', footerValue: '2 aplicaciones', footerValueColor: 'success' },
                { id: 'github', name: 'GitHub', identifier: 'oauth2:github', icon: 'github', enabled: true, enabledLabel: 'Habilitado', infoLabel: 'Scopes Requeridos', scopes: ['read:user', 'user:email'], footerLabel: 'Org Sync', footerValue: '@acme-core', footerValueColor: 'success' },
                { id: 'azure', name: 'Azure AD / MS', identifier: 'oidc:azure-common', icon: 'azure', enabled: true, enabledLabel: 'Habilitado', infoLabel: 'Tenant Mode', infoValue: 'Common (Multi-Tenant)', footerLabel: 'Token Endpoint', footerValue: 'v2.0 validated', footerValueColor: 'neutral' },
                { id: 'apple', name: 'Apple Sign-in', identifier: 'apple:private-relay', icon: 'apple', enabled: false, enabledLabel: 'Deshabilitado', infoLabel: 'Apple Team ID', infoValue: 'No aprovisionado', warningText: 'Falta .p8 key', footerLabel: 'Service ID Key', footerValue: 'Falta .p8 key', footerValueColor: 'error', isDisabledStyle: true },
            ],
            mfaFactors: [
                { id: 'passkeys', name: 'Passkeys / FIDO2', icon: 'fingerprint', iconColor: 'primary', badgeLabel: 'Máxima Seguridad', badgeStyle: 'success', description: 'Apple TouchID, Windows Hello, YubiKey FIDO2 y Titan Keys.', infoLabel: 'User Verification', infoValue: 'Required', infoStatus: 'ok', enabledLabel: 'Recomendado', enabledLabelColor: 'success', enabled: true },
                { id: 'totp', name: 'TOTP Authenticator Apps', icon: 'timer', iconColor: 'primary', badgeLabel: 'Estándar RFC 6238', badgeStyle: 'neutral', description: 'Google Authenticator, 1Password, Microsoft Authenticator.', infoLabel: 'Algoritmo', infoValue: 'SHA-1 • 6 dígitos', infoStatus: 'ok', enabledLabel: 'Activo', enabledLabelColor: 'success', enabled: true },
                { id: 'sms', name: 'SMS / WhatsApp OTP', icon: 'sms', iconColor: 'primary', badgeLabel: 'Vulnerable a SIM-Swap', badgeStyle: 'danger', description: 'Envío de código OTP al número móvil como respaldo.', infoLabel: 'Fallback únicamente', infoValue: '', infoStatus: 'warning', enabledLabel: 'Habilitado como Fallback', enabledLabelColor: 'neutral', enabled: true },
                { id: 'recovery', name: 'Códigos de Recuperación', icon: 'vpn_key_alert', iconColor: 'primary', badgeLabel: '10 Códigos', badgeStyle: 'neutral', description: 'Códigos de uso único para rescate de cuentas.', infoLabel: 'Generación', infoValue: 'Obligatoria al inicio', infoStatus: 'ok', enabledLabel: 'Enforced', enabledLabelColor: 'success', enabled: true, isRecovery: true },
            ],
            threats: [
                { id: 'credential-stuffing', icon: 'security_update_warning', iconColor: 'error', title: 'Detección de Credential Stuffing', description: 'Monitorea bases de datos de brechas públicas.', actionLabel: 'Acción automatizada', actionValue: 'Bloqueo automático por reputación de IP.', footerLabel: 'Feed: HIBP Enterprise', footerValue: 'Activo', footerValueColor: 'success', enabled: true },
                { id: 'brute-force', icon: 'lock_reset', iconColor: 'primary', title: 'Protección contra Fuerza Bruta', description: 'Aislamiento progresivo en múltiples fallos.', actionLabel: 'Umbral de bloqueo', actionValue: 'Bloqueo tras 5 intentos', thresholdLabel: 'Duración', thresholdValue: '15 minutos', thresholdHighlight: 'primary', footerLabel: 'Captcha: Cloudflare Turnstile', footerValue: 'Enlazado', footerValueColor: 'success', enabled: true },
                { id: 'impossible-travel', icon: 'public', iconColor: 'secondary', title: 'Geolocalización Anómala', description: 'Calcula Impossible Travel entre logins.', actionLabel: 'Desafío condicional', actionValue: 'MFA estricto si login es de nuevo país.', footerLabel: 'MaxMind GeoIP2', footerValue: 'Online', footerValueColor: 'success', enabled: true },
            ],
            dbConnections: [
                { id: 'default-db', name: 'AuthShield Default DB', icon: 'storage', iconColor: 'primary', algorithmBadge: 'Argon2id (m=64MB, t=3, p=4)', userCount: '128,492 usuarios', features: [{ id: 'public-reg', label: 'Permitir registro público', enabled: true }, { id: 'email-verify', label: 'Email Verification obligatorio', enabled: true }] },
            ],
            passwordlessRoutes: [
                { id: 'passwordless', name: 'Passwordless Magic Links / OTP', icon: 'mark_email_read', iconColor: 'secondary', ttlBadge: 'TTL: 10m', enabled: true, features: ['Email Link (Resend API)', 'SMS OTP (Twilio Verify)', 'Rate-limited (3 req/min)'] },
            ],
            enterpriseSso: [
                { id: 'okta', initials: 'OK', initialsColor: 'primary', name: 'Okta SAML Connection', identifier: 'EntityID: https://saml.okta.com/app/exk482', metaLabel: 'X.509', metaValue: 'Válido', statusLabel: 'Conectado' },
                { id: 'google-workspace', initials: 'GW', initialsColor: 'tertiary', name: 'Google Workspace Enterprise', identifier: 'Dominio: acmecorp.com • SCIM v2', metaLabel: 'Asignaciones', metaValue: '2,104', statusLabel: 'Conectado' },
            ],
            dnsVerifications: [
                { id: 'dkim', label: 'DKIM (2048-bit RSA)', status: 'validated', statusLabel: 'VALIDADO' },
                { id: 'spf', label: 'SPF (~all Include)', status: 'validated', statusLabel: 'VALIDADO' },
                { id: 'dmarc', label: 'DMARC (p=reject)', status: 'validated', statusLabel: 'POLÍTICA ACTIVA' },
            ],
        };
    }
}
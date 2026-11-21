import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class ApiKeysService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, query: { search?: string; environment?: string }) {
        const orgId = await this.resolveOrgId(userId);
        return this.prisma.apiKey.findMany({
            where: {
                organizationId: orgId,
                revokedAt: null,
                ...(query.environment && { environment: query.environment }),
                ...(query.search && {
                    OR: [
                        { serviceName: { contains: query.search, mode: 'insensitive' } },
                        { serviceId: { contains: query.search, mode: 'insensitive' } },
                        { keyPrefix: { contains: query.search, mode: 'insensitive' } },
                    ],
                }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const key = await this.prisma.apiKey.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!key) throw new NotFoundException('API Key no encontrada');
        return key;
    }

    /**
     * IMPORTANTE: el valor completo de la key solo se retorna UNA VEZ al crearla.
     * En BD se guarda únicamente el hash SHA-256.
     */
    async generate(dto: CreateApiKeyDto, userId: string) {
        const orgId = await this.resolveOrgId(userId);

        const rawSecret = randomBytes(32).toString('hex');
        const envPrefix = dto.environment === 'production' ? 'nex_live_' : 'nex_test_';
        const fullKey = `${envPrefix}${rawSecret}`;
        const keyPrefix = `${envPrefix}${rawSecret.slice(0, 4)}...••••`;
        const keyHash = createHash('sha256').update(fullKey).digest('hex');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + dto.expiryDays);

        const created = await this.prisma.apiKey.create({
            data: {
                serviceName: dto.serviceName,
                serviceId: `srv_${rawSecret.slice(0, 5)}`,
                icon: 'vpn_key',
                iconColor: 'primary',
                keyPrefix,
                keyHash,
                environment: dto.environment,
                scopes: dto.scopes,
                expiresAt,
                organizationId: orgId,
                applicationId: dto.applicationId,
            },
        });

        // ⚠️ Retornar el valor completo SOLO aquí
        return {
            ...created,
            fullKey, // el frontend debe mostrarlo y pedir al usuario que lo copie
        };
    }

    async rotate(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const existing = await this.prisma.apiKey.findFirst({
            where: { id, organizationId: orgId, revokedAt: null },
        });
        if (!existing) throw new NotFoundException('API Key no encontrada o revocada');

        const rawSecret = randomBytes(32).toString('hex');
        const envPrefix = existing.environment === 'production' ? 'nex_live_' : 'nex_test_';
        const fullKey = `${envPrefix}${rawSecret}`;
        const keyPrefix = `${envPrefix}${rawSecret.slice(0, 4)}...••••`;
        const keyHash = createHash('sha256').update(fullKey).digest('hex');

        const updated = await this.prisma.apiKey.update({
            where: { id },
            data: { keyPrefix, keyHash },
        });

        return { ...updated, fullKey };
    }

    async revoke(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const existing = await this.prisma.apiKey.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!existing) throw new NotFoundException('API Key no encontrada');

        await this.prisma.apiKey.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }

    private async resolveOrgId(userId: string): Promise<string> {
        const m = await this.prisma.userOrganization.findFirst({
            where: { userId },
            select: { organizationId: true },
        });
        if (!m) throw new ForbiddenException('Sin organización');
        return m.organizationId;
    }
}
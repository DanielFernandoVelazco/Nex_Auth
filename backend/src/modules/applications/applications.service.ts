import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, query: { search?: string; type?: string }) {
        const orgId = await this.resolveOrgId(userId);
        const where: Prisma.ApplicationWhereInput = {
            organizationId: orgId,
            ...(query.type && { type: query.type }),
            ...(query.search && {
                OR: [
                    { name: { contains: query.search, mode: 'insensitive' } },
                    { clientId: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };

        return this.prisma.application.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const app = await this.prisma.application.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!app) throw new NotFoundException('Application no encontrada');
        return app;
    }

    async create(dto: CreateApplicationDto, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const clientId = this.generateClientId(dto.type);

        return this.prisma.application.create({
            data: {
                name: dto.name,
                subtitle: dto.subtitle,
                icon: dto.icon ?? this.iconFor(dto.type),
                iconColor: 'primary',
                clientId,
                type: dto.type,
                status: 'active',
                statusLabel: 'Activa',
                domainLabel: 'Dominio Principal',
                domainValue: dto.domainValue ? `https://${dto.domainValue}` : 'Sin dominio',
                domainIcon: dto.domainIcon ?? 'lock',
                metricLabel: 'Logins (24h)',
                metricValue: '0',
                organizationId: orgId,
            },
        });
    }

    async update(id: string, dto: UpdateApplicationDto, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const existing = await this.prisma.application.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!existing) throw new NotFoundException('Application no encontrada');

        return this.prisma.application.update({
            where: { id },
            data: { ...dto },
        });
    }

    async remove(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const existing = await this.prisma.application.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!existing) throw new NotFoundException('Application no encontrada');

        await this.prisma.application.delete({ where: { id } });
        return { success: true };
    }

    // ─── Helpers ─────────────────────────────────────────
    private async resolveOrgId(userId: string): Promise<string> {
        const membership = await this.prisma.userOrganization.findFirst({
            where: { userId },
            select: { organizationId: true },
        });
        if (!membership) throw new ForbiddenException('Usuario sin organización asignada');
        return membership.organizationId;
    }

    private generateClientId(type: string): string {
        const prefix = type === 'm2m' ? 'm2m_srv_' : 'app_clnt_';
        return `${prefix}${Math.random().toString(16).slice(2, 14)}`;
    }

    private iconFor(type: string): string {
        return { spa: 'web', web: 'language', m2m: 'dns', native: 'smartphone' }[type] ?? 'web';
    }
}
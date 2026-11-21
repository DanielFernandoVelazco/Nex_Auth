import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class AuditLogsService {
    constructor(private prisma: PrismaService) { }

    async findAll(
        userId: string,
        query: {
            severity?: string;
            eventType?: string;
            status?: string;
            search?: string;
            page?: number;
            limit?: number;
        },
    ) {
        const orgId = await this.resolveOrgId(userId);
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 50, 200);

        const where: Prisma.AuditLogWhereInput = {
            organizationId: orgId,
            ...(query.severity && query.severity !== 'all' && { severity: query.severity }),
            ...(query.eventType && { eventType: { contains: query.eventType, mode: 'insensitive' } }),
            ...(query.status && query.status !== 'all' && { status: query.status }),
            ...(query.search && {
                OR: [
                    { actorName: { contains: query.search, mode: 'insensitive' } },
                    { eventType: { contains: query.search, mode: 'insensitive' } },
                    { geoCity: { contains: query.search, mode: 'insensitive' } },
                ],
            }),
        };

        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { timestamp: 'desc' },
            }),
            this.prisma.auditLog.count({ where }),
        ]);

        return { data: logs, total, page, limit };
    }

    async findOne(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const log = await this.prisma.auditLog.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!log) throw new NotFoundException('Audit log no encontrado');
        return log;
    }

    async create(dto: CreateAuditLogDto, userId: string) {
        const orgId = await this.resolveOrgId(userId);

        // Mapear status a label/icon
        const statusMap: Record<string, { label: string; icon: string }> = {
            success: { label: 'Success', icon: 'check' },
            failed: { label: 'Failed', icon: 'error' },
            blocked: { label: 'Bloqueado', icon: 'check' },
        };

        return this.prisma.auditLog.create({
            data: {
                severity: dto.severity,
                eventType: dto.eventType,
                actorType: dto.actorType,
                actorName: dto.actorName,
                actorSubLabel: dto.actorSubLabel ?? '',
                actorInitials: dto.actorInitials ?? 'SYS',
                actorInitialsBg: dto.actorInitialsBg ?? 'neutral',
                targetPrimary: dto.targetPrimary,
                targetSecondary: dto.targetSecondary,
                targetIsError: dto.targetIsError ?? false,
                status: dto.status,
                statusLabel: statusMap[dto.status].label,
                statusIcon: statusMap[dto.status].icon,
                detail: dto.detail ?? {},
                organizationId: orgId,
            },
        });
    }

    async getKpis(userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const since24h = new Date();
        since24h.setHours(since24h.getHours() - 24);

        const [total24h, anomalies, failedAuth] = await Promise.all([
            this.prisma.auditLog.count({
                where: { organizationId: orgId, timestamp: { gte: since24h } },
            }),
            this.prisma.auditLog.count({
                where: {
                    organizationId: orgId,
                    severity: 'critical',
                    timestamp: { gte: since24h },
                },
            }),
            this.prisma.auditLog.count({
                where: {
                    organizationId: orgId,
                    status: 'failed',
                    timestamp: { gte: since24h },
                },
            }),
        ]);

        return { total24h, anomalies, failedAuth };
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
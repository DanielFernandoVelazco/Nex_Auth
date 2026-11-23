import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SessionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string, query: { search?: string; page?: number; limit?: number }) {
        const orgId = await this.resolveOrgId(userId);
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 25, 100);

        // Solo sesiones activas de usuarios de la organización
        const orgUserIds = await this.prisma.userOrganization.findMany({
            where: { organizationId: orgId },
            select: { userId: true },
        });
        const userIds = orgUserIds.map(u => u.userId);

        const where = {
            userId: { in: userIds },
            revokedAt: null,
            expiresAt: { gt: new Date() },
            ...(query.search && {
                user: {
                    OR: [
                        { email: { contains: query.search, mode: 'insensitive' as const } },
                        { name: { contains: query.search, mode: 'insensitive' as const } },
                    ],
                },
            }),
        };

        const [sessions, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                include: { user: { select: { id: true, email: true, name: true } } },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.session.count({ where }),
        ]);

        return { data: sessions, total, page, limit };
    }

    async revoke(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const orgUserIds = await this.prisma.userOrganization.findMany({
            where: { organizationId: orgId },
            select: { userId: true },
        });
        const session = await this.prisma.session.findFirst({
            where: { id, userId: { in: orgUserIds.map(u => u.userId) } },
        });
        if (!session) throw new NotFoundException('Sesión no encontrada');

        await this.prisma.session.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
        return { success: true };
    }

    async revokeAllAnomalies(userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const orgUserIds = await this.prisma.userOrganization.findMany({
            where: { organizationId: orgId },
            select: { userId: true },
        });

        const result = await this.prisma.session.updateMany({
            where: {
                userId: { in: orgUserIds.map(u => u.userId) },
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });

        return { revokedCount: result.count };
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
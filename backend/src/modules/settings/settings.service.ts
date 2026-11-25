import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UpdateSettingsDto {
    organizationName?: string;
    customDomain?: string;
    sslActive?: boolean;
    accessTokenTtl?: number;
    idleTimeout?: number;
    maxConcurrency?: number;
    backchannelLogout?: boolean;
    emailProvider?: string;
    senderEmail?: string;
}

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async get(userId: string) {
        const orgId = await this.resolveOrgId(userId);

        let settings = await this.prisma.tenantSettings.findUnique({
            where: { organizationId: orgId },
        });

        if (!settings) {
            settings = await this.prisma.tenantSettings.create({
                data: { organizationId: orgId },
            });
        }

        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });

        return { ...settings, organizationName: org?.name ?? '' };
    }

    async update(userId: string, dto: UpdateSettingsDto) {
        const orgId = await this.resolveOrgId(userId);
        await this.ensureExists(orgId);

        if (dto.organizationName) {
            await this.prisma.organization.update({
                where: { id: orgId },
                data: { name: dto.organizationName },
            });
        }

        const { organizationName, ...settingsData } = dto;
        return this.prisma.tenantSettings.update({
            where: { organizationId: orgId },
            data: settingsData,
        });
    }

    private async ensureExists(orgId: string) {
        const exists = await this.prisma.tenantSettings.findUnique({
            where: { organizationId: orgId },
        });
        if (!exists) {
            await this.prisma.tenantSettings.create({ data: { organizationId: orgId } });
        }
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
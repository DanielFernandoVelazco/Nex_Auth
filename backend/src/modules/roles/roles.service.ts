import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: string) {
        const orgId = await this.resolveOrgId(userId);
        return this.prisma.role.findMany({
            where: {
                OR: [
                    { organizationId: orgId },
                    { isSystem: true },
                ],
            },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
            orderBy: [{ isSystem: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const role = await this.prisma.role.findFirst({
            where: {
                id,
                OR: [{ organizationId: orgId }, { isSystem: true }],
            },
            include: {
                permissions: { include: { permission: true } },
                _count: { select: { users: true } },
            },
        });
        if (!role) throw new NotFoundException('Rol no encontrado');
        return role;
    }

    async create(dto: CreateRoleDto, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        return this.prisma.role.create({
            data: {
                name: dto.name,
                description: dto.description,
                organizationId: orgId,
                permissions: dto.permissionIds?.length
                    ? { create: dto.permissionIds.map(pid => ({ permissionId: pid })) }
                    : undefined,
            },
            include: { permissions: { include: { permission: true } } },
        });
    }

    async update(id: string, dto: UpdateRoleDto, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const role = await this.prisma.role.findFirst({
            where: { id, organizationId: orgId },
        });
        if (!role) throw new NotFoundException('Rol no encontrado o sistema inmutable');

        // Si vienen permissionIds, reemplazar el set completo
        if (dto.permissionIds) {
            await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
            if (dto.permissionIds.length) {
                await this.prisma.rolePermission.createMany({
                    data: dto.permissionIds.map(pid => ({ roleId: id, permissionId: pid })),
                });
            }
        }

        return this.prisma.role.update({
            where: { id },
            data: {
                name: dto.name,
                description: dto.description,
            },
            include: { permissions: { include: { permission: true } } },
        });
    }

    async remove(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const role = await this.prisma.role.findFirst({
            where: { id, organizationId: orgId, isSystem: false },
        });
        if (!role) throw new NotFoundException('Rol no encontrado o sistema inmutable');

        await this.prisma.role.delete({ where: { id } });
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
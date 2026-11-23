import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../../../generated/prisma';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(
        userId: string,
        query: { search?: string; role?: string; status?: string; page?: number; limit?: number },
    ) {
        const orgId = await this.resolveOrgId(userId);
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 25, 100);

        const where: Prisma.UserOrganizationWhereInput = {
            organizationId: orgId,
            ...(query.role && { role: { name: query.role } }),
            ...(query.search && {
                user: {
                    OR: [
                        { email: { contains: query.search, mode: 'insensitive' } },
                        { name: { contains: query.search, mode: 'insensitive' } },
                    ],
                },
            }),
        };

        const [memberships, total] = await Promise.all([
            this.prisma.userOrganization.findMany({
                where,
                include: {
                    user: { select: { id: true, email: true, name: true, isActive: true, createdAt: true } },
                    role: { select: { id: true, name: true } },
                },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.userOrganization.count({ where }),
        ]);

        return {
            data: memberships.map(m => ({
                id: m.user.id,
                email: m.user.email,
                name: m.user.name,
                isActive: m.user.isActive,
                status: m.user.isActive ? 'active' : 'blocked',
                role: m.role ? { id: m.role.id, name: m.role.name } : null,
                createdAt: m.user.createdAt,
            })),
            total,
            page,
            limit,
        };
    }

    async findOne(id: string, userId: string) {
        const orgId = await this.resolveOrgId(userId);
        const membership = await this.prisma.userOrganization.findFirst({
            where: { userId: id, organizationId: orgId },
            include: {
                user: { select: { id: true, email: true, name: true, isActive: true, createdAt: true } },
                role: { select: { id: true, name: true } },
            },
        });
        if (!membership) throw new NotFoundException('Usuario no encontrado');
        return membership.user;
    }

    async create(dto: CreateUserDto, requesterId: string) {
        const orgId = await this.resolveOrgId(requesterId);

        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('El email ya está registrado');

        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                name: dto.name,
                organizations: {
                    create: {
                        organizationId: orgId,
                        roleId: dto.roleIds?.[0],
                    },
                },
            },
            select: { id: true, email: true, name: true, isActive: true, createdAt: true },
        });
    }

    async update(id: string, dto: UpdateUserDto, requesterId: string) {
        const orgId = await this.resolveOrgId(requesterId);
        const membership = await this.prisma.userOrganization.findFirst({
            where: { userId: id, organizationId: orgId },
        });
        if (!membership) throw new NotFoundException('Usuario no encontrado');

        return this.prisma.user.update({
            where: { id },
            data: { name: dto.name, email: dto.email },
            select: { id: true, email: true, name: true, isActive: true },
        });
    }

    async remove(id: string, requesterId: string) {
        const orgId = await this.resolveOrgId(requesterId);
        const membership = await this.prisma.userOrganization.findFirst({
            where: { userId: id, organizationId: orgId },
        });
        if (!membership) throw new NotFoundException('Usuario no encontrado');

        await this.prisma.userOrganization.delete({ where: { id: membership.id } });
        return { success: true };
    }

    async block(id: string, requesterId: string) {
        const orgId = await this.resolveOrgId(requesterId);
        const membership = await this.prisma.userOrganization.findFirst({
            where: { userId: id, organizationId: orgId },
        });
        if (!membership) throw new NotFoundException('Usuario no encontrado');

        return this.prisma.user.update({
            where: { id },
            data: { isActive: false },
            select: { id: true, isActive: true },
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
}
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { resource?: string; search?: string }) {
        return this.prisma.permission.findMany({
            where: {
                ...(query.resource && { resource: query.resource }),
                ...(query.search && {
                    OR: [
                        { resource: { contains: query.search, mode: 'insensitive' } },
                        { action: { contains: query.search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: {
                _count: { select: { roles: true } },
            },
            orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        });
    }

    async findOne(id: string) {
        const perm = await this.prisma.permission.findUnique({
            where: { id },
            include: { roles: { include: { role: true } } },
        });
        if (!perm) throw new NotFoundException('Permiso no encontrado');
        return perm;
    }

    async create(dto: CreatePermissionDto) {
        const existing = await this.prisma.permission.findUnique({
            where: { resource_action: { resource: dto.resource, action: dto.action } },
        });
        if (existing) throw new ConflictException('Ya existe este permiso');

        return this.prisma.permission.create({ data: dto });
    }

    async update(id: string, dto: UpdatePermissionDto) {
        await this.findOne(id);
        return this.prisma.permission.update({ where: { id }, data: dto });
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.permission.delete({ where: { id } });
        return { success: true };
    }
}
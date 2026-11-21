import {
    Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Get()
    findAll(@CurrentUser('userId') userId: string) {
        return this.rolesService.findAll(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.rolesService.findOne(id, userId);
    }

    @Post()
    create(@Body() dto: CreateRoleDto, @CurrentUser('userId') userId: string) {
        return this.rolesService.create(dto, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser('userId') userId: string) {
        return this.rolesService.update(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.rolesService.remove(id, userId);
    }
}
import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll(
        @CurrentUser('userId') userId: string,
        @Query() query: { search?: string; role?: string; page?: number; limit?: number },
    ) {
        return this.usersService.findAll(userId, {
            ...query,
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 25,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.usersService.findOne(id, userId);
    }

    @Post()
    create(@Body() dto: CreateUserDto, @CurrentUser('userId') userId: string) {
        return this.usersService.create(dto, userId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser('userId') userId: string) {
        return this.usersService.update(id, dto, userId);
    }

    @Patch(':id/block')
    block(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.usersService.block(id, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.usersService.remove(id, userId);
    }
}
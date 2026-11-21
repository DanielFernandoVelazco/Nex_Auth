import {
    Controller, Get, Post, Body, Patch, Param, Delete,
    UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('applications')
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Get()
    findAll(
        @CurrentUser('userId') userId: string,
        @Query('search') search?: string,
        @Query('type') type?: string,
    ) {
        return this.applicationsService.findAll(userId, { search, type });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.applicationsService.findOne(id, userId);
    }

    @Post()
    create(@Body() dto: CreateApplicationDto, @CurrentUser('userId') userId: string) {
        return this.applicationsService.create(dto, userId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateApplicationDto,
        @CurrentUser('userId') userId: string,
    ) {
        return this.applicationsService.update(id, dto, userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.applicationsService.remove(id, userId);
    }
}
import {
    Controller, Get, Post, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('audit-logs')
export class AuditLogsController {
    constructor(private readonly auditLogsService: AuditLogsService) { }

    @Get()
    findAll(
        @CurrentUser('userId') userId: string,
        @Query() query: {
            severity?: string;
            eventType?: string;
            status?: string;
            search?: string;
            page?: number;
            limit?: number;
        },
    ) {
        return this.auditLogsService.findAll(userId, {
            ...query,
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 50,
        });
    }

    @Get('kpis')
    getKpis(@CurrentUser('userId') userId: string) {
        return this.auditLogsService.getKpis(userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.auditLogsService.findOne(id, userId);
    }

    @Post()
    create(@Body() dto: CreateAuditLogDto, @CurrentUser('userId') userId: string) {
        return this.auditLogsService.create(dto, userId);
    }
}
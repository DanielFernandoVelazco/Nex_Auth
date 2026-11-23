import {
    Controller, Get, Param, Patch, UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionsService } from './sessions.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('sessions')
export class SessionsController {
    constructor(private readonly sessionsService: SessionsService) { }

    @Get()
    findAll(
        @CurrentUser('userId') userId: string,
        @Query() query: { search?: string; page?: number; limit?: number },
    ) {
        return this.sessionsService.findAll(userId, {
            ...query,
            page: query.page ? Number(query.page) : 1,
            limit: query.limit ? Number(query.limit) : 25,
        });
    }

    @Patch(':id/revoke')
    revoke(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.sessionsService.revoke(id, userId);
    }

    @Patch('revoke-anomalies')
    revokeAllAnomalies(@CurrentUser('userId') userId: string) {
        return this.sessionsService.revokeAllAnomalies(userId);
    }
}
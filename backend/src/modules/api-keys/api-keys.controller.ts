import {
    Controller, Get, Post, Body, Param, Patch,
    UseGuards, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('api-keys')
export class ApiKeysController {
    constructor(private readonly apiKeysService: ApiKeysService) { }

    @Get()
    findAll(
        @CurrentUser('userId') userId: string,
        @Query('search') search?: string,
        @Query('environment') environment?: string,
    ) {
        return this.apiKeysService.findAll(userId, { search, environment });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.apiKeysService.findOne(id, userId);
    }

    @Post()
    generate(@Body() dto: CreateApiKeyDto, @CurrentUser('userId') userId: string) {
        return this.apiKeysService.generate(dto, userId);
    }

    @Patch(':id/rotate')
    rotate(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.apiKeysService.rotate(id, userId);
    }

    @Patch(':id/revoke')
    revoke(@Param('id') id: string, @CurrentUser('userId') userId: string) {
        return this.apiKeysService.revoke(id, userId);
    }
}
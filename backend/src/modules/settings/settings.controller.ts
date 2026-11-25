import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import type { UpdateSettingsDto } from './settings.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Obtener configuración del tenant' })
    get(@CurrentUser('userId') userId: string) {
        return this.settingsService.get(userId);
    }

    @Patch()
    @ApiOperation({ summary: 'Actualizar configuración del tenant' })
    update(
        @CurrentUser('userId') userId: string,
        @Body() dto: UpdateSettingsDto,
    ) {
        return this.settingsService.update(userId, dto);
    }
}
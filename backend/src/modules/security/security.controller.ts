import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SecurityService } from './security.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Security')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('security')
export class SecurityController {
    constructor(private readonly securityService: SecurityService) { }

    @Get()
    @ApiOperation({ summary: 'Obtener configuración de seguridad' })
    getConfig(@CurrentUser('userId') userId: string) {
        return this.securityService.getConfig(userId);
    }

    @Patch('mfa-policy')
    @ApiOperation({ summary: 'Actualizar política MFA' })
    updateMfaPolicy(
        @CurrentUser('userId') userId: string,
        @Body('mfaPolicy') mfaPolicy: string,
    ) {
        return this.securityService.updateMfaPolicy(userId, mfaPolicy);
    }

    @Patch('social-connections/:id')
    @ApiOperation({ summary: 'Toggle proveedor social' })
    toggleSocial(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        return this.securityService.toggleSocialConnection(userId, id);
    }

    @Patch('mfa-factors/:id')
    @ApiOperation({ summary: 'Toggle factor MFA' })
    toggleMfaFactor(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        return this.securityService.toggleMfaFactor(userId, id);
    }

    @Patch('threats/:id')
    @ApiOperation({ summary: 'Toggle protección de amenaza' })
    toggleThreat(@CurrentUser('userId') userId: string, @Param('id') id: string) {
        return this.securityService.toggleThreat(userId, id);
    }
}
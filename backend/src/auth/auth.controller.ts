import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) throw new Error('Credenciales inválidas');
        return this.authService.login(user);
    }

    @Post('refresh')
    async refresh(@Body() body: { refresh_token: string }) {
        return this.authService.refreshToken(body.refresh_token);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('me')
    async me(@Req() req: any) {
        return { userId: req.user.userId, email: req.user.email };
    }
}
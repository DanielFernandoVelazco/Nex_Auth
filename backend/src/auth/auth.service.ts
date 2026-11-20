import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = await this.createRefreshToken(user.id);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { id: user.id, email: user.email, name: user.name },
        };
    }

    private async createRefreshToken(userId: string): Promise<string> {
        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

        // Invalidar sesiones previas del mismo usuario (opcional, para single-session)
        await this.prisma.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        await this.prisma.session.create({
            data: { userId, tokenHash, expiresAt },
        });

        return token;
    }

    async refreshToken(oldToken: string) {
        const oldHash = createHash('sha256').update(oldToken).digest('hex');
        const session = await this.prisma.session.findUnique({
            where: { tokenHash: oldHash },
            include: { user: true },
        });

        if (!session || session.revokedAt || session.expiresAt < new Date()) {
            // Reuso detectado: revocar todas las sesiones del usuario
            if (session) {
                await this.prisma.session.updateMany({
                    where: { userId: session.userId, revokedAt: null },
                    data: { revokedAt: new Date() },
                });
            }
            throw new UnauthorizedException('Refresh token inválido o reutilizado');
        }

        // Rotar: marcar el viejo como usado y generar uno nuevo
        await this.prisma.session.update({
            where: { id: session.id },
            data: { previousTokenHash: oldHash, tokenHash: 'ROTATED_' + oldHash, revokedAt: new Date() },
        });

        const payload = { sub: session.user.id, email: session.user.email };
        return {
            access_token: this.jwtService.sign(payload),
            refresh_token: await this.createRefreshToken(session.user.id),
        };
    }
}
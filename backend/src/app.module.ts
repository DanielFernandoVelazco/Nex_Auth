import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ApplicationsModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ApiKeysModule,
    SessionsModule,
    AuditLogsModule,
  ],
})
export class AppModule { }
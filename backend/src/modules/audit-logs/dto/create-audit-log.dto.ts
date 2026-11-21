import { IsString, IsOptional, IsIn, IsBoolean, IsObject } from 'class-validator';

export class CreateAuditLogDto {
    @IsString()
    @IsIn(['critical', 'warning', 'info'])
    severity: 'critical' | 'warning' | 'info';

    @IsString()
    eventType: string;

    @IsString()
    @IsIn(['system_agent', 'user', 'service', 'root'])
    actorType: 'system_agent' | 'user' | 'service' | 'root';

    @IsString()
    actorName: string;

    @IsString()
    @IsOptional()
    actorSubLabel?: string;

    @IsString()
    @IsOptional()
    actorInitials?: string;

    @IsString()
    @IsOptional()
    actorInitialsBg?: string;

    @IsString()
    targetPrimary: string;

    @IsString()
    @IsOptional()
    targetSecondary?: string;

    @IsString()
    @IsIn(['success', 'failed', 'blocked'])
    status: 'success' | 'failed' | 'blocked';

    @IsOptional()
    @IsObject()
    detail?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    targetIsError?: boolean;
}
import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreatePermissionDto {
    @IsString()
    @MinLength(2)
    resource: string;

    @IsString()
    @MinLength(2)
    action: string;

    @IsOptional()
    @IsString()
    description?: string;
}
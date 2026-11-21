import { IsString, IsIn, IsArray, IsInt, Min, IsOptional, IsDateString } from 'class-validator';

export class CreateApiKeyDto {
    @IsString()
    serviceName: string;

    @IsString()
    @IsIn(['production', 'staging'])
    environment: 'production' | 'staging';

    @IsArray()
    @IsString({ each: true })
    scopes: string[];

    @IsInt()
    @Min(1)
    expiryDays: number;

    @IsOptional()
    @IsString()
    applicationId?: string;
}
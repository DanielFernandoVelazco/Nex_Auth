import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';

export class CreateApplicationDto {
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    name: string;

    @IsString()
    subtitle: string;

    @IsString()
    @IsIn(['spa', 'web', 'm2m', 'native'])
    type: 'spa' | 'web' | 'm2m' | 'native';

    @IsString()
    @IsOptional()
    icon?: string;

    @IsString()
    @IsOptional()
    domainValue?: string;

    @IsOptional()
    @IsIn(['lock', 'link', 'code', 'history'])
    domainIcon?: string;
}
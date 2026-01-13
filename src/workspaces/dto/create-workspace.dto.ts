import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, ValidateNested, IsBoolean } from 'class-validator';

export class CreateWorkspaceDataDto {
  // allow both gid and workspaceGid as aliases
  @IsString()
  @IsOptional()
  gid?: string;

  @IsString()
  @IsOptional()
  workspaceGid?: string;
  
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
export class CreateWorkspaceRequestDto {
  @ValidateNested()
  @Type(() => CreateWorkspaceDataDto)
  data: CreateWorkspaceDataDto;
}
  

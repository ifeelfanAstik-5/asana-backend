import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTeamDto {
  @ApiProperty({ example: 'Platform' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123-workspace-gid' })
  @IsString()
  @IsNotEmpty()
  workspaceGid: string;

  @ApiProperty({ example: 'Owns core services', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'team_101', required: false })
  @IsString()
  @IsOptional()
  gid?: string;
}

export class CreateTeamRequestDto {
  @ValidateNested()
  @Type(() => CreateTeamDto)
  data: CreateTeamDto;
}

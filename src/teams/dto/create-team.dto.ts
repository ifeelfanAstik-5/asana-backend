import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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


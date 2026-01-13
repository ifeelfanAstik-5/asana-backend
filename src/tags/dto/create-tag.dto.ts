import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'P1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123-workspace-gid' })
  @IsString()
  @IsNotEmpty()
  workspaceGid: string;

  @ApiProperty({ example: 'red', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'tag_101', required: false })
  @IsString()
  @IsOptional()
  gid?: string;
}


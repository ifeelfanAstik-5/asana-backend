import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateSectionDto {
  @ApiProperty({ example: 'Backlog' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '123-project-gid' })
  @IsString()
  @IsNotEmpty()
  projectGid: string;

  @ApiProperty({ example: 0, required: false })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiProperty({ example: 'sec_101', required: false })
  @IsString()
  @IsOptional()
  gid?: string;
}


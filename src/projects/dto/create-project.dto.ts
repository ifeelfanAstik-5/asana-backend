import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ example: "Backend Rewrite" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "1234567890" })
  @IsString()
  @IsNotEmpty()
  workspaceGid: string;

  @ApiProperty({ example: "proj_202", required: false })
  @IsString()
  @IsOptional()
  gid?: string; // Added to match test payload

  // Optional fields sometimes present in generated tests
  @ApiProperty({ example: "This is a note", required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  completed?: boolean;
}

export class CreateProjectRequestDto {
  @ValidateNested()
  @Type(() => CreateProjectDto)
  data: CreateProjectDto;
}
// import { ApiProperty } from '@nestjs/swagger';

// export class CreateProjectDto {
//   @ApiProperty({ example: "Backend Rewrite" })
//   name: string;

//   @ApiProperty({ example: "1234567890" })
//   workspaceGid: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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
}
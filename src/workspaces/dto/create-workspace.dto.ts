// import { ApiProperty } from '@nestjs/swagger';

// export class CreateWorkspaceDto {
//   @ApiProperty({ example: "Acme Corp" })
//   name: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: "Acme Corp" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "ws_101", required: false })
  @IsString()
  @IsOptional()
  gid?: string; // Added to match test payload
}
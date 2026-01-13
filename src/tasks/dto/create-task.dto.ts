// import { ApiProperty } from '@nestjs/swagger';

// export class CreateTaskDto {
//   @ApiProperty({ example: "Implement API" })
//   name: string;

//   @ApiProperty({ example: "1234567890" })
//   projectGid: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: "Implement API" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "1234567890" })
  @IsString()
  @IsNotEmpty()
  projectGid: string;

  @ApiProperty({ example: "ws_101" })
  @IsString()
  @IsNotEmpty()
  workspaceGid: string; // Required for your Prisma logic

  @ApiProperty({ example: "task_303", required: false })
  @IsString()
  @IsOptional()
  gid?: string;

  @ApiProperty({ example: "Use Asana brand colors", required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  completed?: boolean;
}
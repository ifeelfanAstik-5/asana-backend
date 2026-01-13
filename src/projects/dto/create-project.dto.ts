import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: "Backend Rewrite" })
  name: string;

  @ApiProperty({ example: "1234567890" })
  workspaceGid: string;
}

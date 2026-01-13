import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({ example: 'Platform' })
  name: string;

  @ApiProperty({ example: '123-workspace-gid' })
  workspaceGid: string;

  @ApiProperty({ example: 'Owns core services', required: false })
  description?: string;
}


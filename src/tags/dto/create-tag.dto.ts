import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: 'P1' })
  name: string;

  @ApiProperty({ example: '123-workspace-gid' })
  workspaceGid: string;

  @ApiProperty({ example: 'red', required: false })
  color?: string;
}


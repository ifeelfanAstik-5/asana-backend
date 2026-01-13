import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 'Backlog' })
  name: string;

  @ApiProperty({ example: '123-project-gid' })
  projectGid: string;

  @ApiProperty({ example: 0, required: false })
  order?: number;
}


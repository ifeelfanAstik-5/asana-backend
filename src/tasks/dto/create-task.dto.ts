import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ example: "Implement API" })
  name: string;

  @ApiProperty({ example: "1234567890" })
  projectGid: string;
}

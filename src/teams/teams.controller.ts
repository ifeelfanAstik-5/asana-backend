import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  @Get()
  @ApiOperation({ summary: 'List teams (stub)' })
  list() {
    return { data: [] };
  }
}

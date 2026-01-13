import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  @Get()
  @ApiOperation({ summary: 'List goals (stub)' })
  list() {
    return { data: [] };
  }
}

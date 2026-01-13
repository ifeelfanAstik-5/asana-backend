import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  @Get()
  @ApiOperation({ summary: 'List sections (stub)' })
  list() {
    return { data: [] };
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  @Get()
  @ApiOperation({ summary: 'List tags (stub)' })
  list() {
    return { data: [] };
  }
}

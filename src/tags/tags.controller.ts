import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  @ApiOperation({ summary: 'List tags (optionally by workspace)' })
  list(@Query('workspaceGid') workspaceGid?: string) {
    if (workspaceGid) {
      return this.tagsService.listTagsByWorkspace(workspaceGid);
    }
    return { data: this.tagsService.findAll() };
  }
}

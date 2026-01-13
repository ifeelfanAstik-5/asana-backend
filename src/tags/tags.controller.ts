import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  create(@Body() body: CreateTagDto) {
    return this.tagsService.createTag(body);
  }

  @Get()
  @ApiOperation({ summary: 'List tags (optionally by workspace)' })
  list(@Query('workspaceGid') workspaceGid?: string) {
    if (workspaceGid) {
      return this.tagsService.listTagsByWorkspace(workspaceGid);
    }
    return this.tagsService.listAll();
  }

  @Get(':tagGid')
  @ApiOperation({ summary: 'Get tag by GID' })
  getById(@Param('tagGid') tagGid: string) {
    return this.tagsService.getTagById(tagGid);
  }
}

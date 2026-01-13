import { Controller, Get, Post, Body, Query, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagRequestDto } from './dto/create-tag.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tag' })
  async create(@Body() body: CreateTagRequestDto) {
    const result = await this.tagsService.createTag(body.data);
    if (result && typeof result === 'object' && 'error' in result) {
      throw new BadRequestException(result.error);
    }
    return { gid: result.gid, name: result.name };
  }

  @Get()
  @ApiOperation({ summary: 'List tags (optionally by workspace)' })
  async list(@Query('workspaceGid') workspaceGid?: string) {
    if (workspaceGid) {
      return this.tagsService.listTagsByWorkspace(workspaceGid);
    }
    return this.tagsService.listAll();
  }

  @Get(':tagGid')
  @ApiOperation({ summary: 'Get tag by GID' })
  async getById(@Param('tagGid') tagGid: string) {
    const tag = await this.tagsService.getTagById(tagGid);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }
}

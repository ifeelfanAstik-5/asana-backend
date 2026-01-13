import { Controller, Post, Get, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { StoriesService } from './stories.service';
import { CreateStoryDto } from './dto/create-story.dto';

@Controller('stories')
export class StoriesController {
  constructor(private storiesService: StoriesService) {}

  @Post()
  async create(@Body() createStoryDto: CreateStoryDto) {
    const result = await this.storiesService.create(createStoryDto);
    if (result.error) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Get()
  findAll(@Query('taskGid') taskGid?: string) {
    return this.storiesService.findAll({ taskGid });
  }

  @Get(':gid')
  async findOne(@Param('gid') gid: string) {
    const story = await this.storiesService.findOne(gid);
    if (!story) {
      throw new NotFoundException(`Story with gid ${gid} not found`);
    }
    return story;
  }
}

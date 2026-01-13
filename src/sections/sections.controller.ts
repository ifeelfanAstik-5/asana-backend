import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create section' })
  create(@Body() body: CreateSectionDto) {
    return this.sectionsService.createSection(body);
  }

  @Get()
  @ApiOperation({ summary: 'List sections (optionally by project)' })
  list(@Query('projectGid') projectGid?: string) {
    if (projectGid) {
      return this.sectionsService.listSectionsByProject(projectGid);
    }
    return this.sectionsService.listAll();
  }

  @Get(':sectionGid')
  @ApiOperation({ summary: 'Get section by GID' })
  getById(@Param('sectionGid') sectionGid: string) {
    return this.sectionsService.getSectionById(sectionGid);
  }
}

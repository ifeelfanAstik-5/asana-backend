import { Controller, Get, Post, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionRequestDto } from './dto/create-section.dto';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create section' })
  async create(@Body() body: CreateSectionRequestDto) {
    const result = await this.sectionsService.createSection(body.data);
    if (result && typeof result === 'object' && 'error' in result) {
      throw new BadRequestException(result.error);
    }
    return { gid: result.gid, name: result.name };
  }

  @Get()
  @ApiOperation({ summary: 'List sections (optionally by project)' })
  async list(@Query('projectGid') projectGid?: string) {
    if (projectGid) {
      return this.sectionsService.listSectionsByProject(projectGid);
    }
    return this.sectionsService.listAll();
  }

  @Get(':sectionGid')
  @ApiOperation({ summary: 'Get section by GID' })
  async getById(@Param('sectionGid') sectionGid: string) {
    const section = await this.sectionsService.getSectionById(sectionGid);
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }
}

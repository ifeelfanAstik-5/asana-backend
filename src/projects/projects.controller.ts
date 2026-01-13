import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  async create(@Body() body: CreateProjectDto) {
    return this.projectsService.createProject({
      name: body.name,
      workspaceGid: body.workspaceGid,
      gid: body.gid,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  async list() {
    return this.projectsService.listProjects();
  }

  @Get('workspace/:workspaceGid')
  @ApiOperation({ summary: 'List projects by workspace' })
  async getByWorkspace(@Param('workspaceGid') workspaceGid: string) {
    return this.projectsService.getByWorkspace(workspaceGid);
  }

  @Get(':projectGid')
  @ApiOperation({ summary: 'Get project by GID' })
  async getById(@Param('projectGid') projectGid: string) {
    const project = await this.projectsService.getById(projectGid);
    if (!project) {
      throw new NotFoundException('Project not found');
    }
    return project;
  }
}

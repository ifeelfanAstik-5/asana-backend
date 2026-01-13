import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create project' })
  create(@Body() body: CreateProjectDto) {
    return this.projectsService.createProject({
      name: body.name,
      workspaceGid: body.workspaceGid,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  list() {
    return this.projectsService.listProjects();
  }

  @Get('workspace/:workspaceGid')
  @ApiOperation({ summary: 'List projects by workspace' })
  getByWorkspace(@Param('workspaceGid') workspaceGid: string) {
    return this.projectsService.getByWorkspace(workspaceGid);
  }

  @Get(':projectGid')
  @ApiOperation({ summary: 'Get project by GID' })
  getById(@Param('projectGid') projectGid: string) {
    return this.projectsService.getByIdWrapped(projectGid);
  }
}

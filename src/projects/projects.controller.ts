import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  private projects: any[] = [];

  @Get()
  @ApiOperation({ summary: 'List projects' })
  list() {
    return { data: this.projects };
  }

  @Post()
  @ApiOperation({ summary: 'Create project' })
  create(@Body() body: any) {
    const project = {
        gid: Date.now().toString(),
        name: body.name,
        created_at: new Date().toISOString(),
      };
      
    this.projects.push(project);
    return { data: project };
  }
};


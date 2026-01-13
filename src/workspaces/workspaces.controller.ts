import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspacesController {
  private workspaces: any[] = [];

  @Get()
  @ApiOperation({ summary: 'List workspaces' })
  list() {
    return { data: this.workspaces };
  }

  @Post()
  @ApiOperation({ summary: 'Create workspace' })
  create(@Body() body: any) {
    const workspace = {
      gid: Date.now().toString(),
      name: body.name ?? 'My Workspace',
    };
    this.workspaces.push(workspace);
    return { data: workspace };
  }
}

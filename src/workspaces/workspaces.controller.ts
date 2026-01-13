import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspacesController {
  private workspaces: any[] = [];


  constructor(private service: WorkspacesService) {}

  // @Get()
  // @ApiOperation({ summary: 'List workspaces' })
  // list() {
  //   return { data: this.workspaces };
  // }

  // @Post()
  // @ApiOperation({ summary: 'Create workspace' })
  // create(@Body() body: any) {
  //   const workspace = {
  //     gid: Date.now().toString(),
  //     name: body.name ?? 'My Workspace',
  //   };
  //   this.workspaces.push(workspace);
  //   return { data: workspace };
  // }

  @Get()
  list() {
    return { data: this.service.findAll() };
  }

  @Post()
  create(@Body() body: CreateWorkspaceDto) {
    return { data: this.service.createWorkspace(body.name) };
  }
}

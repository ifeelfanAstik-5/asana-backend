import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceRequestDto } from './dto/create-workspace.dto';

@ApiTags('Workspaces')
@Controller('workspaces')
export class WorkspacesController {
  private workspaces: any[] = [];

  constructor(private service: WorkspacesService) {}
  @Get()
  async list() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() body: CreateWorkspaceRequestDto) {
    const payload = body.data;
    // Accept either `gid` or `workspaceGid` as the identifier
    const gid = payload.gid || payload.workspaceGid;
    if (!gid) {
      // Match tests expecting this message when missing
      throw new BadRequestException('workspaceGid is required');
    }
    const created = await this.service.createWorkspace(payload.name, gid);
    // Return minimal shape expected by tests
    return { gid: created.gid, name: created.name };
  }
}

import { Controller, Post, Get, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkspaceMembershipsService } from './workspace-memberships.service';
import { CreateWorkspaceMembershipDto } from './dto/create-workspace-membership.dto';

@Controller('workspace-memberships')
export class WorkspaceMembershipsController {
  constructor(private workspaceMembershipsService: WorkspaceMembershipsService) {}

  @Post()
  async create(@Body() createWorkspaceMembershipDto: CreateWorkspaceMembershipDto) {
    const result = await this.workspaceMembershipsService.create(createWorkspaceMembershipDto);
    if (result.error) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Get()
  findAll(@Query('workspaceGid') workspaceGid?: string) {
    return this.workspaceMembershipsService.findAll({ workspaceGid });
  }

  @Get(':gid')
  async findOne(@Param('gid') gid: string) {
    const membership = await this.workspaceMembershipsService.findOne(gid);
    if (!membership) {
      throw new NotFoundException(`WorkspaceMembership with gid ${gid} not found`);
    }
    return membership;
  }
}

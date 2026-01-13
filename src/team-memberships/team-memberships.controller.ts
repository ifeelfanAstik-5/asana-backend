import { Controller, Post, Get, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { TeamMembershipsService } from './team-memberships.service';
import { CreateTeamMembershipRequestDto } from './dto/create-team-membership.dto';

@Controller('team-memberships')
export class TeamMembershipsController {
  constructor(private teamMembershipsService: TeamMembershipsService) {}

  @Post()
  async create(@Body() body: CreateTeamMembershipRequestDto) {
    const result = await this.teamMembershipsService.create(body.data);
    if (result.error) {
      throw new BadRequestException(result.message);
    }
    return result;
  }

  @Get()
  findAll(@Query('teamGid') teamGid?: string) {
    return this.teamMembershipsService.findAll({ teamGid });
  }

  @Get(':gid')
  async findOne(@Param('gid') gid: string) {
    const membership = await this.teamMembershipsService.findOne(gid);
    if (!membership) {
      throw new NotFoundException(`TeamMembership with gid ${gid} not found`);
    }
    return membership;
  }
}

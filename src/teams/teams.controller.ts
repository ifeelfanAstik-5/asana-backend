import { Controller, Get, Post, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamRequestDto } from './dto/create-team.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create team' })
  async create(@Body() body: CreateTeamRequestDto) {
    const result = await this.teamsService.createTeam(body.data);
    if (result && typeof result === 'object' && 'error' in result) {
      throw new BadRequestException(result.error);
    }
    return { gid: result.gid, name: result.name };
  }

  @Get()
  @ApiOperation({ summary: 'List teams (optionally by workspace)' })
  async list(@Query('workspaceGid') workspaceGid?: string) {
    if (workspaceGid) {
      return this.teamsService.listTeamsByWorkspace(workspaceGid);
    }
    return this.teamsService.listAll();
  }

  @Get(':teamGid')
  @ApiOperation({ summary: 'Get team by GID' })
  async getById(@Param('teamGid') teamGid: string) {
    const team = await this.teamsService.getTeamById(teamGid);
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }
}

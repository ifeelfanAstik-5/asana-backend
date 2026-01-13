import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create team' })
  create(@Body() body: CreateTeamDto) {
    return this.teamsService.createTeam(body);
  }

  @Get()
  @ApiOperation({ summary: 'List teams (optionally by workspace)' })
  list(@Query('workspaceGid') workspaceGid?: string) {
    if (workspaceGid) {
      return this.teamsService.listTeamsByWorkspace(workspaceGid);
    }
    return this.teamsService.listAll();
  }

  @Get(':teamGid')
  @ApiOperation({ summary: 'Get team by GID' })
  getById(@Param('teamGid') teamGid: string) {
    return this.teamsService.getTeamById(teamGid);
  }
}

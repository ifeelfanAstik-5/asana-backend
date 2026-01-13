import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { Team } from './team.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class TeamsService extends InMemoryRepository<Team> {
  constructor(private readonly workspacesService: WorkspacesService) {
    super();
  }

  createTeam(payload: {
    name: string;
    workspaceGid: string;
    description?: string;
  }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid are required' };
    }

    const workspace = this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    const team: Team = {
      gid: crypto.randomUUID(),
      name: payload.name,
      workspaceGid: payload.workspaceGid,
      description: payload.description,
      createdAt: new Date().toISOString(),
    };

    this.create(team);
    return { data: team };
  }

  listTeamsByWorkspace(workspaceGid: string) {
    const data = this.findAll().filter((t) => t.workspaceGid === workspaceGid);
    return { data };
  }

  getTeamById(teamGid: string) {
    return { data: this.findById(teamGid) ?? null };
  }
}


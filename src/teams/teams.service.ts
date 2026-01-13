import { Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly prisma: PrismaService,
  ) {}

  async createTeam(payload: {
    name: string;
    workspaceGid: string;
    description?: string;
  }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid are required' };
    }

    const workspace = await this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    const team = await this.prisma.team.create({
      data: {
        gid: crypto.randomUUID(),
        name: payload.name,
        description: payload.description,
        workspace: {
          connect: { gid: payload.workspaceGid },
        },
      },
    });

    return { data: team };
  }

  async listTeamsByWorkspace(workspaceGid: string) {
    const data = await this.prisma.team.findMany({
      where: { workspace: { gid: workspaceGid } },
    });
    return { data };
  }

  async getTeamById(teamGid: string) {
    const team = await this.prisma.team.findUnique({
      where: { gid: teamGid },
    });
    return { data: team ?? null };
  }

  async listAll() {
    const data = await this.prisma.team.findMany();
    return { data };
  }
}


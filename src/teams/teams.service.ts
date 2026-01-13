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
    gid?: string;
  }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid are required' };
    }

    const workspace = await this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    return this.prisma.team.create({
      data: {
        gid: payload.gid || crypto.randomUUID(),
        name: payload.name,
        description: payload.description,
        workspace: {
          connect: { gid: payload.workspaceGid },
        },
      },
    });
  }

  async listTeamsByWorkspace(workspaceGid: string) {
    return this.prisma.team.findMany({
      where: { workspace: { gid: workspaceGid } },
    });
  }

  async getTeamById(teamGid: string) {
    return this.prisma.team.findUnique({
      where: { gid: teamGid },
    });
  }

  async listAll() {
    return this.prisma.team.findMany();
  }
}


import { Injectable } from '@nestjs/common';
import { Project } from './project.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly prisma: PrismaService,
  ) {}

  async createProject(payload: { name: string; workspaceGid: string; gid?: string }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid required' };
    }

    const workspace = await this.workspacesService.findById(
      payload.workspaceGid,
    );
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    return this.prisma.project.create({
      data: {
        gid: payload.gid || crypto.randomUUID(),
        name: payload.name,
        workspace: {
          connect: { gid: payload.workspaceGid },
        },
      },
    });
  }

  async listProjects() {
    return this.prisma.project.findMany();
  }

  async getByWorkspace(workspaceGid: string) {
    return this.prisma.project.findMany({
      where: { workspace: { gid: workspaceGid } },
    });
  }

  async getById(projectGid: string) {
    return this.prisma.project.findUnique({
      where: { gid: projectGid },
    });
  }

  async findById(projectGid: string) {
    return this.prisma.project.findUnique({
      where: { gid: projectGid },
    });
  }
}

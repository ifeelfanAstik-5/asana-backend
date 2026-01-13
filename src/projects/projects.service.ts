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

  async createProject(payload: { name: string; workspaceGid: string }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid required' };
    }

    const workspace = await this.workspacesService.findById(
      payload.workspaceGid,
    );
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    const project = await this.prisma.project.create({
      data: {
        gid: crypto.randomUUID(),
        name: payload.name,
        workspace: {
          connect: { gid: payload.workspaceGid },
        },
      },
    });

    return { data: project };
  }

  async listProjects() {
    const data = await this.prisma.project.findMany();
    return { data };
  }

  async getByWorkspace(workspaceGid: string) {
    const data = await this.prisma.project.findMany({
      where: { workspace: { gid: workspaceGid } },
    });
    return { data };
  }

  async getByIdWrapped(projectGid: string) {
    const project = await this.prisma.project.findUnique({
      where: { gid: projectGid },
    });
    return { data: project ?? null };
  }

  async findById(projectGid: string) {
    return this.prisma.project.findUnique({
      where: { gid: projectGid },
    });
  }
}

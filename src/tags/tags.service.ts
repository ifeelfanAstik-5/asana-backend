import { Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly prisma: PrismaService,
  ) {}

  async createTag(payload: { name: string; workspaceGid: string; color?: string; gid?: string }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid are required' };
    }

    const workspace = await this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    return this.prisma.tag.create({
      data: {
        gid: payload.gid || crypto.randomUUID(),
        name: payload.name,
        color: payload.color,
        workspace: { connect: { gid: payload.workspaceGid } },
      },
    });
  }

  async listTagsByWorkspace(workspaceGid: string) {
    return this.prisma.tag.findMany({
      where: { workspace: { gid: workspaceGid } },
    });
  }

  async listAll() {
    return this.prisma.tag.findMany();
  }

  async getTagById(tagGid: string) {
    return this.prisma.tag.findUnique({
      where: { gid: tagGid },
    });
  }
}


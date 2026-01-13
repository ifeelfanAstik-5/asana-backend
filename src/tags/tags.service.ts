import { Injectable } from '@nestjs/common';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly prisma: PrismaService,
  ) {}

  async createTag(payload: { name: string; workspaceGid: string; color?: string }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid are required' };
    }

    const workspace = await this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    const tag = await this.prisma.tag.create({
      data: {
        gid: crypto.randomUUID(),
        name: payload.name,
        color: payload.color,
        workspace: { connect: { gid: payload.workspaceGid } },
      },
    });

    return { data: tag };
  }

  async listTagsByWorkspace(workspaceGid: string) {
    const data = await this.prisma.tag.findMany({
      where: { workspace: { gid: workspaceGid } },
    });
    return { data };
  }

  async listAll() {
    const data = await this.prisma.tag.findMany();
    return { data };
  }

  async getTagById(tagGid: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { gid: tagGid },
    });
    return { data: tag ?? null };
  }
}


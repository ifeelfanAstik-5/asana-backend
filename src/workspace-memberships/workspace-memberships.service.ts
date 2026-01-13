import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceMembershipDto } from './dto/create-workspace-membership.dto';

@Injectable()
export class WorkspaceMembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkspaceMembershipDto: CreateWorkspaceMembershipDto): Promise<any> {
    if (!createWorkspaceMembershipDto.userGid || !createWorkspaceMembershipDto.workspaceGid) {
      return { error: true, message: 'UserGid and WorkspaceGid are required' };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { gid: createWorkspaceMembershipDto.userGid },
      });
      const workspace = await this.prisma.workspace.findUnique({
        where: { gid: createWorkspaceMembershipDto.workspaceGid },
      });

      if (!user || !workspace) {
        return { error: true, message: 'User or Workspace not found' };
      }

      const membership = await this.prisma.workspaceMembership.create({
        data: {
          gid: createWorkspaceMembershipDto.gid || `wm_${Date.now()}`,
          userId: user.id,
          workspaceId: workspace.id,
          role: (createWorkspaceMembershipDto.role as any) || 'member',
        },
      });

      return membership;
    } catch (error) {
      return { error: true, message: 'Failed to create workspace membership' };
    }
  }

  async findAll(filters?: { workspaceGid?: string }) {
    const where: any = {};

    if (filters?.workspaceGid) {
      const workspace = await this.prisma.workspace.findUnique({
        where: { gid: filters.workspaceGid },
      });
      if (workspace) {
        where.workspaceId = workspace.id;
      }
    }

    return this.prisma.workspaceMembership.findMany({ where });
  }

  async findOne(gid: string) {
    return this.prisma.workspaceMembership.findUnique({
      where: { gid },
    });
  }
}

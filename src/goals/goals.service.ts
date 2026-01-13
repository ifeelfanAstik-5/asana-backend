import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto): Promise<any> {
    if (!createGoalDto.name) {
      return { error: true, message: 'Name is required' };
    }

    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { gid: createGoalDto.workspaceGid },
      });

      if (!workspace) {
        return { error: true, message: 'Workspace not found' };
      }

      const goal = await this.prisma.goal.create({
        data: {
          gid: createGoalDto.gid || `goal_${Date.now()}`,
          name: createGoalDto.name,
          workspaceId: workspace.id,
        },
      });

      return goal;
    } catch (error) {
      return { error: true, message: 'Failed to create goal' };
    }
  }

  async findAll(filters?: { workspaceGid?: string }) {
    const where: any = {};

    if (filters?.workspaceGid) {
      // Convert gid to id by finding the workspace
      const workspace = await this.prisma.workspace.findUnique({
        where: { gid: filters.workspaceGid },
      });
      if (workspace) {
        where.workspaceId = workspace.id;
      }
    }

    return this.prisma.goal.findMany({ where });
  }

  async findOne(gid: string) {
    return this.prisma.goal.findUnique({
      where: { gid },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamMembershipDto } from './dto/create-team-membership.dto';

@Injectable()
export class TeamMembershipsService {
  constructor(private prisma: PrismaService) {}

  async create(createTeamMembershipDto: CreateTeamMembershipDto): Promise<any> {
    if (!createTeamMembershipDto.userGid || !createTeamMembershipDto.teamGid) {
      return { error: true, message: 'UserGid and TeamGid are required' };
    }

    try {
      const user = await this.prisma.user.findUnique({
        where: { gid: createTeamMembershipDto.userGid },
      });
      const team = await this.prisma.team.findUnique({
        where: { gid: createTeamMembershipDto.teamGid },
      });

      if (!user || !team) {
        return { error: true, message: 'User or Team not found' };
      }

      const membership = await this.prisma.teamMembership.create({
        data: {
          gid: createTeamMembershipDto.gid || `tm_${Date.now()}`,
          userId: user.id,
          teamId: team.id,
          role: (createTeamMembershipDto.role as any) || 'member',
        },
      });

      return membership;
    } catch (error) {
      return { error: true, message: 'Failed to create team membership' };
    }
  }

  async findAll(filters?: { teamGid?: string }) {
    const where: any = {};

    if (filters?.teamGid) {
      const team = await this.prisma.team.findUnique({
        where: { gid: filters.teamGid },
      });
      if (team) {
        where.teamId = team.id;
      }
    }

    return this.prisma.teamMembership.findMany({ where });
  }

  async findOne(gid: string) {
    return this.prisma.teamMembership.findUnique({
      where: { gid },
    });
  }
}

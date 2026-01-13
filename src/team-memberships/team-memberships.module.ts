import { Module } from '@nestjs/common';
import { TeamMembershipsController } from './team-memberships.controller';
import { TeamMembershipsService } from './team-memberships.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TeamMembershipsController],
  providers: [TeamMembershipsService],
})
export class TeamMembershipsModule {}

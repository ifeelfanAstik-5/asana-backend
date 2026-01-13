import { Module } from '@nestjs/common';
import { WorkspaceMembershipsController } from './workspace-memberships.controller';
import { WorkspaceMembershipsService } from './workspace-memberships.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkspaceMembershipsController],
  providers: [WorkspaceMembershipsService],
})
export class WorkspaceMembershipsModule {}

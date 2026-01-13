import { Module } from '@nestjs/common';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [WorkspacesModule, PrismaModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}

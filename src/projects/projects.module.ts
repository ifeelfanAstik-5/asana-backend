import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [WorkspacesModule, PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}

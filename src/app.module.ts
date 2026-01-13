import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { UsersModule } from './users/users.module';
import { SectionsModule } from './sections/sections.module';
import { TagsModule } from './tags/tags.module';
import { GoalsModule } from './goals/goals.module';
import { TeamsModule } from './teams/teams.module';

@Module({
  imports: [
    TasksModule,
    ProjectsModule,
    WorkspacesModule,
    UsersModule,  
    SectionsModule,
    TagsModule,
    GoalsModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

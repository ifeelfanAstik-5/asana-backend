import { Module } from '@nestjs/common';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [WorkspacesModule, PrismaModule],
  controllers: [TagsController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}

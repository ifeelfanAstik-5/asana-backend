import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';

@Injectable()
export class StoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createStoryDto: CreateStoryDto): Promise<any> {
    if (!createStoryDto.text) {
      return { error: true, message: 'Text is required' };
    }

    try {
      const task = await this.prisma.task.findUnique({
        where: { gid: createStoryDto.taskGid },
      });

      if (!task) {
        return { error: true, message: 'Task not found' };
      }

      const story = await this.prisma.story.create({
        data: {
          gid: createStoryDto.gid || `story_${Date.now()}`,
          text: createStoryDto.text,
          taskId: task.id,
          createdById: createStoryDto.createdById,
        },
      });

      return story;
    } catch (error) {
      return { error: true, message: 'Failed to create story' };
    }
  }

  async findAll(filters?: { taskGid?: string }) {
    const where: any = {};

    if (filters?.taskGid) {
      const task = await this.prisma.task.findUnique({
        where: { gid: filters.taskGid },
      });
      if (task) {
        where.taskId = task.id;
      }
    }

    return this.prisma.story.findMany({ where });
  }

  async findOne(gid: string) {
    return this.prisma.story.findUnique({
      where: { gid },
    });
  }
}

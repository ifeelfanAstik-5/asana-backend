import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {}

  async createTask(payload: { name: string; projectGid: string }) {
    if (!payload || !payload.name || !payload.projectGid) {
      return { error: 'Task name and projectGid required' };
    }

    const project = await this.projectsService.findById(payload.projectGid);
    if (!project) {
      return { error: 'Project does not exist' };
    }

    const task = await this.prisma.task.create({
      data: {
        gid: crypto.randomUUID(),
        name: payload.name,
        project: { connect: { gid: payload.projectGid } },
        workspace: { connect: { id: project.workspaceId } },
      },
    });

    return { data: task };
  }

  async listTasks() {
    const data = await this.prisma.task.findMany();
    return { data };
  }

  async getByProject(projectGid: string) {
    const data = await this.prisma.task.findMany({
      where: { project: { gid: projectGid } },
    });
    return { data };
  }

  async getByIdWrapped(taskGid: string) {
    const task = await this.prisma.task.findUnique({
      where: { gid: taskGid },
    });
    return { data: task ?? null };
  }
}

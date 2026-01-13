import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {}

  private async transformTask(task: any) {
    // Get the project to retrieve projectGid
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });
    return {
      ...task,
      projectGid: project?.gid,
    };
  }

  async createTask(payload: { name: string; projectGid: string; workspaceGid: string; gid?: string; notes?: string; completed?: boolean }) {
    if (!payload || !payload.name || !payload.projectGid) {
      return { error: 'Task name and projectGid required' };
    }

    const project = await this.projectsService.findById(payload.projectGid);
    if (!project) {
      return { error: 'Project does not exist' };
    }

    const task = await this.prisma.task.create({
      data: {
        gid: payload.gid || crypto.randomUUID(),
        name: payload.name,
        notes: payload.notes,
        completed: payload.completed || false,
        project: { connect: { gid: payload.projectGid } },
        workspace: { connect: { id: project.workspaceId } },
      },
    });

    return this.transformTask(task);
  }

  async listTasks() {
    const tasks = await this.prisma.task.findMany();
    return Promise.all(tasks.map(task => this.transformTask(task)));
  }

  async getByProject(projectGid: string) {
    const tasks = await this.prisma.task.findMany({
      where: { project: { gid: projectGid } },
    });
    return Promise.all(tasks.map(task => this.transformTask(task)));
  }

  async getById(taskGid: string) {
    const task = await this.prisma.task.findUnique({
      where: { gid: taskGid },
    });
    if (!task) return null;
    return this.transformTask(task);
  }

  async updateTask(taskGid: string, data: any) {
    const task = await this.prisma.task.update({
      where: { gid: taskGid },
      data,
    });
    return this.transformTask(task);
  }

  async deleteTask(taskGid: string) {
    return this.prisma.task.delete({
      where: { gid: taskGid },
    });
  }
}

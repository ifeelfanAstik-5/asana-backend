import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { Task } from './task.entity';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class TasksService extends InMemoryRepository<Task> {
  constructor(private readonly projectsService: ProjectsService) {
    super();
  }

  createTask(payload: { name: string; projectGid: string }) {
    if (!payload || !payload.name || !payload.projectGid) {
      return { error: 'Task name and projectGid required' };
    }

    const project = this.projectsService.findById(payload.projectGid);
    if (!project) {
      return { error: 'Project does not exist' };
    }

    const task: Task = {
      gid: crypto.randomUUID(),
      name: payload.name,
      projectGid: payload.projectGid,
      completed: false,
      createdAt: new Date().toISOString(),
      workspaceGid: project.workspaceGid,
    };

    this.create(task);
    return { data: task };
  }

  listTasks() {
    return { data: this.findAll() };
  }

  getByProject(projectGid: string) {
    const data = this.findAll().filter(t => t.projectGid === projectGid);
    return { data };
  }

  getByIdWrapped(taskGid: string) {
    return { data: this.findById(taskGid) ?? null };
  }
}

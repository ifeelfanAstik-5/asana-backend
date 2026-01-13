import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { Project } from './project.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ProjectsService extends InMemoryRepository<Project> {
  constructor(private readonly workspacesService: WorkspacesService) {
    super();
  }

  createProject(payload: { name: string; workspaceGid: string }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid required' };
    }

    const workspace = this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    const project: Project = {
      gid: crypto.randomUUID(),
      name: payload.name,
      workspaceGid: payload.workspaceGid,
      createdAt: new Date().toISOString(),
    };

    this.create(project);
    return { data: project };
  }

  listProjects() {
    return { data: this.findAll() };
  }

  getByWorkspace(workspaceGid: string) {
    const data = this.findAll().filter(p => p.workspaceGid === workspaceGid);
    return { data };
  }

  getByIdWrapped(projectGid: string) {
    return { data: this.findById(projectGid) ?? null };
  }
}

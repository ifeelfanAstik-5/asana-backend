import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { Workspace } from './workspace.entity';

@Injectable()
export class WorkspacesService extends InMemoryRepository<Workspace> {
  createWorkspace(name: string) {
    return this.create({
      gid: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    });
  }
}

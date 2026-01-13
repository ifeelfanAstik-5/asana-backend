import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { Tag } from './tag.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class TagsService extends InMemoryRepository<Tag> {
  constructor(private readonly workspacesService: WorkspacesService) {
    super();
  }

  createTag(payload: { name: string; workspaceGid: string; color?: string }) {
    if (!payload || !payload.name || !payload.workspaceGid) {
      return { error: 'Name and workspaceGid are required' };
    }

    const workspace = this.workspacesService.findById(payload.workspaceGid);
    if (!workspace) {
      return { error: 'Workspace does not exist' };
    }

    const tag: Tag = {
      gid: crypto.randomUUID(),
      name: payload.name,
      workspaceGid: payload.workspaceGid,
      color: payload.color,
      createdAt: new Date().toISOString(),
    };

    this.create(tag);
    return { data: tag };
  }

  listTagsByWorkspace(workspaceGid: string) {
    const data = this.findAll().filter((t) => t.workspaceGid === workspaceGid);
    return { data };
  }

  getTagById(tagGid: string) {
    return { data: this.findById(tagGid) ?? null };
  }
}


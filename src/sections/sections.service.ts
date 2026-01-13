import { Injectable } from '@nestjs/common';
import { InMemoryRepository } from '../common/inmemory.repository';
import { Section } from './section.entity';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class SectionsService extends InMemoryRepository<Section> {
  constructor(private readonly projectsService: ProjectsService) {
    super();
  }

  createSection(payload: { name: string; projectGid: string; order?: number }) {
    if (!payload || !payload.name || !payload.projectGid) {
      return { error: 'Name and projectGid are required' };
    }

    const project = this.projectsService.findById(payload.projectGid);
    if (!project) {
      return { error: 'Project does not exist' };
    }

    const existing = this.findAll().filter(
      (s) => s.projectGid === payload.projectGid,
    );
    const order =
      payload.order ??
      (existing.length ? Math.max(...existing.map((s) => s.order)) + 1 : 0);

    const section: Section = {
      gid: crypto.randomUUID(),
      name: payload.name,
      projectGid: payload.projectGid,
      order,
      createdAt: new Date().toISOString(),
    };

    this.create(section);
    return { data: section };
  }

  listSectionsByProject(projectGid: string) {
    const data = this.findAll()
      .filter((s) => s.projectGid === projectGid)
      .sort((a, b) => a.order - b.order);
    return { data };
  }

  getSectionById(sectionGid: string) {
    return { data: this.findById(sectionGid) ?? null };
  }
}

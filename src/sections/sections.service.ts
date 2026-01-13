import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionsService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly prisma: PrismaService,
  ) {}

  async createSection(payload: { name: string; projectGid: string; order?: number }) {
    if (!payload || !payload.name || !payload.projectGid) {
      return { error: 'Name and projectGid are required' };
    }

    const project = await this.projectsService.findById(payload.projectGid);
    if (!project) {
      return { error: 'Project does not exist' };
    }

    const existing = await this.prisma.section.findMany({
      where: { project: { gid: payload.projectGid } },
    });

    const order =
      payload.order ??
      (existing.length ? Math.max(...existing.map((s) => s.order)) + 1 : 0);

    const section = await this.prisma.section.create({
      data: {
        gid: crypto.randomUUID(),
        name: payload.name,
        order,
        project: { connect: { gid: payload.projectGid } },
      },
    });

    return { data: section };
  }

  async listSectionsByProject(projectGid: string) {
    const data = await this.prisma.section.findMany({
      where: { project: { gid: projectGid } },
      orderBy: { order: 'asc' },
    });
    return { data };
  }

  async listAll() {
    const data = await this.prisma.section.findMany();
    return { data };
  }

  async getSectionById(sectionGid: string) {
    const section = await this.prisma.section.findUnique({
      where: { gid: sectionGid },
    });
    return { data: section ?? null };
  }
}

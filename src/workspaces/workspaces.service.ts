import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorkspace(name: string) {
    return this.prisma.workspace.create({
      data: {
        gid: crypto.randomUUID(),
        name,
      },
    });
  }

  async findAll() {
    return this.prisma.workspace.findMany();
  }

  async findById(workspaceGid: string) {
    return this.prisma.workspace.findUnique({
      where: { gid: workspaceGid },
    });
  }
}

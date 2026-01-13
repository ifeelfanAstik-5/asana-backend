import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkspacesService, PrismaService],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a workspace', async () => {
    const workspace = await service.createWorkspace('Test Workspace');
    expect(workspace).toHaveProperty('gid');
    expect(workspace.name).toBe('Test Workspace');
  });

  it('should list workspaces', async () => {
    const list = await service.findAll();
    expect(Array.isArray(list)).toBe(true);
  });
});

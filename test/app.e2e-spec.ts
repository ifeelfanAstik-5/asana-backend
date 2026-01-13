import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Asana Backend Replica (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // State shared between tests to simulate real workflow
  let sharedWorkspaceGid: string;
  let sharedProjectGid: string;
  let sharedTaskGid: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Ensure the validation pipe is active to catch edge cases / 400s
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data to ensure repeatable runs
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.workspace.deleteMany();
    await app.close();
  });

  describe('Workspaces Endpoint', () => {
    it('POST /workspaces - Should create a workspace', async () => {
      const payload = { name: 'Main Office', gid: 'ws_101' };
      const response = await request(app.getHttpServer())
        .post('/workspaces')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject(payload);
      sharedWorkspaceGid = response.body.gid;
    });

    it('POST /workspaces - [Edge Case] Fail on missing name', async () => {
      await request(app.getHttpServer())
        .post('/workspaces')
        .send({ gid: 'ws_fail' })
        .expect(400);
    });

    it('GET /workspaces - Should list workspaces', async () => {
      const response = await request(app.getHttpServer())
        .get('/workspaces')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Projects Endpoint', () => {
    it('POST /projects - Should create a project in a workspace', async () => {
      const payload = { 
        name: 'Website Redesign', 
        gid: 'proj_202',
        workspaceGid: sharedWorkspaceGid 
      };
      const response = await request(app.getHttpServer())
        .post('/projects')
        .send(payload)
        .expect(201);

      expect(response.body.name).toBe(payload.name);
      sharedProjectGid = response.body.gid;
    });

    it('GET /projects/:gid - [Edge Case] 404 for invalid Project ID', async () => {
      await request(app.getHttpServer())
        .get('/projects/non_existent_gid')
        .expect(404);
    });
  });

  describe('Tasks Endpoint', () => {
    it('POST /tasks - Should create a task and link to project', async () => {
      const payload = {
        name: 'Design Homepage',
        gid: 'task_303',
        projectGid: sharedProjectGid,
        workspaceGid: sharedWorkspaceGid,
        notes: 'Use Asana brand colors'
      };
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send(payload)
        .expect(201);

      expect(response.body.gid).toBe(payload.gid);
      sharedTaskGid = response.body.gid;
    });

    it('GET /tasks - [Filtering] Should filter tasks by project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tasks?project=${sharedProjectGid}`)
        .expect(200);

      expect(response.body.every(task => task.projectGid === sharedProjectGid)).toBe(true);
    });

    it('PATCH /tasks/:gid - Should update task completion status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/tasks/${sharedTaskGid}`)
        .send({ completed: true })
        .expect(200);

      expect(response.body.completed).toBe(true);
    });

    it('DELETE /tasks/:gid - Should remove a task', async () => {
      await request(app.getHttpServer())
        .delete(`/tasks/${sharedTaskGid}`)
        .expect(200);

      // Verify it's gone
      await request(app.getHttpServer())
        .get(`/tasks/${sharedTaskGid}`)
        .expect(404);
    });
  });

  describe('Global Edge Case: Data Integrity', () => {
    it('Should fail to create a task for a project that doesn’t exist', async () => {
      const response = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          name: 'Orphan Task',
          gid: 'task_orphan',
          projectGid: 'does_not_exist',
          workspaceGid: sharedWorkspaceGid
        })
        .expect(400); // Or 404 depending on your Service implementation
    });
  });
});
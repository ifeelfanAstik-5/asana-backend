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
  let sharedUserGid: string;
  let sharedTagGid: string;
  let sharedTeamGid: string;
  let sharedSectionGid: string;
  let sharedGoalGid: string;
  let sharedStoryGid: string;
  let sharedWorkspaceMembershipGid: string;
  let sharedTeamMembershipGid: string;

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
    await prisma.story.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.task.deleteMany();
    await prisma.section.deleteMany();
    await prisma.project.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.teamMembership.deleteMany();
    await prisma.team.deleteMany();
    await prisma.workspaceMembership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.workspace.deleteMany();
    await app.close();
  }, 15000);

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
  describe('Users Endpoint', () => {
    it('POST /users - Should create a user', async () => {
      const payload = {
        name: 'John Doe',
        email: 'john@example.com',
        gid: 'user_101'
      };
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: payload.name,
        email: payload.email,
        gid: payload.gid
      });
      sharedUserGid = response.body.gid;
    });

    it('POST /users - [Edge Case] Fail on missing email', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({ name: 'Jane Doe', gid: 'user_fail' })
        .expect(400);
    });

    it('GET /users - Should list users', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /users/:gid - Should get user by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${sharedUserGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedUserGid);
    });

    it('GET /users/:gid - [Edge Case] 404 for invalid User ID', async () => {
      await request(app.getHttpServer())
        .get('/users/non_existent_user')
        .expect(404);
    });
  });

  describe('Tags Endpoint', () => {
    it('POST /tags - Should create a tag', async () => {
      const payload = {
        name: 'Urgent',
        workspaceGid: sharedWorkspaceGid,
        color: 'red',
        gid: 'tag_101'
      };
      const response = await request(app.getHttpServer())
        .post('/tags')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: payload.name,
        gid: payload.gid
      });
      sharedTagGid = response.body.gid;
    });

    it('POST /tags - [Edge Case] Fail on missing name', async () => {
      await request(app.getHttpServer())
        .post('/tags')
        .send({ workspaceGid: sharedWorkspaceGid, gid: 'tag_fail' })
        .expect(400);
    });

    it('GET /tags - Should list all tags', async () => {
      const response = await request(app.getHttpServer())
        .get('/tags')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /tags?workspaceGid=:gid - Should filter tags by workspace', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tags?workspaceGid=${sharedWorkspaceGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.every(tag => tag.workspaceId)).toBe(true);
    });

    it('GET /tags/:gid - Should get tag by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tags/${sharedTagGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedTagGid);
    });

    it('GET /tags/:gid - [Edge Case] 404 for invalid Tag ID', async () => {
      await request(app.getHttpServer())
        .get('/tags/non_existent_tag')
        .expect(404);
    });
  });

  describe('Teams Endpoint', () => {
    it('POST /teams - Should create a team', async () => {
      const payload = {
        name: 'Engineering',
        workspaceGid: sharedWorkspaceGid,
        description: 'Engineering team',
        gid: 'team_101'
      };
      const response = await request(app.getHttpServer())
        .post('/teams')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: payload.name,
        gid: payload.gid
      });
      sharedTeamGid = response.body.gid;
    });

    it('POST /teams - [Edge Case] Fail on missing workspaceGid', async () => {
      await request(app.getHttpServer())
        .post('/teams')
        .send({ name: 'Design', gid: 'team_fail' })
        .expect(400);
    });

    it('GET /teams - Should list all teams', async () => {
      const response = await request(app.getHttpServer())
        .get('/teams')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /teams?workspaceGid=:gid - Should filter teams by workspace', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams?workspaceGid=${sharedWorkspaceGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].workspaceId).toBeDefined();
      }
    });

    it('GET /teams/:gid - Should get team by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/teams/${sharedTeamGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedTeamGid);
    });

    it('GET /teams/:gid - [Edge Case] 404 for invalid Team ID', async () => {
      await request(app.getHttpServer())
        .get('/teams/non_existent_team')
        .expect(404);
    });
  });

  describe('Sections Endpoint', () => {
    it('POST /sections - Should create a section', async () => {
      const payload = {
        name: 'Todo',
        projectGid: sharedProjectGid,
        gid: 'sec_101'
      };
      const response = await request(app.getHttpServer())
        .post('/sections')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: payload.name,
        gid: payload.gid
      });
      sharedSectionGid = response.body.gid;
    });

    it('POST /sections - [Edge Case] Fail on missing projectGid', async () => {
      await request(app.getHttpServer())
        .post('/sections')
        .send({ name: 'InProgress', gid: 'sec_fail' })
        .expect(400);
    });

    it('GET /sections - Should list all sections', async () => {
      const response = await request(app.getHttpServer())
        .get('/sections')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /sections?projectGid=:gid - Should filter sections by project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sections?projectGid=${sharedProjectGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].projectId).toBeDefined();
      }
    });

    it('GET /sections/:gid - Should get section by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sections/${sharedSectionGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedSectionGid);
    });

    it('GET /sections/:gid - [Edge Case] 404 for invalid Section ID', async () => {
      await request(app.getHttpServer())
        .get('/sections/non_existent_section')
        .expect(404);
    });
  });

  describe('Goals Endpoint', () => {
    it('POST /goals - Should create a goal', async () => {
      const payload = {
        name: 'Q1 Growth',
        workspaceGid: sharedWorkspaceGid,
        gid: 'goal_101'
      };
      const response = await request(app.getHttpServer())
        .post('/goals')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: payload.name,
        gid: payload.gid
      });
      sharedGoalGid = response.body.gid;
    });

    it('POST /goals - [Edge Case] Fail on missing name', async () => {
      await request(app.getHttpServer())
        .post('/goals')
        .send({ workspaceGid: sharedWorkspaceGid, gid: 'goal_fail' })
        .expect(400);
    });

    it('GET /goals - Should list all goals', async () => {
      const response = await request(app.getHttpServer())
        .get('/goals')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /goals?workspaceGid=:gid - Should filter goals by workspace', async () => {
      const response = await request(app.getHttpServer())
        .get(`/goals?workspaceGid=${sharedWorkspaceGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /goals/:gid - Should get goal by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/goals/${sharedGoalGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedGoalGid);
    });

    it('GET /goals/:gid - [Edge Case] 404 for invalid Goal ID', async () => {
      await request(app.getHttpServer())
        .get('/goals/non_existent_goal')
        .expect(404);
    });
  });

  describe('Stories Endpoint', () => {
    let storyTestTaskGid: string;
    
    beforeAll(async () => {
      // Create a task for story tests  
      const projectResponse = await request(app.getHttpServer())
        .post('/projects')
        .send({
          name: 'Story Test Project',
          workspaceGid: sharedWorkspaceGid,
          gid: 'proj_story_test'
        });
      
      const taskResponse = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          name: 'Story Test Task',
          projectGid: projectResponse.body.gid,
          workspaceGid: sharedWorkspaceGid,
          gid: 'task_story_test'
        });
      
      storyTestTaskGid = taskResponse.body.gid;
    });

    it('POST /stories - Should create a story/comment on task', async () => {
      const payload = {
        text: 'This is a comment',
        taskGid: storyTestTaskGid,
        gid: 'story_101'
      };
      const response = await request(app.getHttpServer())
        .post('/stories')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        text: payload.text,
        gid: payload.gid
      });
      sharedStoryGid = response.body.gid;
    });

    it('POST /stories - [Edge Case] Fail on missing text', async () => {
      await request(app.getHttpServer())
        .post('/stories')
        .send({ taskGid: storyTestTaskGid, gid: 'story_fail' })
        .expect(400);
    });

    it('GET /stories - Should list all stories', async () => {
      const response = await request(app.getHttpServer())
        .get('/stories')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /stories?taskGid=:gid - Should filter stories by task', async () => {
      const response = await request(app.getHttpServer())
        .get(`/stories?taskGid=${storyTestTaskGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0].taskId).toBeDefined();
      }
    });

    it('GET /stories/:gid - Should get story by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/stories/${sharedStoryGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedStoryGid);
    });

    it('GET /stories/:gid - [Edge Case] 404 for invalid Story ID', async () => {
      await request(app.getHttpServer())
        .get('/stories/non_existent_story')
        .expect(404);
    });
  });

  describe('WorkspaceMembership Endpoint', () => {
    it('POST /workspace-memberships - Should add user to workspace', async () => {
      const payload = {
        userGid: sharedUserGid,
        workspaceGid: sharedWorkspaceGid,
        role: 'member',
        gid: 'wm_101'
      };
      const response = await request(app.getHttpServer())
        .post('/workspace-memberships')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        role: payload.role,
        gid: payload.gid
      });
      sharedWorkspaceMembershipGid = response.body.gid;
    });

    it('POST /workspace-memberships - [Edge Case] Fail on missing userGid', async () => {
      await request(app.getHttpServer())
        .post('/workspace-memberships')
        .send({ workspaceGid: sharedWorkspaceGid, role: 'member', gid: 'wm_fail' })
        .expect(400);
    });

    it('GET /workspace-memberships - Should list all workspace memberships', async () => {
      const response = await request(app.getHttpServer())
        .get('/workspace-memberships')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /workspace-memberships?workspaceGid=:gid - Should filter by workspace', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workspace-memberships?workspaceGid=${sharedWorkspaceGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /workspace-memberships/:gid - Should get membership by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/workspace-memberships/${sharedWorkspaceMembershipGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedWorkspaceMembershipGid);
    });

    it('GET /workspace-memberships/:gid - [Edge Case] 404 for invalid Membership ID', async () => {
      await request(app.getHttpServer())
        .get('/workspace-memberships/non_existent_membership')
        .expect(404);
    });
  });

  describe('TeamMembership Endpoint', () => {
    it('POST /team-memberships - Should add user to team', async () => {
      const payload = {
        userGid: sharedUserGid,
        teamGid: sharedTeamGid,
        role: 'member',
        gid: 'tm_101'
      };
      const response = await request(app.getHttpServer())
        .post('/team-memberships')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        role: payload.role,
        gid: payload.gid
      });
      sharedTeamMembershipGid = response.body.gid;
    });

    it('POST /team-memberships - [Edge Case] Fail on missing userGid', async () => {
      await request(app.getHttpServer())
        .post('/team-memberships')
        .send({ teamGid: sharedTeamGid, role: 'member', gid: 'tm_fail' })
        .expect(400);
    });

    it('GET /team-memberships - Should list all team memberships', async () => {
      const response = await request(app.getHttpServer())
        .get('/team-memberships')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('GET /team-memberships?teamGid=:gid - Should filter by team', async () => {
      const response = await request(app.getHttpServer())
        .get(`/team-memberships?teamGid=${sharedTeamGid}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('GET /team-memberships/:gid - Should get membership by GID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/team-memberships/${sharedTeamMembershipGid}`)
        .expect(200);

      expect(response.body.gid).toBe(sharedTeamMembershipGid);
    });

    it('GET /team-memberships/:gid - [Edge Case] 404 for invalid Membership ID', async () => {
      await request(app.getHttpServer())
        .get('/team-memberships/non_existent_membership')
        .expect(404);
    });
  });
});

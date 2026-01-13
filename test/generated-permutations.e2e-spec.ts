import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AsanaExceptionFilter } from '../src/common/filters/asana-exception.filter';
import { AsanaWrapperInterceptor } from '../src/common/interceptors/asana-wrapper.interceptor';

jest.setTimeout(30000);

describe('AI-Generated Permutation Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Initialized with dummy values to prevent "undefined" URL errors
  let sharedWorkspaceGid: string = 'ws_123';
  let sharedProjectGid: string = 'proj_123';
  let sharedTaskGid: string = 'task_123';
  let sharedUserGid: string = 'user_123';
  let sharedTagGid: string = 'tag_123';
  let sharedTeamGid: string = 'team_123';
  let sharedSectionGid: string = 'sec_123';
  let sharedGoalGid: string = 'goal_123';
  let sharedStoryGid: string = 'story_123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new AsanaWrapperInterceptor());
    app.useGlobalFilters(new AsanaExceptionFilter());
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    try {
      const workspace = await prisma.workspace.create({
        data: { gid: sharedWorkspaceGid, name: 'Test Workspace' }
      });

      const user = await prisma.user.create({
        data: { 
          gid: sharedUserGid, 
          name: 'Test User', 
          email: 'testuser@example.com' 
        }
      });

      const project = await prisma.project.create({
        data: { 
          gid: sharedProjectGid, 
          name: 'Test Project',
          workspaceId: workspace.id // Use internal DB ID
        }
      });

      const team = await prisma.team.create({
        data: {
          gid: sharedTeamGid,
          name: 'Test Team',
          workspaceId: workspace.id
        }
      });
    } catch (error) {
      console.error('Seed data creation failed:', error);
    }
  });

  afterAll(async () => {
    // Correct cleanup sequence
    const tables = [
        'story', 'goal', 'task', 'section', 'project', 'tag', 
        'teamMembership', 'team', 'workspaceMembership', 'user', 'workspace'
    ];
    for (const table of tables) {
        await (prisma as any)[table].deleteMany().catch(() => {});
    }
    await app.close();
  });

  
it('should successfully create a workspace with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/workspaces')
    .send({
      data: {
        workspaceGid: '123',
        name: 'Test Workspace'
      }
    });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: 'Test Workspace'
    }
  });
});

it('should successfully create a workspace with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/workspaces')
    .send({
      data: {
        workspaceGid: '124',
        name: 'Test Workspace with Options',
        notes: 'Additional notes here',
        completed: false
      }
    });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: 'Test Workspace with Options'
    }
  });
});

it('should return 400 error when workspaceGid is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/workspaces')
    .send({
      data: {
        name: 'Test Workspace without GID'
      }
    });

  expect(response.status).toBe(400);
  expect(response.body).toMatchObject({
    data: {
      errors: [
        {
          message: expect.stringContaining('workspaceGid is required')
        }
      ]
    }
  });
});

it('should successfully create a project with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/projects')
    .send({
      data: {
        workspaceGid: '123',
        name: 'New Project',
        gid: '456'
      }
    });
  
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    gid: '456',
    name: 'New Project'
  });
});

it('should successfully create a project with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/projects')
    .send({ 
      data: {
        workspaceGid: '123',
        name: 'New Detailed Project',
        gid: '789',
        notes: 'This is a detailed project',
        completed: false
      }
    });
  
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    gid: '789',
    name: 'New Detailed Project'
  });
});

it('should return a 400 error when a required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/projects')
    .send({
      data: {
        name: 'Invalid Project'
        // missing workspaceGid and gid
      }
    });

  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});

it('should successfully create a task with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/tasks')
    .send({
      data: {
        workspaceGid: '123abc',
        projectGid: '456def',
        name: 'Sample Task'
      }
    });

  expect(response.status).toBe(200);
  expect(response.body.data).toMatchObject({
    gid: expect.any(String),
    name: 'Sample Task'
  });
});

it('should successfully create a task with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/tasks')
    .send({
      data: {
        workspaceGid: '123abc',
        projectGid: '456def',
        name: 'Sample Task',
        notes: 'Some notes about the task',
        completed: false
      }
    });

  expect(response.status).toBe(200);
  expect(response.body.data).toMatchObject({
    gid: expect.any(String),
    name: 'Sample Task'
  });
});

it('should return 400 when a required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/tasks')
    .send({
      data: {
        projectGid: '456def',
        name: 'Incomplete Task'
      }
    });

  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});

it('should create a user with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/users')
    .send({
      data: {
        gid: '123',
        name: 'Test User',
      }
    });
  
  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: '123',
      name: 'Test User',
    },
  });
});

it('should create a user with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/users')
    .send({ data: {
        gid: '124',
        name: 'Optional Fields User',
        notes: 'This is an optional note',
        completed: true,
      }
    });

  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    gid: '124',
    name: 'Optional Fields User',
  });
});

it('should return 400 when required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/users')
    .send({
      data: {
      name: 'Missing GID',
    }
    });

  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});

it('should create a team with required fields successfully', async () => {
  const response = await request(app.getHttpServer())
    .post('/teams')
    .send({
      data: {
        gid: '12345',
        name: 'Development Team'
      }
    });
  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: 'Development Team'
    }
  });
});

it('should create a team with optional fields successfully', async () => {
  const response = await request(app.getHttpServer())
    .post('/teams')
    .send({
      data: {
        gid: '67890',
        name: 'QA Team',
        notes: 'Handles testing',
        completed: false
      }
    });
  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    gid: expect.any(String),
    name: 'Todo'
  });
});

it('should return a 400 error when a required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/teams')
    .send({
      data: {
        name: 'Ops Team'
      }
    });
  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});

it('should create a tag with only required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/tags')
    .send({
      data: {
      workspaceGid: '123',
      name: 'Test Tag'
    }
    });

  expect(response.status).toBe(201);
  expect(response.body.data).toMatchObject({
    gid: expect.any(String),
    name: 'Test Tag'
  });
});

it('should create a tag with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/tags')
    .send({
      data: {
      workspaceGid: '123',
      name: 'Test Tag with Notes',
      notes: 'Additional notes for the tag',
      completed: true
    }
    });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: 'Test Tag with Notes'
    }
  });
});

it('should return 400 error when required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/tags')
            .send({
              data: {
                name: 'Tag without GID'
              }
            });

  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});

it('should create a section with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/sections')
    .send({
      data: {
        workspaceGid: '123',
        projectGid: '456',
        name: 'New Section'
      }
    });
  
  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: 'New Section'
    }
  });
});

it('should create a section with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/sections')
    .send({
      data: {
        workspaceGid: '123',
        projectGid: '456',
        name: 'New Section with Notes',
        notes: 'This is a note.',
        completed: true
      }
    });
  
  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: 'New Section with Notes'
    }
  });
});

it('should return a 400 error when a required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/sections')
    .send({
      data: {
      projectGid: '456',
      name: 'Section Without Workspace'
    }
    });
  
  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});

it('should successfully create a goal with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/goals')
    .send({
      data: {
        gid: '123',
        name: 'Goal Name',
        workspaceGid: 'workspace_gid_1',
        projectGid: 'project_gid_1'
      }
    });

  expect(response.status).toBe(201);
  expect(response.body).toMatchObject({
    data: {
      gid: '123',
      name: 'Goal Name'
    }
  });
});

it('should successfully create a goal with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/goals')
    .send({
      data: {
        gid: '124',
        name: 'Goal Name with Notes',
        workspaceGid: 'workspace_gid_2',
        projectGid: 'project_gid_2',
        notes: 'This is a note',
        completed: false
      }
    });

  expect(response.status).toBe(201);
  expect(response.body).toMatchObject({
    data: {
      gid: '124',
      name: 'Goal Name with Notes'
    }
  });
});

it('should return 400 when a required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/goals')
    .send({
      data: {
        gid: '125',
        name: 'Goal Name without Workspace GID',
        projectGid: 'project_gid_3'
      }
    });

  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});


it('should successfully create a story with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/stories')
    .send({
      data: {
        workspaceGid: '123',
        projectGid: '456',
        storyGid: '789',
        name: 'New Story'
      }
    });
  
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    data: {
      gid: '789',
      name: 'New Story'
    }
  });
});

it('should successfully create a story with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/stories')
    .send({
      data: {
      workspaceGid: '123',
      projectGid: '456',
      storyGid: '987',
      name: 'New Story with Notes',
      notes: 'Some additional information',
      completed: true
    }
    });
  
  expect(response.status).toBe(200);
  expect(response.body).toEqual({
    data: {
      gid: '987',
      name: 'New Story with Notes'
    }
  });
});

it('should return 400 error when a required GID field is missing', async () => {
  const response = await request(app.getHttpServer())
    .post('/stories')
    .send({
      workspaceGid: '123',
      name: 'Incomplete Story'
    });
  
  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
});


it('should successfully create a workspace membership with required fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/workspace-memberships')
    .send({
      data: {
      workspaceGid: '12345',
      userGid: '67890'
    }
    });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: expect.any(String)
    }
  });
});

it('should successfully create a workspace membership with optional fields', async () => {
  const response = await request(app.getHttpServer())
    .post('/workspace-memberships')
    .send({
      data: {
      workspaceGid: '12345',
      userGid: '67890',
      notes: 'Some optional notes',
      completed: true
    }
    });

  expect(response.status).toBe(201);
  expect(response.body).toEqual({
    data: {
      gid: expect.any(String),
      name: expect.any(String)
    }
  });
});

it('should fail to create a workspace membership when missing a required GID field', async () => {
  const response = await request(app.getHttpServer())
    .post('/workspace-memberships')
    .send({
      userGid: '67890'
    });

  expect(response.status).toBe(400);
  expect(Array.isArray(response.body.data.errors)).toBe(true);
  expect(response.body.data.errors.length).toBeGreaterThan(0);
  expect(typeof response.body.data.errors[0].message).toBe('string');
  });
});


describe('Team Memberships Endpoint', () => {
    let app: INestApplication;
  let prisma: PrismaService;

  // Initialized with dummy values to prevent "undefined" URL errors
  let sharedWorkspaceGid: string = 'ws_123';
  let sharedProjectGid: string = 'proj_123';
  let sharedTaskGid: string = 'task_123';
  let sharedUserGid: string = 'user_123';
  let sharedTagGid: string = 'tag_123';
  let sharedTeamGid: string = 'team_123';
  let sharedSectionGid: string = 'sec_123';
  let sharedGoalGid: string = 'goal_123';
  let sharedStoryGid: string = 'story_123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalInterceptors(new AsanaWrapperInterceptor());
    app.useGlobalFilters(new AsanaExceptionFilter());
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    try {
      const workspace = await prisma.workspace.create({
        data: { gid: sharedWorkspaceGid, name: 'Test Workspace' }
      });

      const user = await prisma.user.create({
        data: { 
          gid: sharedUserGid, 
          name: 'Test User', 
          email: 'testuser@example.com' 
        }
      });

      const project = await prisma.project.create({
        data: { 
          gid: sharedProjectGid, 
          name: 'Test Project',
          workspaceId: workspace.id // Use internal DB ID
        }
      });

      const team = await prisma.team.create({
        data: {
          gid: sharedTeamGid,
          name: 'Test Team',
          workspaceId: workspace.id
        }
      });
    } catch (error) {
      console.error('Seed data creation failed:', error);
    }
  });

  afterAll(async () => {
    // Correct cleanup sequence
    const tables = [
        'story', 'goal', 'task', 'section', 'project', 'tag', 
        'teamMembership', 'team', 'workspaceMembership', 'user', 'workspace'
    ];
    for (const table of tables) {
        await (prisma as any)[table].deleteMany().catch(() => {});
    }
    await app.close();
  });

  it('should create a team membership with required fields successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/team-memberships')
      .send({
        data: {
        workspaceGid: 'workspace123',
        projectGid: 'project123',
        userGid: 'user123'
      }
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: {
        gid: expect.any(String),
        name: expect.any(String)
      }
    });
  });

  it('should create a team membership with optional fields successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/team-memberships')
      .send({
        data: {
          workspaceGid: 'workspace123',
          projectGid: 'project123',
          userGid: 'user123',
          notes: 'This is a test membership',
          completed: true
        }
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: {
        gid: expect.any(String),
        name: expect.any(String)
      }
    });
  });

  it('should return a 400 error when a required GID field is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/team-memberships')
      .send({
        data: {
        projectGid: 'project123',
        userGid: 'user123'
      }
      });

    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.data.errors)).toBe(true);
    expect(response.body.data.errors.length).toBeGreaterThan(0);
    expect(typeof response.body.data.errors[0].message).toBe('string');
  });
});
// (Removed extra closing bracket)
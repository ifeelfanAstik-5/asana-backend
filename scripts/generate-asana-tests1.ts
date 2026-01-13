import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import axios from 'axios';

const OPENAI_API_KEY = ''; // Add your OpenAI API key here
const OAS_URL = 'https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml';
const OUTPUT_FILE = './test/generated-permutations.e2e-spec.ts';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function runTestGeneration() {
  console.log('🚀 Fetching Asana OpenAPI Contract...');
  const oasResponse = await axios.get(OAS_URL);
  const oas: any = yaml.load(oasResponse.data);
  
  // List of resources your app handles based on your e2e-spec
  const resources = [
    'workspaces', 'projects', 'tasks', 'users', 'teams', 
    'tags', 'sections', 'goals', 'stories', 
    'workspace-memberships', 'team-memberships'
  ];
  
  let allGeneratedTests = '';

  for (const resource of resources) {
    console.log(`🧠 Analyzing permutations for: ${resource}...`);
    // Extract the schema for this resource from the OAS
    const pathData = oas.paths[`/${resource}`] || {};

    // const prompt = `
    //   As a Senior QA Engineer, generate 3 Jest/Supertest "it" blocks for the "${resource}" endpoint.
      
    //   CONTEXT:
    //   - Use ONLY these variables for IDs: sharedWorkspaceGid, sharedProjectGid, sharedTaskGid, sharedUserGid, sharedTagGid, sharedTeamGid, sharedSectionGid, sharedGoalGid, sharedStoryGid.
    //   - NestJS Setup: Use "request(app.getHttpServer())". 
    //   - Response Format: Asana uses a {"data": { ... }} wrapper. Check for this.
    //   - Permutations: 
    //     1. Create with only required fields.
    //     2. Create with ALL optional fields (look at the OAS for fields like 'notes', 'completed', 'due_on').
    //     3. A negative test (e.g., missing a required field, expecting 400).

    //   OUTPUT: ONLY provide the code for the "it" blocks. NO markdown backticks (\`\`\`typescript).
    // `;

    // const prompt = `
    //   As a Senior QA Engineer, generate 5-8 Jest "it" blocks for the "${resource}" endpoint.
      
    //   CONTRACT RULES:
    //   1. Use EXACTLY these field names for GIDs: workspaceGid, projectGid, taskGid, userGid, teamGid, sectionGid, goalGid, storyGid. (DO NOT use 'workspace' or 'project' as keys).
    //   2. All responses (success AND error) are wrapped in {"data": ...}.
    //   3. For errors, check: expect(response.body.data.errors[0].message).toBeDefined();

    //   OUTPUT ONLY THE CODE.
    // `;

    const prompt = `
      As a Senior QA Engineer, generate 3 Jest "it" blocks for the "${resource}" endpoint.
      
      CRITICAL DTO MAPPING (Follow this or tests will fail):
      1. Use camelCase for ALL keys: 'workspaceGid', 'projectGid', 'taskGid', 'userGid', 'teamGid', 'sectionGid', 'goalGid', 'storyGid'.
      2. NEVER use 'workspace', 'project', or snake_case (like 'user_gid').
      3. The unique identifier is ALWAYS 'gid', never 'id'.
      
      CONTRACT RULES:
      - Successful responses are wrapped: { data: { gid: "...", name: "..." } }.
      - Error responses (400/404) are wrapped: { data: { errors: [ { message: "..." } ] } }.
      - Use "request(app.getHttpServer())".
      
      TEST CASES TO GENERATE:
      - 1x Positive: Create with required fields.
      - 1x Positive: Create with optional fields (notes, completed).
      - 1x Negative: Send a request missing a required GID field, expect 400.

      OUTPUT ONLY THE CODE. No markdown backticks.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    let code = completion.choices[0].message.content || '';
    // Strip markdown just in case the AI ignores instructions
    code = code.replace(/```typescript/g, '').replace(/```/g, '');
    allGeneratedTests += code + '\n\n';
  }

  // FIXED TEMPLATE: Correct imports and server initialization
  const finalFileContent = `
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

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
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);
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

  ${allGeneratedTests}
});`;

  fs.writeFileSync(OUTPUT_FILE, finalFileContent);
  console.log('✅ File created successfully: ' + OUTPUT_FILE);
}

runTestGeneration();
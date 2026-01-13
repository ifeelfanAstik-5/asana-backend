import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import axios from 'axios';

// 1. CLEAN URL
const OAS_URL = 'https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml';
const OPENAI_API_KEY = ''; // Add your OpenAI API key here
const OUTPUT_FILE = './test/generated-permutations.e2e-spec.ts';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function runTestGeneration() {
  console.log('🚀 Fetching Asana OpenAPI Contract...');
  const oasResponse = await axios.get(OAS_URL.trim());
  const oas: any = yaml.load(oasResponse.data);
  
  const resources = [
    'projects', 'tasks', 'users', 'teams', 'goals' 
    // Reduced list to save tokens and focus on core failures
  ];
  
  let allGeneratedTests = '';

  for (const resource of resources) {
    console.log(`🧠 Analyzing permutations for: ${resource}...`);
    const pathData = oas.paths[`/${resource}`] || {};

    const prompt = `
      As a Senior QA Engineer, generate 3 Jest "it" blocks for the "${resource}" endpoint.
      
      STRICT RULES:
      1. Use ONLY camelCase for IDs: workspaceGid, projectGid, taskGid, userGid.
      2. The response is ALWAYS wrapped: { data: { gid: "..." } }.
      3. For errors, check: expect(res.body.data.errors[0].message).toBeDefined().
      4. Use the variables sharedWorkspaceGid, sharedUserGid, etc.
      
      OUTPUT ONLY THE CODE. No markdown.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    let code = completion.choices[0].message.content || '';
    code = code.replace(/```typescript/g, '').replace(/```/g, '');
    allGeneratedTests += code + '\n\n';
  }

  const finalFileContent = `
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AsanaWrapperInterceptor } from '../src/common/interceptors/asana-wrapper.interceptor';
import { AsanaExceptionFilter } from '../src/common/filters/asana-exception.filter';

describe('AI-Generated Permutation Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Shared variables
  let sharedWorkspaceGid: string;
  let sharedUserGid: string;
  let sharedProjectGid: string;
  let sharedTaskGid: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    // Apply Interceptor and Filter to match Main.ts
    app.useGlobalInterceptors(new AsanaWrapperInterceptor());
    app.useGlobalFilters(new AsanaExceptionFilter());
    
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // --- SEED DATA FOR TESTS ---
    // 1. Create Workspace
    const ws = await prisma.workspace.create({ data: { name: "AI Test WS", gid: "ws_" + Date.now() } });
    sharedWorkspaceGid = ws.gid;

    // 2. Create User
    const user = await prisma.user.create({ data: { name: "AI Tester", email: "ai@test.com", gid: "u_" + Date.now() } });
    sharedUserGid = user.gid;

    // 3. Create Project
    const proj = await prisma.project.create({ data: { name: "AI Proj", gid: "p_" + Date.now(), workspaceGid: sharedWorkspaceGid } });
    sharedProjectGid = proj.gid;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.task.deleteMany().catch(()=>{});
    await prisma.project.deleteMany().catch(()=>{});
    await prisma.user.deleteMany().catch(()=>{});
    await prisma.workspace.deleteMany().catch(()=>{});
    await app.close();
  });

  ${allGeneratedTests}
});`;

  fs.writeFileSync(OUTPUT_FILE, finalFileContent);
  console.log('✅ File created successfully at: ' + OUTPUT_FILE);
}

runTestGeneration();
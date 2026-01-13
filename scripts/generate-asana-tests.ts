import { OpenAI } from 'openai';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import axios from 'axios';

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual key
const OAS_URL = 'https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml';

// might need to adjust based on your existing test file structure
const EXISTING_TEST_PATH = './test/app.e2e-spec.ts';
const OUTPUT_FILE = './test/generated-permutations.e2e-spec.ts';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function runTestGeneration() {
  console.log('🚀 Fetching Asana OpenAPI Contract...');
  const oasResponse = await axios.get(OAS_URL);
  const oas: any = yaml.load(oasResponse.data);
  
  const existingTests = fs.readFileSync(EXISTING_TEST_PATH, 'utf8');

  // We iterate through major resources to keep prompts focused and recursive
  const resources = ['tasks', 'projects', 'workspaces', 'users', 'goals', 'teams', 'tags', 'sections', 'stories', 'team-memberships', 'workspace-memberships'];
  let allGeneratedTests = '';

  for (const resource of resources) {
    console.log(`🧠 Analyzing permutations for: ${resource}...`);
    
    // Extract relevant paths and schemas from OAS for this resource
    const resourceContract = {
      paths: Object.fromEntries(Object.entries(oas.paths).filter(([path]) => path.includes(resource))),
      schema: oas.components.schemas[resource.charAt(0).toUpperCase() + resource.slice(1) + 'Response']
    };

    const prompt = `
      You are an expert QA Engineer. I have a NestJS backend replicating Asana.
      
      API CONTRACT (OAS):
      ${JSON.stringify(resourceContract, null, 2)}

      EXISTING TEST CONTEXT:
      ${existingTests.substring(0, 1500)} // Providing start of file for shared variables/setup

      TASK:
      1. Identify 5-8 missing test permutations for "${resource}".
      2. Focus on:
         - Optional field combinations (e.g., creating a task with notes but no project, or vice versa).
         - Data type edge cases (e.g., sending numbers as strings if the contract allows, or checking 400s for invalid formats).
         - EXACT response validation: Use ".toMatchObject()" or ".toStrictEqual()" to verify the entire "data" envelope matches the OAS.
      3. Use the shared variables (sharedWorkspaceGid, etc.) from the context.
      
      OUTPUT:
      Only provide the TypeScript code for the "describe" block. No explanations.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: "You generate production-grade NestJS E2E tests." }, { role: "user", content: prompt }],
    });

    allGeneratedTests += completion.choices[0].message.content + '\n\n';
  }

  const finalFileContent = `
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI-Generated Permutation Tests (Contract Compliance)', () => {
  let app: INestApplication;
  // ... Copy your existing beforeAll/afterAll logic here ...
  
  ${allGeneratedTests}
});`;

  fs.writeFileSync(OUTPUT_FILE, finalFileContent);
  console.log('✅ Generated comprehensive test suite at: ' + OUTPUT_FILE);
}

runTestGeneration();
# Asana Backend Replica - Implementation Plan (3 Hours)

## Overview
This plan prioritizes **must-have requirements** and focuses on core functionality that demonstrates a working Asana backend replica.

## Time Allocation Strategy
- **Hour 1**: Database setup + Core APIs (Users, Workspaces, Projects)
- **Hour 2**: Tasks API + Relationships (assignees, subtasks, dependencies)
- **Hour 3**: Docker setup + Edge cases + Testing + Documentation

---

## Phase 1: Foundation Setup (30 minutes)

### 1.1 Install Dependencies
```bash
# Core dependencies
npm install @nestjs/config @nestjs/passport passport passport-jwt @types/passport-jwt class-validator class-transformer bcrypt @types/bcrypt

# OpenAPI code generation
npm install --save-dev @openapitools/openapi-generator-cli
```

### 1.2 Download & Generate API from OpenAPI Spec
```bash
# Download the OpenAPI spec
curl -o asana_oas.yaml https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml

# Generate NestJS server stubs (this creates controllers, DTOs, etc.)
npx @openapitools/openapi-generator-cli generate \
  -i asana_oas.yaml \
  -g typescript-nestjs \
  -o src/generated \
  --additional-properties=serviceFileSuffix=Service,modelFileSuffix=Dto,enumPropertyNaming=original

# Alternative: Use openapi-generator directly
# npx openapi-generator-cli generate -i asana_oas.yaml -g typescript-nestjs -o src/generated
```

**Note:** The generated code will include:
- Controllers for all endpoints
- DTOs (Data Transfer Objects) matching Asana's schema
- Service interfaces (you'll implement the actual logic)

**After generation:**
- Review generated structure in `src/generated/`
- Import and wire up controllers in `app.module.ts`
- Implement service methods with Prisma database calls

### 1.3 Database Schema (Prisma)
Create `prisma/schema.prisma` with core entities:
- **User** (id, gid, name, email, photo)
- **Workspace** (id, gid, name, isOrganization)
- **Team** (id, gid, name, workspaceId)
- **Project** (id, gid, name, notes, archived, workspaceId, teamId)
- **Task** (id, gid, name, notes, completed, dueOn, projectId, parentTaskId)
- **Story** (id, gid, text, type, taskId, createdById) - for comments
- **Attachment** (id, gid, name, downloadUrl, taskId)
- **Relationships**: WorkspaceMember, TeamMember, ProjectMember, TaskAssignee, TaskDependency

### 1.3 Database Setup
```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/asana_db"

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init
```

### 1.4 Prisma Service Module
Create `src/prisma/prisma.service.ts` and `src/prisma/prisma.module.ts`

---

## Phase 2: API Implementation Strategy (60 minutes)

### 2.1 Review Generated Code Structure
After OpenAPI generation, you'll have:
- `src/generated/api/` - Controllers (already structured)
- `src/generated/model/` - DTOs matching Asana schemas
- `src/generated/services/` - Service interfaces

### 2.2 Implement Service Layer (Business Logic)
**Create service implementations** that connect generated controllers to Prisma:

**For each resource (Users, Workspaces, Projects, Tasks, etc.):**

1. **Create Service Implementation** (`src/services/users.service.ts`):
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '../generated/model/user-dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(limit?: number, offset?: string): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: offset ? parseInt(offset) : undefined,
    });
    return users.map(u => this.toDto(u));
  }

  async findOne(gid: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { gid } });
    if (!user) throw new NotFoundException();
    return this.toDto(user);
  }

  private toDto(user: any): UserDto {
    return {
      gid: user.gid,
      name: user.name,
      email: user.email,
      photo: user.photo,
      // ... map other fields
    };
  }
}
```

2. **Wire up in Module** (`src/app.module.ts`):
```typescript
import { UsersApiController } from './generated/api/users-api.controller';
import { UsersService } from './services/users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersApiController, WorkspacesApiController, ...],
  providers: [UsersService, WorkspacesService, ...],
})
```

### 2.3 Response Format Wrapper
**Create response interceptor** to wrap all responses in Asana format:
```typescript
// src/interceptors/asana-response.interceptor.ts
@Injectable()
export class AsanaResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({ data }))
    );
  }
}
```

### 2.4 Priority Implementation Order
Focus on implementing services for:
1. **Users** - Basic CRUD
2. **Workspaces** - CRUD + members
3. **Projects** - CRUD + tasks relationship
4. **Tasks** - CRUD + subtasks + dependencies + stories
5. **Teams** - If time permits

---

## Phase 3: Complex Relationships & Business Logic (60 minutes)

### 3.1 Task Service Implementation
**Implement complex relationships** in `src/services/tasks.service.ts`:

- **Task Assignees** (many-to-many via TaskAssignee table)
- **Subtasks** (self-referential via parentTaskId)
- **Task Dependencies** (via TaskDependency table)
- **Task Stories/Comments** (via Story model)

**Key methods:**
```typescript
async createTask(createTaskDto: CreateTaskDto): Promise<TaskDto> {
  // Handle assignees, project, parent task relationships
}

async getSubtasks(gid: string): Promise<TaskDto[]> {
  const task = await this.prisma.task.findUnique({ where: { gid } });
  const subtasks = await this.prisma.task.findMany({
    where: { parentTaskId: task.id }
  });
  return subtasks.map(t => this.toDto(t));
}

async addDependency(taskGid: string, dependencyGid: string) {
  // Create TaskDependency record
}
```

### 3.2 Story/Comment Service
**Implement** `src/services/stories.service.ts`:
- Link stories to tasks
- Include creator information
- Support different story types (comment, system, etc.)

### 3.3 Relationship Validation
**Add validation** to ensure:
- Tasks belong to valid projects
- Subtasks have valid parent tasks
- Dependencies don't create cycles
- Users exist before assigning to tasks

---

## Phase 4: Docker & Edge Cases (30 minutes)

### 4.1 Docker Setup
**Create `Dockerfile`:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**Create `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: asana_user
      POSTGRES_PASSWORD: asana_password
      POSTGRES_DB: asana_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://asana_user:asana_password@postgres:5432/asana_db
      PORT: 3000
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm run start:prod"

volumes:
  postgres_data:
```

### 4.2 Edge Case Handling
**Add to all endpoints:**
- Input validation (class-validator DTOs)
- 404 errors for non-existent resources
- 400 errors for invalid input
- 500 errors with proper error messages
- Pagination support (limit, offset)
- Filtering and sorting
- Relationship validation (e.g., task must belong to project)

### 4.3 Error Handling Middleware
Create global exception filter for consistent error responses

### 4.4 Swagger Documentation
Set up Swagger/OpenAPI in `main.ts`:
```typescript
const config = new DocumentBuilder()
  .setTitle('Asana API Replica')
  .setDescription('Backend service replicating Asana functionality')
  .setVersion('1.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

---

## Phase 5: Testing & Polish (30 minutes)

### 5.1 Basic Testing
- Test core endpoints with Postman/curl
- Verify relationships work correctly
- Test edge cases (invalid IDs, missing data)

### 5.2 Documentation
- Update README.md with setup instructions
- Document API endpoints
- Add .env.example file

### 5.3 Final Checks
- Ensure docker-compose works: `docker-compose up`
- Verify all must-have endpoints are implemented
- Check error handling

---

## API Endpoints Summary (Must-Have)

### Users
- `GET /users`
- `GET /users/:gid`
- `GET /users/me`

### Workspaces
- `GET /workspaces`
- `GET /workspaces/:gid`
- `POST /workspaces`
- `PUT /workspaces/:gid`
- `GET /workspaces/:gid/users`

### Projects
- `GET /projects`
- `GET /projects/:gid`
- `POST /projects`
- `PUT /projects/:gid`
- `DELETE /projects/:gid`
- `GET /projects/:gid/tasks`

### Tasks
- `GET /tasks`
- `GET /tasks/:gid`
- `POST /tasks`
- `PUT /tasks/:gid`
- `DELETE /tasks/:gid`
- `GET /tasks/:gid/subtasks`
- `POST /tasks/:gid/subtasks`
- `GET /tasks/:gid/stories`
- `POST /tasks/:gid/stories`

### Teams (Optional if time permits)
- `GET /teams`
- `GET /teams/:gid`
- `POST /teams`

---

## Response Format (Asana-style)
All responses should follow Asana API format:
```json
{
  "data": {
    "gid": "12345",
    "name": "Task Name",
    ...
  }
}
```

For lists:
```json
{
  "data": [
    { "gid": "12345", ... },
    { "gid": "67890", ... }
  ]
}
```

---

## Quick Start Commands

```bash
# 1. Install dependencies
npm install

# 2. Download and generate API from OpenAPI spec
curl -o asana_oas.yaml https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml
npx @openapitools/openapi-generator-cli generate \
  -i asana_oas.yaml \
  -g typescript-nestjs \
  -o src/generated \
  --additional-properties=serviceFileSuffix=Service,modelFileSuffix=Dto

# 3. Set up database
cp .env.example .env  # Edit DATABASE_URL
npx prisma generate
npx prisma migrate dev

# 4. Run locally
npm run start:dev

# 5. Or run with Docker
docker-compose up
```

## OpenAPI Generation Notes

### Generation Options
The `typescript-nestjs` generator creates:
- **Controllers** with decorators (`@Get`, `@Post`, etc.)
- **DTOs** matching Asana's schema exactly
- **Service interfaces** (you implement the logic)

### Customization After Generation
1. **Modify generated controllers** if needed (or extend them)
2. **Implement service classes** that match the generated interfaces
3. **Map Prisma models** to generated DTOs
4. **Add validation** using class-validator decorators on DTOs

### Handling Generated Code
- **Don't modify** `src/generated/` directly (it will be overwritten)
- **Extend** generated classes in your own modules
- **Implement** service logic in `src/services/`
- **Wire up** in `app.module.ts`

---

## Notes
- **OpenAPI Generation** saves ~80% of manual endpoint coding time
- Focus on **implementing service layer** (business logic) after generation
- Use **Asana API reference** for exact endpoint structure: https://developers.asana.com/reference/rest-api-reference
- **OpenAPI Spec**: https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml
- Prioritize **CRUD operations** for main entities
- **Edge cases**: Handle missing resources, invalid IDs, validation errors
- **Time management**: 
  - Generation takes ~5 minutes
  - Service implementation takes most time
  - If running short, skip optional features (Teams, Attachments) and focus on Users, Workspaces, Projects, Tasks

---

## Success Criteria
✅ Database schema with core entities  
✅ All must-have API endpoints implemented  
✅ Docker setup working with docker-compose  
✅ Edge case handling (404, 400, validation)  
✅ Swagger documentation accessible  
✅ Can create workspace → project → task → comment flow

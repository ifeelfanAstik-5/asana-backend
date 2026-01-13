# OpenAPI Code Generation Guide

## Quick Start

### Step 1: Install OpenAPI Generator
```bash
npm install --save-dev @openapitools/openapi-generator-cli
```

### Step 2: Download Asana OpenAPI Spec
```bash
curl -o asana_oas.yaml https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml
```

### Step 3: Generate NestJS Code
```bash
npx @openapitools/openapi-generator-cli generate \
  -i asana_oas.yaml \
  -g typescript-nestjs \
  -o src/generated \
  --additional-properties=serviceFileSuffix=Service,modelFileSuffix=Dto,enumPropertyNaming=original
```

## What Gets Generated

### Structure
```
src/generated/
├── api/                    # Controllers (endpoints)
│   ├── users-api.controller.ts
│   ├── workspaces-api.controller.ts
│   ├── projects-api.controller.ts
│   ├── tasks-api.controller.ts
│   └── ...
├── model/                  # DTOs (Data Transfer Objects)
│   ├── user-dto.ts
│   ├── workspace-dto.ts
│   ├── project-dto.ts
│   └── ...
└── services/               # Service interfaces
    ├── users-api.service.ts
    ├── workspaces-api.service.ts
    └── ...
```

### Example Generated Controller
```typescript
// src/generated/api/users-api.controller.ts
@Controller('users')
export class UsersApiController {
  constructor(private readonly usersApiService: UsersApiService) {}

  @Get()
  getUsers(@Query() query: GetUsersRequest): Observable<Array<UserCompact>> {
    return this.usersApiService.getUsers(query);
  }

  @Get(':gid')
  getUser(@Param('gid') gid: string): Observable<UserResponse> {
    return this.usersApiService.getUser(gid);
  }
}
```

## Implementation Strategy

### 1. Create Service Implementations

**Don't modify generated files!** Instead, create your own service implementations:

```typescript
// src/services/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto, UserCompact } from '../generated/model/user-dto';
import { UsersApiService } from '../generated/services/users-api.service';

@Injectable()
export class UsersService implements UsersApiService {
  constructor(private prisma: PrismaService) {}

  async getUsers(query: any): Promise<UserCompact[]> {
    const users = await this.prisma.user.findMany({
      take: query.limit,
      skip: query.offset,
    });
    return users.map(u => this.toCompactDto(u));
  }

  async getUser(gid: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ 
      where: { gid },
      include: { workspaces: true } // Include relations
    });
    if (!user) throw new NotFoundException(`User ${gid} not found`);
    return this.toDto(user);
  }

  private toDto(user: any): UserDto {
    return {
      gid: user.gid,
      resourceType: 'user',
      name: user.name,
      email: user.email,
      photo: user.photo ? { image_21x21: user.photo } : undefined,
    };
  }

  private toCompactDto(user: any): UserCompact {
    return {
      gid: user.gid,
      resourceType: 'user',
      name: user.name,
    };
  }
}
```

### 2. Wire Up in App Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersApiController } from './generated/api/users-api.controller';
import { WorkspacesApiController } from './generated/api/workspaces-api.controller';
import { ProjectsApiController } from './generated/api/projects-api.controller';
import { TasksApiController } from './generated/api/tasks-api.controller';
import { UsersService } from './services/users.service';
import { WorkspacesService } from './services/workspaces.service';
import { ProjectsService } from './services/projects.service';
import { TasksService } from './services/tasks.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    UsersApiController,
    WorkspacesApiController,
    ProjectsApiController,
    TasksApiController,
    // ... add more controllers
  ],
  providers: [
    { provide: 'UsersApiService', useClass: UsersService },
    { provide: 'WorkspacesApiService', useClass: WorkspacesService },
    { provide: 'ProjectsApiService', useClass: ProjectsService },
    { provide: 'TasksApiService', useClass: TasksService },
    // ... add more services
  ],
})
export class AppModule {}
```

### 3. Add Response Wrapper Interceptor

```typescript
// src/interceptors/asana-response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AsanaResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Wrap in Asana's { data: ... } format
        if (Array.isArray(data)) {
          return { data };
        }
        return { data };
      })
    );
  }
}
```

**Apply globally in main.ts:**
```typescript
app.useGlobalInterceptors(new AsanaResponseInterceptor());
```

## Common Issues & Solutions

### Issue 1: Generated code uses Observables
**Solution:** Convert to Promises in your service implementations:
```typescript
// Instead of Observable, return Promise
async getUser(gid: string): Promise<UserDto> {
  // ... implementation
}
```

### Issue 2: DTOs don't match Prisma models
**Solution:** Create mapper functions (like `toDto()`, `toCompactDto()`)

### Issue 3: Missing relationships in generated DTOs
**Solution:** Manually include relations when querying Prisma:
```typescript
const task = await this.prisma.task.findUnique({
  where: { gid },
  include: {
    assignees: { include: { user: true } },
    project: true,
    subtasks: true,
  }
});
```

## Regenerating Code

If you need to regenerate (e.g., after updating OpenAPI spec):
```bash
# Remove old generated code
rm -rf src/generated

# Regenerate
npx @openapitools/openapi-generator-cli generate \
  -i asana_oas.yaml \
  -g typescript-nestjs \
  -o src/generated \
  --additional-properties=serviceFileSuffix=Service,modelFileSuffix=Dto
```

**Note:** Your service implementations won't be affected since they're in `src/services/`

## Time-Saving Tips

1. **Generate once** at the start - don't regenerate during development
2. **Focus on service layer** - that's where your business logic goes
3. **Use Prisma relations** - leverage Prisma's relationship handling
4. **Create base mapper** - common DTO mapping utilities
5. **Batch implement** - implement similar services together (all CRUD operations)

## Priority Endpoints to Implement

Based on the OpenAPI spec, prioritize these:

1. **Users** (`/users/*`)
2. **Workspaces** (`/workspaces/*`)
3. **Projects** (`/projects/*`)
4. **Tasks** (`/tasks/*`)
5. **Stories** (`/tasks/{gid}/stories`)
6. **Teams** (`/teams/*`) - if time permits

## References

- [Asana OpenAPI Spec](https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml)
- [OpenAPI Generator Docs](https://openapi-generator.tech/docs/generators/typescript-nestjs)
- [Asana API Reference](https://developers.asana.com/reference/rest-api-reference)

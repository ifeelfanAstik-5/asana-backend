# Quick Start Guide - 3 Hour Implementation

## 🎯 Strategy: OpenAPI Code Generation

Instead of manually writing 200+ endpoints, we'll:
1. **Generate** API structure from Asana's OpenAPI spec (5 min)
2. **Implement** business logic in service layer (2.5 hours)
3. **Dockerize** and test (25 min)

---

## ⚡ Step-by-Step Execution

### Step 1: Install & Generate (5 minutes)

```bash
# Install OpenAPI generator
npm install --save-dev @openapitools/openapi-generator-cli

# Run generation script
./scripts/generate-api.sh

# Or manually:
curl -o asana_oas.yaml https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml
npx @openapitools/openapi-generator-cli generate \
  -i asana_oas.yaml \
  -g typescript-nestjs \
  -o src/generated \
  --additional-properties=serviceFileSuffix=Service,modelFileSuffix=Dto
```

**Result:** All controllers, DTOs, and service interfaces generated in `src/generated/`

---

### Step 2: Database Setup (10 minutes)

```bash
# Install Prisma dependencies (if not already)
npm install @prisma/client prisma

# Create Prisma schema (see IMPLEMENTATION_PLAN.md Phase 1.3)
# Then:
npx prisma generate
npx prisma migrate dev --name init
```

---

### Step 3: Implement Core Services (90 minutes)

**Priority order:**

1. **Users Service** (15 min)
   - `src/services/users.service.ts`
   - Implement: `getUsers()`, `getUser(gid)`, `getMe()`

2. **Workspaces Service** (20 min)
   - `src/services/workspaces.service.ts`
   - Implement: CRUD + `getWorkspaceUsers()`

3. **Projects Service** (25 min)
   - `src/services/projects.service.ts`
   - Implement: CRUD + `getProjectTasks()`

4. **Tasks Service** (30 min)
   - `src/services/tasks.service.ts`
   - Implement: CRUD + subtasks + dependencies + stories

**Template for each service:**
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { [Resource]ApiService } from '../generated/services/[resource]-api.service';
import { [Resource]Dto } from '../generated/model/[resource]-dto';

@Injectable()
export class [Resource]Service implements [Resource]ApiService {
  constructor(private prisma: PrismaService) {}

  async get[Resource]s(query: any): Promise<[Resource]Dto[]> {
    // Implement with Prisma
  }

  async get[Resource](gid: string): Promise<[Resource]Dto> {
    // Implement with Prisma
  }
}
```

---

### Step 4: Wire Up Modules (10 minutes)

**Update `src/app.module.ts`:**
```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
// Import generated controllers
import { UsersApiController } from './generated/api/users-api.controller';
import { WorkspacesApiController } from './generated/api/workspaces-api.controller';
// ... more controllers

// Import your service implementations
import { UsersService } from './services/users.service';
import { WorkspacesService } from './services/workspaces.service';
// ... more services

@Module({
  imports: [PrismaModule],
  controllers: [
    UsersApiController,
    WorkspacesApiController,
    ProjectsApiController,
    TasksApiController,
  ],
  providers: [
    { provide: 'UsersApiService', useClass: UsersService },
    { provide: 'WorkspacesApiService', useClass: WorkspacesService },
    { provide: 'ProjectsApiService', useClass: ProjectsService },
    { provide: 'TasksApiService', useClass: TasksService },
  ],
})
export class AppModule {}
```

---

### Step 5: Add Response Interceptor (5 minutes)

**Create `src/interceptors/asana-response.interceptor.ts`:**
```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AsanaResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => ({ data })));
  }
}
```

**Update `src/main.ts`:**
```typescript
import { AsanaResponseInterceptor } from './interceptors/asana-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new AsanaResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
```

---

### Step 6: Docker Setup (15 minutes)

**Create `Dockerfile`:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
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
    depends_on:
      - postgres
    command: sh -c "npx prisma migrate deploy && npm run start:prod"

volumes:
  postgres_data:
```

**Test:**
```bash
docker-compose up
```

---

### Step 7: Error Handling & Validation (10 minutes)

**Create global exception filter:**
```typescript
// src/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      errors: Array.isArray(exceptionResponse) 
        ? exceptionResponse 
        : [{ message: exceptionResponse }]
    });
  }
}
```

**Apply in `main.ts`:**
```typescript
app.useGlobalFilters(new HttpExceptionFilter());
```

---

## 📋 Checklist

- [ ] OpenAPI code generated
- [ ] Prisma schema created and migrated
- [ ] Users service implemented
- [ ] Workspaces service implemented
- [ ] Projects service implemented
- [ ] Tasks service implemented
- [ ] Controllers wired up in app.module.ts
- [ ] Response interceptor added
- [ ] Error handling added
- [ ] Docker setup working
- [ ] Basic testing done

---

## 🎯 Success Criteria

✅ `docker-compose up` brings up the service  
✅ Can create workspace → project → task → comment  
✅ All endpoints return Asana-style `{ data: ... }` format  
✅ Error handling works (404, 400, 500)  
✅ Swagger docs accessible at `/api`

---

## 📚 Reference Documents

- **Full Plan**: `IMPLEMENTATION_PLAN.md`
- **OpenAPI Guide**: `OPENAPI_GENERATION_GUIDE.md`
- **Asana API Spec**: https://raw.githubusercontent.com/Asana/openapi/master/defs/asana_oas.yaml

---

## ⏱️ Time Breakdown

- **Setup & Generation**: 15 min
- **Service Implementation**: 90 min
- **Docker & Testing**: 30 min
- **Buffer**: 45 min

**Total: ~3 hours**

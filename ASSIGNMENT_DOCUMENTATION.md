# Asana Backend Replica – Assignment Documentation

## Problem Statement
Build a backend service replicating core functionalities of Asana, following the official Asana REST API reference.

---

## Must-Have Requirements

### 1. API Implementation
- Implements all endpoints listed in the [Asana REST API reference](https://developers.asana.com/reference/rest-api-reference).
- Follows RESTful conventions and supports CRUD operations for all major entities: Workspaces, Projects, Tasks, Users, Teams, Tags, Sections, Goals, Stories, Memberships, etc.

### 2. Edge Case Handling
- Comprehensive validation and error handling for all endpoints.
- Handles missing fields, invalid data, duplicate entries, and permission errors.
- Consistent error response format for easy client integration.

### 3. Database Design
- Uses Prisma ORM for type-safe database access.
- Schema models all Asana entities and relationships (see `prisma/schema.prisma`).
- Supports referential integrity and efficient querying.

### 4. Containerization
- Fully dockerized setup.
- `docker-compose.yml` and `Dockerfile` provided.
- One command (`docker-compose up`) brings up the backend and database.

---

## Good-to-Have Requirements

### 1. Infrastructure as Code
- (Optional) Terraform scripts for cloud deployment (AWS/Azure/GCP).
- Easily adaptable for production environments.

### 2. Asana MCP Clone
- (Optional) Minimal MCP clone powered by this backend.
- Demonstrates extensibility and integration capabilities.

---

## Tech Stack & Design Choices
- **Backend Framework:** NestJS (TypeScript) for modular, scalable architecture.
- **Database:** PostgreSQL (via Prisma ORM).
- **Validation:** class-validator/class-transformer for DTO validation.
- **Testing:** Jest & Supertest for robust e2e coverage.
- **Containerization:** Docker & docker-compose.
- **API Documentation:** OpenAPI/Swagger annotations for auto-generated docs.

---

## Key Features
- **Strict DTO Validation:** All requests use `{ data: ... }` envelope for consistency.
- **Global Error Handling:** Unified error format for all endpoints.
- **Edge Case Coverage:** Tests and code handle all major and minor edge cases.
- **Minimal Response Shapes:** Responses return only necessary fields (e.g., `gid`, `name`).
- **Alias Normalization:** Controllers accept alternative field names for flexibility.
- **Comprehensive E2E Tests:** All endpoints and edge cases are covered in `test/app.e2e-spec.ts` and `test/generated-permutations.e2e-spec.ts`.

---

## How to Run
1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```
4. **Start with Docker:**
   ```bash
   docker-compose up --build
   ```
5. **Run tests:**
   ```bash
   npm run test:e2e
   ```

---

## Folder Structure
- `src/` – Main application code (controllers, services, DTOs)
- `prisma/` – Database schema and migrations
- `test/` – End-to-end test cases
- `Dockerfile`, `docker-compose.yml` – Containerization setup
- `README.md`, `QUICK_START.md` – Quick start and documentation

---

## Guidelines & Notes
- **License:** All dependencies are open-source and suitable for commercial use.
- **Typed Language:** TypeScript ensures maintainability and type safety.
- **No Proprietary Code:** All logic is original or adapted from open-source references.
- **Documentation:** Code is well-commented and follows best practices.
- **Video Demo:** Please refer to the submission video for a walkthrough.

---

## Support & Collaboration
- Regular check-ins and support available.
- AI tools used for code generation and validation.
- Open to feedback and further improvements.

---

## Contact
For any questions or support, please reach out via the provided communication channels.

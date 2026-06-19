process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgrespassword@localhost:5435/tasks_test_db';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DRIZZLE } from './../src/database/database.provider';
import type { DrizzleDB } from './../src/database/database.provider';
import { tasks } from './../src/database/schema';
import type { Task } from './../src/database/schema';
import { TaskStatus } from './../src/tasks/dto/create-task.dto';
import { AppModule } from './../src/app.module';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let db: DrizzleDB;
  let server: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.enableShutdownHooks();
    await app.init();
    db = moduleFixture.get<DrizzleDB>(DRIZZLE);
    server = app.getHttpServer() as App;
  });

  afterAll(async () => {
    try {
      await db.delete(tasks);
    } catch {
      // ignore table cleanup errors if db connection is already closed
    }
    await app.close();
  });

  let createdTaskId: number;

  describe('/tasks (POST)', () => {
    it('should create a task', async () => {
      const payload = {
        title: 'E2E Test Task',
        description: 'Testing tasks CRUD end-to-end',
      };

      const response = await request(server)
        .post('/tasks')
        .send(payload)
        .expect(201);

      const body = response.body as Task;
      expect(body).toHaveProperty('id');
      expect(body.title).toBe(payload.title);
      expect(body.description).toBe(payload.description);
      expect(body.status).toBe(TaskStatus.PENDING);

      createdTaskId = body.id;
    });

    it('should reject invalid payload', async () => {
      const payload = {
        description: 'Testing invalid missing title',
      };

      await request(server).post('/tasks').send(payload).expect(400);
    });
  });

  describe('/tasks (GET)', () => {
    it('should return all tasks', async () => {
      const response = await request(server).get('/tasks').expect(200);

      const body = response.body as Task[];
      expect(body).toBeInstanceOf(Array);
      expect(body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('/tasks/:id (GET)', () => {
    it('should return the created task', async () => {
      const response = await request(server)
        .get(`/tasks/${createdTaskId}`)
        .expect(200);

      const body = response.body as Task;
      expect(body.id).toBe(createdTaskId);
      expect(body.title).toBe('E2E Test Task');
    });

    it('should return 404 for unknown task ID', async () => {
      await request(server).get('/tasks/99999').expect(404);
    });
  });

  describe('/tasks/:id (PATCH)', () => {
    it('should update the task status', async () => {
      const payload = {
        status: TaskStatus.IN_PROGRESS,
      };

      const response = await request(server)
        .patch(`/tasks/${createdTaskId}`)
        .send(payload)
        .expect(200);

      const body = response.body as Task;
      expect(body.id).toBe(createdTaskId);
      expect(body.status).toBe(TaskStatus.IN_PROGRESS);
    });
  });

  describe('/tasks/:id (DELETE)', () => {
    it('should delete the task', async () => {
      await request(server).delete(`/tasks/${createdTaskId}`).expect(200);

      await request(server).get(`/tasks/${createdTaskId}`).expect(404);
    });
  });
});

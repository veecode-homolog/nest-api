import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { TaskService } from './../src/task/task.service';
import { TaskStatusEnum } from 'src/task/task.dto';
import { v4 as uuid } from 'uuid';

jest.mock('./../src/task/task.service');

const mockTasks = [
  {
    id: '7408b135-ba52-4daf-9ed9-7e11bac070d0',
    title: 'title example',
    description: 'description example',
    expirationDate: '2025-04-30T00:00:00.000Z',
    status: TaskStatusEnum.TO_DO,
  },
  {
    id: '258a9910-80b0-4c3a-a62a-b94fc56819e8',
    title: 'new title',
    description: 'description changed again',
    expirationDate: '2025-04-30T00:00:00.000Z',
    status: TaskStatusEnum.TO_DO,
  },
];

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let taskService: jest.Mocked<TaskService>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    taskService = moduleFixture.get(TaskService);
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/tasks (GET)', () => {
    taskService.getAllTasks.mockResolvedValue(mockTasks);

    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect(mockTasks);
  });

  it('/tasks/:id (GET)', () => {
    const taskId = '7408b135-ba52-4daf-9ed9-7e11bac070d0';
    const task = mockTasks.find((t) => t.id === taskId);

    if (!task) {
      throw new Error('Task not found');
    }

    taskService.getById.mockResolvedValue(task);

    return request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200)
      .expect(task);
  });

  it('/tasks (POST)', () => {
    const newTask = {
      id: uuid(),
      title: 'new title',
      description: 'new description',
      expirationDate: '2025-05-01T00:00:00.000Z',
      status: 'pending',
    };

    taskService.create.mockResolvedValue(newTask);

    return request(app.getHttpServer())
      .post('/tasks')
      .send(newTask)
      .expect(201)
      .expect(newTask);
  });

  it('/tasks/:id (PATCH)', () => {
    const taskId = '7408b135-ba52-4daf-9ed9-7e11bac070d0';
    const updatedTask = {
      title: 'partially updated title', // Apenas um campo foi alterado
    };

    const existingTask = {
      id: taskId,
      title: 'old title',
      description: 'old description',
      expirationDate: '2025-04-30T00:00:00.000Z',
      status: 'pending',
    };

    taskService.update.mockResolvedValue({
      ...existingTask,
      ...updatedTask,
    });

    return request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send(updatedTask)
      .expect(200)
      .expect({
        ...existingTask,
        ...updatedTask,
      });
  });

  it('/tasks/:id (DELETE)', () => {
    const taskId = '7408b135-ba52-4daf-9ed9-7e11bac070d0';

    taskService.delete.mockResolvedValue(undefined);

    return request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(204);
  });
});

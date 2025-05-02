/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskDto, TaskStatusEnum } from './task.dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockTask: TaskDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'A test task description',
    status: TaskStatusEnum.TO_DO,
    expirationDate: new Date().toISOString(),
  };

  const mockTaskService = {
    create: jest.fn().mockResolvedValue(mockTask),
    getAllTasks: jest.fn().mockResolvedValue([mockTask]),
    getById: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue(mockTask),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const { id, ...taskWithoutId } = mockTask;
      const result = await controller.create(taskWithoutId);
      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(taskWithoutId);
    });
  });

  describe('getAll', () => {
    it('should return all tasks', async () => {
      const params = { title: '', status: '' };
      const result = await controller.getAll(params);
      expect(result).toEqual([mockTask]);
      expect(service.getAllTasks).toHaveBeenCalledWith(params);
    });
  });

  describe('getById', () => {
    it('should return a task by id', async () => {
      const result = await controller.getById(mockTask.id);
      expect(result).toEqual(mockTask);
      expect(service.getById).toHaveBeenCalledWith(mockTask.id);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateData = { title: 'Updated Title' };
      const result = await controller.update(mockTask.id, updateData);
      expect(result).toEqual(mockTask);
      expect(service.update).toHaveBeenCalledWith(mockTask.id, updateData);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const result = await controller.delete(mockTask.id);
      expect(result).toBeUndefined();
      expect(service.delete).toHaveBeenCalledWith(mockTask.id);
    });
  });
});

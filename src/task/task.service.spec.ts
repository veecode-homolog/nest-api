/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from './task.service';
import { TaskEntity } from 'src/db/entities/task.entity';
import { TaskDto, TaskStatusEnum } from './task.dto';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';

describe('TaskService', () => {
  let taskService: TaskService;
  let taskRepository: Repository<TaskEntity>;

  const mockTaskRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    taskService = module.get<TaskService>(TaskService);
    taskRepository = module.get<Repository<TaskEntity>>(
      getRepositoryToken(TaskEntity),
    );
  });

  it('should be defined', () => {
    expect(taskService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const taskDto: Omit<TaskDto, 'id'> = {
        title: 'Test Task',
        description: 'Test Description',
        expirationDate: new Date().toDateString(),
        status: TaskStatusEnum.TO_DO,
      };

      const savedTask = { id: '1', ...taskDto };
      mockTaskRepository.save.mockResolvedValue(savedTask);

      const result = await taskService.create(taskDto);

      expect(mockTaskRepository.save).toHaveBeenCalledWith({
        ...taskDto,
        status: TaskStatusEnum.TO_DO,
      });
      expect(result).toEqual(savedTask);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks matching the search criteria', async () => {
      const tasks = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          expirationDate: new Date(),
          status: TaskStatusEnum.TO_DO,
        },
      ];

      mockTaskRepository.find.mockResolvedValue(tasks);

      const result = await taskService.getAllTasks({
        title: 'Test',
        status: TaskStatusEnum.TO_DO,
      });

      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { title: expect.stringContaining('Test') },
      });
      expect(result).toEqual(tasks);
    });
  });

  describe('getById', () => {
    it('should return a task by ID', async () => {
      const task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        expirationDate: new Date(),
        status: TaskStatusEnum.TO_DO,
      };

      mockTaskRepository.findOne.mockResolvedValue(task);

      const result = await taskService.getById('1');

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(task);
    });

    it('should throw an exception if task is not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(taskService.getById('1')).rejects.toThrow(
        new HttpException('Task 1 not found', 404),
      );
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        expirationDate: new Date(),
        status: TaskStatusEnum.TO_DO,
      };

      const updatedTask = { ...task, title: 'Updated Task' };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.update('1', { title: 'Updated Task' });

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockTaskRepository.update).toHaveBeenCalledWith('1', updatedTask);
      expect(result).toEqual(updatedTask);
    });

    it('should throw an exception if task is not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(
        taskService.update('1', { title: 'Updated Task' }),
      ).rejects.toThrow(new HttpException('Task 1 not found', 400));
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        expirationDate: new Date(),
        status: TaskStatusEnum.TO_DO,
      };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.delete.mockResolvedValue({ affected: 1 });

      await taskService.delete('1');

      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockTaskRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw an exception if task is not found', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(taskService.delete('1')).rejects.toThrow(
        new HttpException('Task 1 not found', 404),
      );
    });
  });
});

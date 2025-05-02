import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskEntity } from 'src/db/entities/task.entity';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { GetAllParams, TaskDto, TaskStatusEnum } from './task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  async create(task: Omit<TaskDto, 'id'>): Promise<TaskDto> {
    const newTask: Omit<TaskEntity, 'id'> = {
      title: task.title,
      description: task.description,
      expirationDate: task.expirationDate,
      status: TaskStatusEnum.TO_DO,
    };
    const createdTask = await this.taskRepository.save(newTask);
    return this.mapEntityToDto(createdTask);
  }

  async getAllTasks(params: GetAllParams): Promise<TaskDto[]> {
    const searchParams: FindOptionsWhere<TaskEntity> = {};

    if (params.title) searchParams.title = Like(`%${params.title}%`);

    if (params.status) searchParams.status = Like(`%${params.status}%`);

    const tasksFound = await this.taskRepository.find({
      where: searchParams,
    });

    return tasksFound.map((taskEntity) => this.mapEntityToDto(taskEntity));
  }

  async getById(id: string): Promise<TaskDto> {
    const foundTask = await this.taskRepository.findOne({ where: { id } });
    if (!foundTask) {
      throw new HttpException(`Task ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return this.mapEntityToDto(foundTask);
  }

  async update(id: string, taskUpdate: Partial<TaskDto>) {
    const taskFound = await this.taskRepository.findOne({ where: { id } });

    if (!taskFound) {
      throw new HttpException(`Task ${id} not found`, HttpStatus.BAD_REQUEST);
    }

    const updatedTask = { ...taskFound, ...taskUpdate };
    await this.taskRepository.update(id, updatedTask);
    return updatedTask;
  }

  async delete(id: string): Promise<void> {
    const foundTask = await this.taskRepository.findOne({ where: { id } });
    if (!foundTask) {
      throw new HttpException(`Task ${id} not found`, HttpStatus.NOT_FOUND);
    }
    const result = await this.taskRepository.delete(id);

    if (!result) {
      throw new HttpException(`Task ${id} not found`, HttpStatus.NOT_FOUND);
    }
  }

  private mapEntityToDto(taskEntity: TaskEntity): TaskDto {
    return {
      id: taskEntity.id,
      title: taskEntity.title,
      description: taskEntity.description,
      expirationDate: taskEntity.expirationDate,
      status: TaskStatusEnum[taskEntity.status] as string,
    };
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { GetAllParams, TaskDto } from './task.dto';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() task: Omit<TaskDto, 'id'>): Promise<TaskDto> {
    return await this.taskService.create(task);
  }

  @Get()
  async getAll(@Query() params: GetAllParams): Promise<TaskDto[]> {
    return await this.taskService.getAllTasks(params);
  }

  @Get('/:id')
  async getById(@Param('id') id: string): Promise<TaskDto> {
    return await this.taskService.getById(id);
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() taskUpdate: Partial<TaskDto>,
  ): Promise<TaskDto> {
    return await this.taskService.update(id, taskUpdate);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.taskService.delete(id);
  }
}

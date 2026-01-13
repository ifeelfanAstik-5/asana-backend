import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpCode, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskRequestDto } from './dto/create-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() body: CreateTaskRequestDto) {
    const payload = body.data;
    const result = await this.tasksService.createTask({
      name: payload.name,
      projectGid: payload.projectGid,
      workspaceGid: payload.workspaceGid,
      gid: payload.gid,
      notes: payload.notes,
      completed: payload.completed,
    });
    
    // Check if there was an error
    if (result && typeof result === 'object' && 'error' in result) {
      throw new BadRequestException(result.error);
    }
    
    return { gid: result.gid, name: result.name };
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  async list(@Query('project') projectGid?: string) {
    if (projectGid) {
      return this.tasksService.getByProject(projectGid);
    }
    return this.tasksService.listTasks();
  }

  @Get('project/:projectGid')
  @ApiOperation({ summary: 'List tasks by project' })
  async getByProject(@Param('projectGid') projectGid: string) {
    return this.tasksService.getByProject(projectGid);
  }

  @Get(':taskGid')
  @ApiOperation({ summary: 'Get task by GID' })
  async getById(@Param('taskGid') taskGid: string) {
    const task = await this.tasksService.getById(taskGid);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  @Patch(':taskGid')
  @ApiOperation({ summary: 'Update task' })
  async update(@Param('taskGid') taskGid: string, @Body() body: any) {
    const task = await this.tasksService.getById(taskGid);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    const payload = body && 'data' in body ? body.data : body;
    return this.tasksService.updateTask(taskGid, payload);
  }

  @Delete(':taskGid')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete task' })
  async delete(@Param('taskGid') taskGid: string) {
    const task = await this.tasksService.getById(taskGid);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return this.tasksService.deleteTask(taskGid);
  }
}

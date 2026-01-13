import { Controller, Get, Post, Body, Param, Query, Patch, Delete, HttpCode, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() body: CreateTaskDto) {
    const result = await this.tasksService.createTask({
      name: body.name,
      projectGid: body.projectGid,
      workspaceGid: body.workspaceGid,
      gid: body.gid,
      notes: body.notes,
      completed: body.completed,
    });
    
    // Check if there was an error
    if (result && typeof result === 'object' && 'error' in result) {
      throw new BadRequestException(result.error);
    }
    
    return result;
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
    return this.tasksService.updateTask(taskGid, body);
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

import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() body: any) {
    return this.tasksService.createTask(body);
  }

  @Get()
  @ApiOperation({ summary: 'List all tasks' })
  list() {
    return this.tasksService.listTasks();
  }




  @Get('project/:projectGid')
  @ApiOperation({ summary: 'List tasks by project' })
  getByProject(@Param('projectGid') projectGid: string) {
    return this.tasksService.getByProject(projectGid);
  }

  @Get(':taskGid')
  @ApiOperation({ summary: 'Get task by GID' })
  getById(@Param('taskGid') taskGid: string) {
    return this.tasksService.getByIdWrapped(taskGid);
  }
}

import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  private tasks: any[] = [];

  @Get()
  hello() {
    return { data: [] };
  }

  @Post()
  create(@Body() body: any) {
  if (!body.name) {
    return { error: 'Task name is required' };
  }

  const task = {
    gid: Date.now().toString(),
    name: body.name,
    completed: false,
    project: body.project ?? null,
  };

    return { data: task };
  }

  @Get('project/:projectGid')
  getByProject(@Param('projectGid') projectGid: string) {
  return {
    data: this.tasks.filter((task: any) => task.project === projectGid),
  };
}

}

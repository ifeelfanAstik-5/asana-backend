import { Controller, Post, Get, Body, Param, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalRequestDto } from './dto/create-goal.dto';

@Controller('goals')
export class GoalsController {
  constructor(private goalsService: GoalsService) {}

  @Post()
  async create(@Body() body: CreateGoalRequestDto) {
    const result = await this.goalsService.create(body.data);
    if (result.error) {
      throw new BadRequestException(result.message);
    }
    return { gid: result.gid, name: result.name };
  }

  @Get()
  findAll(@Query('workspaceGid') workspaceGid?: string) {
    return this.goalsService.findAll({ workspaceGid });
  }

  @Get(':gid')
  async findOne(@Param('gid') gid: string) {
    const goal = await this.goalsService.findOne(gid);
    if (!goal) {
      throw new NotFoundException(`Goal with gid ${gid} not found`);
    }
    return goal;
  }
}

import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() body: CreateUserDto) {
    const result = await this.usersService.createUser(body);
    if (result && typeof result === 'object' && 'error' in result) {
      throw new NotFoundException(result.error);
    }
    return result;
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  async list() {
    return this.usersService.listUsers();
  }

  @Get(':userGid')
  @ApiOperation({ summary: 'Get user by GID' })
  async getById(@Param('userGid') userGid: string) {
    const user = await this.usersService.getUserById(userGid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

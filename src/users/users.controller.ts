import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  create(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  list() {
    return this.usersService.listUsers();
  }

  @Get(':userGid')
  @ApiOperation({ summary: 'Get user by GID' })
  getById(@Param('userGid') userGid: string) {
    return this.usersService.getUserById(userGid);
  }
}

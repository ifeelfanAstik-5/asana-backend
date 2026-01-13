import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(payload: { name: string; email: string; photoUrl?: string; gid?: string }) {
    if (!payload || !payload.name || !payload.email) {
      return { error: 'Name and email are required' };
    }

    return this.prisma.user.create({
      data: {
        gid: payload.gid || crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        photoUrl: payload.photoUrl,
      },
    });
  }

  async listUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(userGid: string) {
    return this.prisma.user.findUnique({
      where: { gid: userGid },
    });
  }
}
